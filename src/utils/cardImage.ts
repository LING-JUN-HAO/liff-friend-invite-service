// 政波卡圖片：截圖產生、分享圖片到其他社群 的共用邏輯

export const INVITE_TEXT = `我剛做了我的「政波卡」\n\n邀請你也一起來製作政波卡，讓希望擴散成波！\n\n一起成為改變南投的力量！`;
export const LIFF_URL = `https://liff.line.me/${import.meta.env.VITE_LIFF_ID}#changevibe`;

// 依螢幕像素比輸出，避免高解析度手機上卡片被放大而模糊；上限 3 以免圖檔過大
const captureOptions = {
  useCORS: true,
  scale: Math.min(Math.max(window.devicePixelRatio || 1, 2), 3),
  backgroundColor: null,
};

/** 等元素內所有圖片載入後截圖，回傳預覽用 dataURL 與分享用 File */
export const captureCard = async (el: HTMLElement) => {
  const images = Array.from(el.querySelectorAll('img'));
  await Promise.all(
    images.map(img =>
      img.complete
        ? Promise.resolve()
        : new Promise<void>(resolve => { img.onload = () => resolve(); img.onerror = () => resolve(); })
    )
  );
  const { default: html2canvas } = await import('html2canvas');
  const canvas = await html2canvas(el, captureOptions);
  const dataUrl = canvas.toDataURL('image/png');
  const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
  const file = blob ? new File([blob], '政波卡.png', { type: 'image/png' }) : null;
  return { dataUrl, file };
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
