// 政波卡圖片：截圖產生、分享圖片到其他社群 的共用邏輯

export const INVITE_TEXT = `我剛做了我的「政波卡」\n\n邀請你也一起來製作政波卡，讓希望擴散成波！\n\n一起成為改變南投的力量！`;
export const LIFF_URL = `https://liff.line.me/${import.meta.env.VITE_LIFF_ID}#changevibe`;

// 依螢幕像素比輸出，避免高解析度手機上卡片被放大而模糊；上限 3 以免圖檔過大。
// 截圖當下才計算，跟快取 key 用的是同一個值
const captureScale = () => Math.min(Math.max(window.devicePixelRatio || 1, 2), 3);

export type CardCapture = { dataUrl: string; file: File | null };

const loadHtml2canvas = () => import('html2canvas');

const waitImage = (img: HTMLImageElement) =>
  img.complete
    ? Promise.resolve()
    : new Promise<void>(resolve => {
      img.addEventListener('load', () => resolve(), { once: true });
      img.addEventListener('error', () => resolve(), { once: true });
    });

// 網路字型還在下載時等一下，避免截到備用字型；最多等 1.5 秒，不讓字型卡住整個流程
const waitFonts = () => {
  const ready = document.fonts?.ready;
  if (!ready) return Promise.resolve();
  return Promise.race([ready.then(() => undefined), new Promise<void>(resolve => setTimeout(resolve, 1500))]);
};

const blobToDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

/**
 * 提早下載截圖會用到的圖片與 html2canvas，讓最後產生圖片時不用再等網路。
 * crossOrigin 要跟卡片上的 <img crossorigin="anonymous"> 一致，才會共用同一份快取。
 */
export const preloadCardAssets = (imageUrls: string[]) => {
  imageUrls.filter(Boolean).forEach(url => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;
  });
  loadHtml2canvas().catch(() => undefined);
};

/** 等元素內所有圖片與字型載入後截圖，回傳預覽用 dataURL 與分享用 File */
export const captureCard = async (el: HTMLElement): Promise<CardCapture> => {
  const [{ default: html2canvas }] = await Promise.all([
    loadHtml2canvas(),
    Promise.all(Array.from(el.querySelectorAll('img')).map(waitImage)),
    waitFonts(),
  ]);
  // 等待期間畫面可能已切換（例如預覽頁提前截圖時使用者按了下一步），元素不在畫面上就放棄
  if (!el.isConnected) throw new Error('卡片元素已不在畫面上');
  const canvas = await html2canvas(el, {
    useCORS: true,
    scale: captureScale(),
    backgroundColor: null,
    logging: false,
  });
  // 只編碼一次 PNG：預覽用的 dataURL 直接由同一份 Blob 讀出，不再呼叫 toDataURL 重新編碼
  const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
  if (!blob) return { dataUrl: canvas.toDataURL('image/png'), file: null };
  const dataUrl = await blobToDataUrl(blob);
  return { dataUrl, file: new File([blob], '政波卡.png', { type: 'image/png' }) };
};

// 最近一張卡的截圖結果：預覽頁先在背景產生、完成頁直接取用。
// 只留一筆，避免反覆返回修改時累積多張高解析度 PNG 佔用記憶體
let captureCache: { key: string; task: Promise<CardCapture> } | null = null;

// 除了卡片內容，畫面寬度、視窗高度（vh 排版）與輸出倍率也會影響截圖結果
const renderKey = (key: string, el: HTMLElement) =>
  JSON.stringify([key, el.offsetWidth, window.innerHeight, captureScale()]);

/**
 * 以 key 快取截圖結果：預覽頁先呼叫在背景產生，完成頁用同一個 key 取回。
 * key 要包含所有會影響卡片畫面的內容資料；失敗會從快取移除，之後可重試。
 */
export const captureCardCached = (key: string, el: HTMLElement): Promise<CardCapture> => {
  const fullKey = renderKey(key, el);
  if (captureCache?.key === fullKey) return captureCache.task;
  const task = captureCard(el);
  const entry = { key: fullKey, task };
  captureCache = entry;
  task.catch(() => { if (captureCache === entry) captureCache = null; });
  return task;
};

/** 完成頁用：優先取預覽頁背景產生的結果，失敗就用完成頁自己的卡片重新截圖 */
export const getCardCapture = (key: string, el: HTMLElement): Promise<CardCapture> =>
  captureCardCached(key, el).catch(() => captureCardCached(key, el));

/** 這個瀏覽器能不能直接把圖片檔交給系統分享選單 */
export const canShareImage = (file: File | null): file is File =>
  !!file && !!navigator.canShare?.({ files: [file] });

export type ShareImageResult = 'shared' | 'cancelled' | 'failed';

/**
 * 用系統分享選單帶入圖片。FB 不接受預填文字，所以同時把文案複製到剪貼簿讓使用者貼上。
 * 必須在點擊事件裡直接呼叫（前面不要 await），否則 iOS 會判定不是使用者觸發。
 */
export const shareImage = async (file: File): Promise<{ result: ShareImageResult; copied: boolean }> => {
  const copied = navigator.clipboard?.writeText(`${INVITE_TEXT}\n${LIFF_URL}`).then(() => true, () => false)
    ?? Promise.resolve(false);
  try {
    await navigator.share({ files: [file] });
    return { result: 'shared', copied: await copied };
  } catch (e) {
    if ((e as DOMException)?.name === 'AbortError') return { result: 'cancelled', copied: false };
    console.error(e);
    return { result: 'failed', copied: false };
  }
};

/** 外部瀏覽器分享頁的網址：帶上重新產生政波卡所需的資料 */
export const buildFbShareUrl = (card: { avatarUrl: string; nickname: string; cardSubLabel: string }) => {
  const params = new URLSearchParams({ a: card.avatarUrl, n: card.nickname, s: card.cardSubLabel });
  return `${window.location.origin}${window.location.pathname}#fbshare?${params}`;
};
