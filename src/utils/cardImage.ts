// 卡片圖片：產圖結果快取、分享圖片到其他社群 的共用邏輯
import { canvasScale } from './cardCanvas';

export const INVITE_TEXT = `我剛做了我的「政波卡」\n\n邀請你也一起來製作政波卡，讓希望擴散成波！\n\n一起成為改變南投的力量！`;
export const LIFF_URL = `https://liff.line.me/${import.meta.env.VITE_LIFF_ID}#changevibe`;

// partial：有素材沒載到（例如頭貼），圖仍可先顯示，但不留在快取，之後會重畫
export type CardCapture = { dataUrl: string; file: File | null; partial?: boolean };

const blobToDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

/** 把畫好的 canvas 轉成預覽用 dataURL 與分享用 File；PNG 只編碼一次，dataURL 由同一份 Blob 讀出 */
export const canvasToCapture = async (canvas: HTMLCanvasElement, fileName: string, partial = false): Promise<CardCapture> => {
  const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
  if (!blob) return { dataUrl: canvas.toDataURL('image/png'), file: null, partial };
  const dataUrl = await blobToDataUrl(blob);
  return { dataUrl, file: new File([blob], fileName, { type: 'image/png' }), partial };
};

// 最近一張卡的產圖結果：預覽頁先在背景產生、完成頁直接取用。
// 只留一筆，避免反覆返回修改時累積多張高解析度 PNG 佔用記憶體
let captureCache: { key: string; task: Promise<CardCapture> } | null = null;

/**
 * 以 key 快取產圖結果：預覽頁先呼叫在背景產生，完成頁用同一個 key 取回。
 * key 要包含所有會影響卡片畫面的內容資料；卡片寬度、視窗尺寸（vw／vh 排版）與輸出倍率由這裡補上。
 * 失敗會從快取移除，之後可重試。
 */
export const renderCardCached = (
  key: string, width: number, render: (width: number) => Promise<CardCapture>,
): Promise<CardCapture> => {
  const fullKey = JSON.stringify([key, width, window.innerWidth, window.innerHeight, canvasScale()]);
  if (captureCache?.key === fullKey) return captureCache.task;
  const task = render(width);
  const entry = { key: fullKey, task };
  captureCache = entry;
  const drop = () => { if (captureCache === entry) captureCache = null; };
  task.then(result => { if (result.partial) drop(); }, drop);
  return task;
};

/** 完成頁用：優先取預覽頁背景產生的結果；失敗或有素材沒載到就重畫一次 */
export const getCardCapture = async (
  key: string, width: number, render: (width: number) => Promise<CardCapture>,
): Promise<CardCapture> => {
  const first = await renderCardCached(key, width, render).catch(() => null);
  if (first && !first.partial) return first;
  return renderCardCached(key, width, render).catch(error => {
    if (first) return first;
    throw error;
  });
};

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
