// 用 Canvas 直接畫卡片的共用工具：載圖、等字型、量 CSS 長度、換行與置中繪字。
// 取代 html2canvas：不用複製整份頁面、不用等複製出來的 iframe 載字型，手機上快很多。

export const CARD_FONT_FAMILY = `'Noto Sans TC', system-ui, sans-serif`;

// 依螢幕像素比輸出，避免高解析度手機上卡片被放大而模糊；上限 3 以免圖檔過大
export const canvasScale = () => Math.min(Math.max(window.devicePixelRatio || 1, 2), 3);

// ── 圖片 ─────────────────────────────────────────────

// 最多留幾張圖：底圖加上最近幾個頭貼就夠，避免不同頭貼網址一直累積
const IMAGE_CACHE_LIMIT = 6;
const IMAGE_TIMEOUT_MS = 8000;
const imageCache = new Map<string, Promise<HTMLImageElement | null>>();

/**
 * 以 CORS 模式載入圖片（畫進 canvas 後才能輸出 PNG）；同一網址只載一次。
 * 載入失敗回傳 null，由呼叫端決定要畫替代圖形。
 */
export const loadImage = (url: string): Promise<HTMLImageElement | null> => {
  if (!url) return Promise.resolve(null);
  const cached = imageCache.get(url);
  if (cached) return cached;
  const task = new Promise<HTMLImageElement | null>(resolve => {
    const img = new Image();
    // 請求卡住時不無限等待，當作失敗（底圖會報錯、頭貼改畫替代圓）
    const timer = setTimeout(() => resolve(null), IMAGE_TIMEOUT_MS);
    img.crossOrigin = 'anonymous';
    img.onload = () => { clearTimeout(timer); resolve(img); };
    img.onerror = () => { clearTimeout(timer); resolve(null); };
    img.src = url;
  });
  imageCache.set(url, task);
  if (imageCache.size > IMAGE_CACHE_LIMIT) imageCache.delete(imageCache.keys().next().value!);
  // 失敗的不留在快取，之後可重試
  task.then(img => { if (!img && imageCache.get(url) === task) imageCache.delete(url); });
  return task;
};

/** 提早下載卡片會用到的圖片，讓最後產生圖片時不用再等網路 */
export const preloadCardAssets = (imageUrls: string[]) => {
  imageUrls.forEach(url => { void loadImage(url); });
};

// ── 字型 ─────────────────────────────────────────────

/**
 * 先把要畫的字所需的網路字型載下來（Google Fonts 依字元切檔，只載用得到的部分），
 * 否則 canvas 會用備用字型畫。最多等 1.5 秒，不讓字型卡住整個流程。
 */
export const waitFonts = (specs: { font: string; text: string }[]): Promise<'loaded' | 'timeout' | 'unsupported'> => {
  const fonts = document.fonts;
  if (!fonts?.load) return Promise.resolve('unsupported');
  const loading = Promise.all(specs.map(s => fonts.load(s.font, s.text || ' ').catch(() => undefined)));
  return Promise.race([
    loading.then(() => 'loaded' as const),
    new Promise<'timeout'>(resolve => setTimeout(() => resolve('timeout'), 1500)),
  ]);
};

// ── CSS 長度 ────────────────────────────────────────

/** 把 CSS 長度（可含 vw、vh、clamp()）換算成目前視窗下的 px，跟畫面上的卡片用同一套算法 */
export const cssPx = (value: string): number => {
  const probe = document.createElement('div');
  probe.style.cssText = `position:absolute;visibility:hidden;pointer-events:none;left:0;top:0;height:0;width:${value}`;
  document.body.appendChild(probe);
  const px = probe.getBoundingClientRect().width;
  probe.remove();
  return px;
};

// ── 繪圖 ─────────────────────────────────────────────

export const createCanvas = (width: number, height: number) => {
  const scale = canvasScale();
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('無法建立 canvas');
  ctx.scale(scale, scale);
  return { canvas, ctx };
};

/** 圓角矩形路徑（不用 ctx.roundRect，舊版 iOS 不支援） */
export const roundRectPath = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
};

/** 等同 CSS object-fit: cover; object-position: center */
export const drawImageCover = (
  ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number,
) => {
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const sw = w / scale;
  const sh = h / scale;
  ctx.drawImage(img, (img.naturalWidth - sw) / 2, (img.naturalHeight - sh) / 2, sw, sh, x, y, w, h);
};

// ── 文字 ─────────────────────────────────────────────

export type TextStyle = {
  font: string; // canvas font 字串，例如 `700 16px ${CARD_FONT_FAMILY}`
  color: string;
  lineHeight: number; // px
  letterSpacing?: number; // px
  // 對應 CSS white-space：pre-wrap 保留空白與換行；normal 把連續空白（含換行）合併成一個空白
  whiteSpace?: 'pre-wrap' | 'normal';
};

// 不可出現在行首／行尾的標點（避頭尾），對齊瀏覽器的中文換行習慣
const NO_LINE_START = new Set('，。、！？；：）」』】〕》〉…—,.!?;:)]}%'.split(''));
const NO_LINE_END = new Set('（「『【〔《〈([{'.split(''));

// 以「使用者看到的一個字」（grapheme）為單位切字，避免把 emoji、旗幟、組合字拆開
const segmenter = typeof Intl !== 'undefined' && 'Segmenter' in Intl
  ? new Intl.Segmenter('zh-Hant', { granularity: 'grapheme' })
  : null;
export const graphemes = (text: string): string[] =>
  segmenter ? Array.from(segmenter.segment(text), s => s.segment) : Array.from(text);

// 斷行單位：連續的拉丁字母（含 é 等帶符號字母）與數字當成一個字，其餘（中文、標點、emoji、空白）一個字一個單位
const WORD_CHAR = /^[\p{Script=Latin}\p{N}@#&'_.\-]\p{M}*$/u;
const tokenize = (text: string) => {
  const tokens: string[] = [];
  let inWord = false;
  for (const g of graphemes(text)) {
    const isWord = WORD_CHAR.test(g);
    if (isWord && inWord) tokens[tokens.length - 1] += g;
    else tokens.push(g);
    inWord = isWord;
  }
  return tokens;
};

const isSpace = (token: string) => /^\s+$/.test(token);

const textWidth = (ctx: CanvasRenderingContext2D, text: string, letterSpacing = 0) =>
  ctx.measureText(text).width + letterSpacing * graphemes(text).length;

/**
 * 依最大寬度換行，回傳每一行文字。
 * 行尾的空白跟瀏覽器一樣「懸掛」：不佔寬度、不影響置中，所以直接去掉；
 * pre-wrap 時段落開頭與中間的空白照原樣保留。
 */
export const wrapText = (ctx: CanvasRenderingContext2D, style: TextStyle, text: string, maxWidth: number): string[] => {
  ctx.font = style.font;
  const ls = style.letterSpacing ?? 0;
  const paragraphs = style.whiteSpace === 'pre-wrap'
    ? text.split('\n')
    : [text.replace(/\s+/g, ' ').trim()];
  const lines: string[] = [];
  for (const paragraph of paragraphs) {
    let line: string[] = [];
    const lineWidth = (tokens: string[]) => textWidth(ctx, tokens.join('').trimEnd(), ls);
    for (const token of tokenize(paragraph)) {
      // 空白一律接在本行（行尾空白懸掛），所以換行後的下一行不會以空白開頭
      if (!line.length || isSpace(token) || lineWidth([...line, token]) <= maxWidth) {
        line.push(token);
        continue;
      }
      // 避頭：標點不放行首，把上一行最後一個字一起帶下來
      let carry: string[] = [];
      if (NO_LINE_START.has(token) && line.length > 1) carry = line.splice(-1);
      // 避尾：開括號不留在行尾
      while (line.length > 1 && NO_LINE_END.has(line[line.length - 1])) carry.unshift(...line.splice(-1));
      lines.push(line.join('').trimEnd());
      line = [...carry, token];
    }
    lines.push(line.join('').trimEnd());
  }
  return lines;
};

const baselineOffset = (ctx: CanvasRenderingContext2D, lineHeight: number) => {
  // 跟 CSS 一樣把字的上下高度（ascent + descent）置中在行高裡
  const m = ctx.measureText('國');
  const ascent = m.fontBoundingBoxAscent;
  const descent = m.fontBoundingBoxDescent;
  if (ascent === undefined || descent === undefined) return null;
  return (lineHeight - (ascent + descent)) / 2 + ascent;
};

/**
 * 從 top 開始逐行繪製，每行在 [left, right] 之間水平置中（等同 text-align: center）；
 * 行寬超過可用寬度時跟瀏覽器一樣靠左。
 */
export const drawLines = (
  ctx: CanvasRenderingContext2D, style: TextStyle, lines: string[], left: number, right: number, top: number,
) => {
  ctx.font = style.font;
  ctx.fillStyle = style.color;
  const ls = style.letterSpacing ?? 0;
  const offset = baselineOffset(ctx, style.lineHeight);
  ctx.textBaseline = offset === null ? 'middle' : 'alphabetic';
  lines.forEach((line, i) => {
    const lineTop = top + i * style.lineHeight;
    const y = offset === null ? lineTop + style.lineHeight / 2 : lineTop + offset;
    const width = textWidth(ctx, line, ls);
    let x = width > right - left ? left : left + (right - left - width) / 2;
    if (!ls) {
      ctx.fillText(line, x, y);
      return;
    }
    // canvas 的 letterSpacing 舊版 iOS 不支援，逐字畫
    for (const ch of graphemes(line)) {
      ctx.fillText(ch, x, y);
      x += ctx.measureText(ch).width + ls;
    }
  });
};
