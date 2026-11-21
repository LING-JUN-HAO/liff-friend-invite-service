import liff from '@line/liff';
import { INVITE_TEXT, LIFF_URL } from './cardImage';

/**
 * 分享設定表：一種分享 = 一組（可多張）原始 flex message。
 * 結構完全自由，要加就把一段 flex 貼進來、給一個 key。
 * 用法：import { share } from '../utils/share'; 然後 share('moongame')
 */
// 官方帳號加好友連結，Basic ID（含 @）由環境變數 VITE_OA_BASIC_ID 提供
const officialAccountUrl = `https://line.me/R/ti/p/${encodeURIComponent(import.meta.env.VITE_OA_BASIC_ID)}`;

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
  if (result?.status === 'success') {
    liff.closeWindow();
  }
  return result;
};

// ── 政波卡 ──────────────────────────────────────────────────

const CHANGEVIBE_HERO_IMG_URL = 'https://res.cloudinary.com/dj4rwmdiu/image/upload/v1794013731/%E8%81%8A%E5%A4%A9%E5%AE%A4_jbs2jz.png';

/** 邀請朋友製作政波卡 */
export const shareChangeVibeInvite = async () => {
  const messages = [
    { type: 'text', text: INVITE_TEXT },
    {
      type: 'flex',
      altText: '一起成為改變南投的力量',
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
              url: CHANGEVIBE_HERO_IMG_URL,
              size: 'full',
              aspectRatio: '20:9',
              aspectMode: 'cover',
            },
            {
              type: 'box',
              layout: 'vertical',
              paddingTop: '24px',
              paddingStart: '20px',
              paddingEnd: '20px',
              paddingBottom: '20px',
              spacing: 'xl',
              contents: [
                {
                  type: 'text',
                  text: '一起成為改變南投的力量',
                  weight: 'bold',
                  size: '20px',
                  color: '#222222',
                  wrap: true,
                },
                {
                  type: 'text',
                  text: '輸入暱稱、選擇你和南投的關係，馬上完成專屬於你的政波卡。',
                  wrap: true,
                  size: '18px',
                  color: '#555555',
                },
                {
                  type: 'box',
                  layout: 'vertical',
                  height: '50px',
                  backgroundColor: '#01655B',
                  cornerRadius: '999px',
                  justifyContent: 'center',
                  alignItems: 'center',
                  margin: 'xl',
                  action: { type: 'uri', label: '加入政波', uri: officialAccountUrl },
                  contents: [{
                    type: 'text',
                    text: '加入政波',
                    color: '#FFFFFF',
                    weight: 'bold',
                    size: '18px',
                    align: 'center',
                  }],
                },
              ],
            },
          ],
        },
      },
    },
  ];
  return liff.shareTargetPicker(messages as any);
};

// ── 投票提醒邀請卡 ──────────────────────────────────────────

// 原圖最底下一列像素是透明的，在 Flex 白底上會露出一條白線：用 c_crop 裁掉，並轉成壓縮過的 JPEG（1.1MB → 約 90KB）
const INVITE_CARD_IMG_URL = 'https://res.cloudinary.com/dj4rwmdiu/image/upload/c_crop,g_north,w_822,h_1079/q_auto/v1795237354/%E6%8A%95%E7%A5%A8%E6%8F%90%E9%86%92_%E5%9C%96%E5%8D%A1_ri7yqp.jpg';
const COVER_IMG_URL = 'https://res.cloudinary.com/dj4rwmdiu/image/upload/v1795237356/%E6%8A%95%E7%A5%A8%E6%8F%90%E9%86%92_%E5%B0%81%E9%9D%A2_anw4kg.png';
const VOTE_LIFF_URL = `https://liff.line.me/${import.meta.env.VITE_LIFF_ID}#votereminder`;

/** 傳給邀請對象：Flex 文字疊在圖片上（position: absolute） */
export const shareVoteInvitee = async (person: string, inviteText: string) => {
  const messages = [
    { type: 'text', text: `我做了邀請卡，約${person}投票日一起出門！` },
    {
      type: 'flex',
      altText: `給${person}的投票邀請`,
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
              url: INVITE_CARD_IMG_URL,
              size: 'full',
              aspectMode: 'cover',
              aspectRatio: '822:1079', // 裁掉底部一列後的實際尺寸
            },
            {
              type: 'box',
              layout: 'vertical',
              position: 'absolute',
              offsetTop: '8%',
              offsetStart: '0px',
              offsetEnd: '0px',
              contents: [
                {
                  type: 'text',
                  text: `給${person}的邀請`,
                  weight: 'bold',
                  size: '32px',
                  color: '#2d4a1e',
                  align: 'center',
                },
                {
                  type: 'text',
                  text: inviteText,
                  wrap: true,
                  size: '24px',
                  weight: 'bold',
                  color: '#1a1a1a',
                  align: 'center',
                  margin: 'md',
                },
              ],
            },
          ],
        },
      },
    },
  ];
  return liff.shareTargetPicker(messages as any);
};

/** 邀請其他好友製作：分享製作入口給朋友 */
export const shareVoteCreate = async (person: string) => {
  const messages = [
    {
      type: 'text',
      text: `我剛做了一張邀請卡，約了${person}投票日一起出門！\n\n邀請你也來做一張，約你最想約的人，讓這份心意傳出去！`,
    },
    {
      type: 'flex',
      altText: '一起製作投票提醒邀請卡',
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
              url: COVER_IMG_URL,
              size: 'full',
              aspectMode: 'cover',
              aspectRatio: '822:367',
            },
            {
              type: 'box',
              layout: 'vertical',
              paddingTop: '20px',
              paddingStart: '20px',
              paddingEnd: '20px',
              paddingBottom: '20px',
              spacing: 'md',
              contents: [
                {
                  type: 'text',
                  text: '投票日，約你一起出門',
                  weight: 'bold',
                  size: '20px',
                  color: '#1a1a1a',
                },
                {
                  type: 'text',
                  text: '想約哪位親友一起去投票？挑個你們的小約定，邀請卡就幫你準備好了，傳給他吧！',
                  wrap: true,
                  size: '17px',
                  color: '#555555',
                },
                {
                  type: 'box',
                  layout: 'vertical',
                  height: '50px',
                  backgroundColor: '#01655B',
                  cornerRadius: '999px',
                  justifyContent: 'center',
                  alignItems: 'center',
                  margin: 'xl',
                  action: { type: 'uri', label: '開始製作', uri: officialAccountUrl },
                  contents: [{
                    type: 'text',
                    text: '開始製作',
                    color: '#FFFFFF',
                    weight: 'bold',
                    size: '18px',
                    align: 'center',
                  }],
                },
              ],
            },
          ],
        },
      },
    },
  ];
  return liff.shareTargetPicker(messages as any);
};
