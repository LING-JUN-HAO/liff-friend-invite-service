// 投票邀請卡的 Canvas 繪製：版面數值對應 CardDisplay.vue 的 CSS，改版時兩邊要一起改
import {
  CARD_FONT_FAMILY, createCanvas, cssPx, drawImageCover, drawLines, loadImage, roundRectPath, waitFonts, wrapText,
  type TextStyle,
} from '../../utils/cardCanvas';
import { canvasToCapture } from '../../utils/cardImage';

// f_auto,q_auto：由 Cloudinary 依瀏覽器給 webp／avif 並壓縮（投票卡底圖 1.1MB → 約 65KB），手機下載快很多。
// c_crop：原圖最底下一列像素是透明的，裁掉避免卡片底部露出一條白線
export const IMG_URL = 'https://res.cloudinary.com/dj4rwmdiu/image/upload/c_crop,g_north,w_822,h_1079/f_auto,q_auto/v1795237354/%E6%8A%95%E7%A5%A8%E6%8F%90%E9%86%92_%E5%9C%96%E5%8D%A1_ri7yqp.png';

export type VoteCardData = { person: string; inviteText: string };

/** 截圖快取的 key：包含所有會影響卡片畫面的資料 */
export const cardCaptureKey = (card: VoteCardData) =>
  JSON.stringify(['votereminder', card.person, card.inviteText]);

/** 依卡片寬度（CSS px）畫出投票邀請卡 */
export const drawVoteCard = async (card: VoteCardData, width: number) => {
  const title = `給${card.person}的邀請`;
  const titleSize = cssPx('clamp(32px, 8vw, 60px)');
  const textSize = cssPx('clamp(16px, 5.5vw, 32px)');
  const titleStyle: TextStyle = {
    font: `700 ${titleSize}px ${CARD_FONT_FAMILY}`,
    color: '#2d4a1e',
    lineHeight: titleSize * 1.3,
    letterSpacing: titleSize * 0.05,
  };
  const textStyle: TextStyle = {
    font: `500 ${textSize}px ${CARD_FONT_FAMILY}`,
    color: '#2b2b2b',
    lineHeight: textSize * 1.65,
    whiteSpace: 'pre-wrap',
  };

  const [img] = await Promise.all([
    loadImage(IMG_URL),
    waitFonts([{ font: titleStyle.font, text: title }, { font: textStyle.font, text: card.inviteText }]),
  ]);
  if (!img) throw new Error('卡片底圖載入失敗');

  // .card__bg：寬 100%、max-height 62vh、object-fit: cover
  const height = Math.min(width * img.naturalHeight / img.naturalWidth, cssPx('62vh'));
  const { canvas, ctx } = createCanvas(width, height);

  // .card：圓角 20px、overflow hidden
  roundRectPath(ctx, 0, 0, width, height, 20);
  ctx.clip();
  drawImageCover(ctx, img, 0, 0, width, height);

  // .card__overlay：上方 40% 高、左右 padding 32px、內容垂直置中、間距 15px
  const left = 32;
  const right = width - 32;
  const titleLines = wrapText(ctx, titleStyle, title, right - left);
  const textLines = wrapText(ctx, textStyle, card.inviteText, right - left);
  const gap = 15;
  const contentHeight = titleLines.length * titleStyle.lineHeight + gap + textLines.length * textStyle.lineHeight;
  const top = (height * 0.4 - contentHeight) / 2;
  drawLines(ctx, titleStyle, titleLines, left, right, top);
  drawLines(ctx, textStyle, textLines, left, right, top + titleLines.length * titleStyle.lineHeight + gap);

  return canvas;
};

/** 產生投票邀請卡圖片（預覽 dataURL 與分享用 File） */
export const renderVoteCard = (card: VoteCardData) => async (width: number) =>
  canvasToCapture(await drawVoteCard(card, width), '投票邀請卡');
