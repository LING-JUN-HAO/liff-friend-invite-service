import liff from '@line/liff';

/**
 * 分享設定表：一種分享 = 一組（可多張）原始 flex message。
 * 結構完全自由，要加就把一段 flex 貼進來、給一個 key。
 * 用法：import { share } from '../utils/share'; 然後 share('moongame')
 */
const officialAccountUrl = 'https://line.me/R/ti/p/%40723znbzn';

export const SHARES = {
  // 「分享給好友玩」：立刻開始尋寶的邀請卡（連到 /moongame）
  moongame: [
    {
      type: 'flex',
      altText: '中秋尋物賀卡｜找出藏起來的中秋小物',
      contents: {
        type: 'bubble',
        size: 'giga',
        body: {
          type: 'box',
          layout: 'vertical',
          paddingAll: 'none',
          contents: [
            {
              type: 'image',
              url: 'https://res.cloudinary.com/dj4rwmdiu/image/upload/v1789306852/img01_cover_slewoq.png',
              size: 'full',
              aspectMode: 'cover',
              aspectRatio: '1644:734',
            },
            {
              type: 'box',
              layout: 'vertical',
              paddingTop: '12px',
              paddingStart: '16px',
              paddingEnd: '16px',
              paddingBottom: '12px',
              spacing: 'md',
              contents: [
                {
                  type: 'text',
                  text: '【南投尋兔趣】找出隱藏玉兔！',
                  weight: 'bold',
                  size: '20px',
                  wrap: true,
                },
                {
                  type: 'text',
                  text: '熱鬧的南投廟埕藏了 3 隻調皮玉兔 🐰',
                  wrap: true,
                  size: '17px',
                  color: '#333333',
                },
                {
                  type: 'text',
                  text: '點擊畫面把它們全部找出來，即可領取限量中秋賀卡！',
                  wrap: true,
                  size: '17px',
                  color: '#333333',
                },
                {
                  type: 'box',
                  layout: 'vertical',
                  height: '48px',
                  backgroundColor: '#00C853',
                  cornerRadius: '999px',
                  justifyContent: 'center',
                  alignItems: 'center',
                  margin: 'sm',
                  action: {
                    type: 'uri',
                    label: '立刻開始尋寶',
                    uri: officialAccountUrl,
                  },
                  contents: [
                    {
                      type: 'text',
                      text: '立刻開始尋寶',
                      color: '#FFFFFF',
                      weight: 'bold',
                      size: '18px',
                      align: 'center',
                    },
                  ],
                },
              ],
            },
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

export const share = async (key: keyof typeof SHARES) => {
  const messages = SHARES[key];
  const result = await liff.shareTargetPicker(messages as any);
  return result;
};

export const sendToChat = () => liff.sendMessages([
  {
    type: 'text',
    text: `🌕温世政祝大家中秋佳節愉快！\n\n月圓人團圓，祝福南投鄉親闔家平安、事事順心！\n\n世政準備了趣味尋寶小遊戲，邀大家一起找玉兔、領取專屬中秋賀卡🥮`,
  },
  { ...SHARES.moongame[0] } as any,
]);
