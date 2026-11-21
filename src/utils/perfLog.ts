// 產圖效能的除錯紀錄：網址帶 debug（例如 ?debug=1）時才記錄並在完成頁顯示，一般使用者不受影響
import { ref } from 'vue';

// 每次都重新判斷：LIFF 開啟時參數先被編碼放在 liff.state 裡，初始化後網址才會還原
const safeDecode = (s: string) => { try { return decodeURIComponent(s); } catch { return s; } };
export const isPerfDebug = () => /[?&#]debug\b/.test(safeDecode(safeDecode(window.location.href)));

export const perfLines = ref<string[]>([]);

/** 記一筆：頁面開啟後的毫秒數＋事件名稱 */
export const perfMark = (label: string) => {
  if (!isPerfDebug()) return;
  perfLines.value = [...perfLines.value, `${String(Math.round(performance.now())).padStart(6)}ms  ${label}`];
};

/** 網路資源的下載時間（底圖、字型），用來判斷是不是網路慢 */
export const perfResources = () => {
  if (!isPerfDebug()) return [];
  return performance.getEntriesByType('resource')
    .filter(e => /cloudinary|gstatic|googleapis/.test(e.name))
    .map(e => {
      const r = e as PerformanceResourceTiming;
      const name = r.name.includes('cloudinary') ? '底圖' : r.name.includes('googleapis') ? '字型CSS' : '字型';
      return `${name} 開始${Math.round(r.startTime)} 耗時${Math.round(r.duration)}ms ${Math.round(r.transferSize / 1024)}KB`;
    });
};
