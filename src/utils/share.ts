import liff from '@line/liff';

/**
 * 分享設定表：一種分享 = 一組（可多張）原始 flex message。
 * 結構完全自由，要加就把一段 flex 貼進來、給一個 key。
 * 用法：import { share } from '../utils/share'; 然後 share('moongame')
 */
const officialAccountUrl = 'https://line.me/R/ti/p/%40723znbzn';
const LIFF_ID = import.meta.env.VITE_LIFF_ID as string;
const gameUrl = `https://liff.line.me/${LIFF_ID}?p=moongame`;

export const SHARES = {
  // 「分享給好友玩」：立刻開始尋寶的邀請卡（連到 /moongame）
  // TODO 有入口圖後，在 contents 最前面加一個 { type:'image', url:'<Cloudinary>', size:'full', aspectRatio:'1:1' }
  moongame: [
    {
      type: 'flex',
      altText: '南投尋兔趣｜找出隱藏玉兔',
      contents: {
        type: 'bubble',
        size: 'giga',
        body: {
          type: 'box', layout: 'vertical', paddingAll: '16px', spacing: 'md',
          contents: [
            { type: 'text', text: '🐰 南投尋兔趣', weight: 'bold', size: 'xl' },
            { type: 'text', text: '熱鬧的南投廟埕前藏了 3 隻調皮玉兔，快來找找看，領取限量中秋賀卡！', wrap: true, size: 'sm', color: '#666666' },
            { type: 'button', style: 'primary', color: '#06C755', action: { type: 'uri', label: '立刻開始尋寶', uri: gameUrl } },
          ],
        },
      },
    },
  ],

  // 認識温醫師小測驗（整張圖就是連結）
  moonquiz: [
    {
      type: 'flex',
      altText: '你有多認識温醫師？來試試看吧',
      contents: {
        type: 'bubble',
        size: 'giga',
        body: {
          type: 'box', layout: 'vertical', paddingAll: 'none',
          contents: [
            {
              type: 'image',
              url: 'https://res.cloudinary.com/dj4rwmdiu/image/upload/v1786810208/Q01_nrlyt7.png',
              size: 'full',
              aspectRatio: '1040:768',
              action: { type: 'uri', label: '你有多認識温醫師？來試試看吧', uri: officialAccountUrl },
            },
          ],
        },
      },
    },
  ],

  // 端午護牙大挑戰（原本的分享圖卡）
  duanwu: [
    {
      type: 'flex',
      altText: '溫醫師的端午護牙大挑戰',
      contents: {
        type: 'bubble',
        size: 'giga',
        body: {
          type: 'box', layout: 'vertical', paddingAll: 'none',
          contents: [
            {
              type: 'image',
              url: 'https://res.cloudinary.com/dseg0uwc9/image/upload/v1780279859/%E8%B1%AA%E5%B6%BC%20linebot%20%E5%B7%A5%E4%BD%9C/%E8%AD%B7%E7%89%99-01_bfm6nj.png',
              size: 'full',
              aspectRatio: '1040:768',
              action: { type: 'uri', label: '溫醫師的端午護牙大挑戰', uri: officialAccountUrl },
            },
          ],
        },
      },
    },
  ],
} as const;


