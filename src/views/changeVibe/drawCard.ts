// 政波卡的 Canvas 繪製：版面數值對應 CardDisplay.vue 的 CSS，改版時兩邊要一起改
import {
  CARD_FONT_FAMILY, createCanvas, drawImageCover, drawLines, loadImage, roundRectPath, waitFonts, wrapText,
  type TextStyle,
} from '../../utils/cardCanvas';
import { canvasToCapture } from '../../utils/cardImage';

export const BG_URL = 'https://res.cloudinary.com/dj4rwmdiu/image/upload/v1794013736/%E6%94%BF%E6%B3%A2%E5%8D%A1_sr5fzy.png';

export type ChangeVibeCardData = { avatarUrl: string; nickname: string; cardSubLabel: string };

/** 截圖快取的 key：包含所有會影響卡片畫面的資料 */
export const cardCaptureKey = (card: ChangeVibeCardData) =>
  JSON.stringify(['changevibe', card.avatarUrl, card.nickname, card.cardSubLabel]);

const SLOGAN = '一起成為改變南投的力量';

const textStyle = (color: string): TextStyle => ({
  font: `700 16px ${CARD_FONT_FAMILY}`,
  color,
  lineHeight: 16 * 1.3,
});

/** 依卡片寬度（CSS px）畫出政波卡 */
export const drawChangeVibeCard = async (card: ChangeVibeCardData, width: number) => {
  const name = `我是 ${card.nickname}`;
  const nameStyle = textStyle('#1a1a1a');
  const identityStyle = textStyle('#333');
  const sloganStyle = textStyle('#0B5E4E');

  const [bg, avatar] = await Promise.all([
    loadImage(BG_URL),
    // 頭貼偶爾會因網路不穩載不到，重試一次（失敗的不會留在圖片快取裡）
    loadImage(card.avatarUrl).then(img => img ?? loadImage(card.avatarUrl)),
    waitFonts([{ font: nameStyle.font, text: name + card.cardSubLabel + SLOGAN }]),
  ]);
  if (!bg) throw new Error('卡片底圖載入失敗');

  const height = width * bg.naturalHeight / bg.naturalWidth;
  const { canvas, ctx } = createCanvas(width, height);

  // .card：圓角 20px、overflow hidden
  roundRectPath(ctx, 0, 0, width, height, 20);
  ctx.clip();
  ctx.drawImage(bg, 0, 0, width, height);

  // .card__avatar：寬 40%、圓形、object-fit: cover，中心在 (50%, 38.5%)；沒有頭貼畫半透明白圓
  const size = width * 0.4;
  const cx = width / 2;
  const cy = height * 0.385;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
  ctx.clip();
  if (avatar) {
    drawImageCover(ctx, avatar, cx - size / 2, cy - size / 2, size, size);
  } else {
    // 沒有頭貼或頭貼載不到：畫跟 .card__avatar--placeholder 一樣的半透明白圓
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(cx - size / 2, cy - size / 2, size, size);
  }
  ctx.restore();

  // .card__name／.card__identity：左右 padding 24px，整段文字垂直中心在 67.8%／75.1%
  const drawCentered = (style: TextStyle, text: string, centerY: number) => {
    const lines = wrapText(ctx, style, text, width - 48);
    drawLines(ctx, style, lines, 24, width - 24, centerY - lines.length * style.lineHeight / 2);
  };
  drawCentered(nameStyle, name, height * 0.678);
  drawCentered(identityStyle, card.cardSubLabel, height * 0.751);

  // .card__slogan：白底蓋掉底圖原本的字，left 21%、right 22.5%、top 79.6%、高 5.4%，文字不換行置中
  const sx = width * 0.21;
  const sw = width * (1 - 0.21 - 0.225);
  const sy = height * 0.796;
  const sh = height * 0.054;
  ctx.fillStyle = '#fff';
  ctx.fillRect(sx, sy, sw, sh);
  ctx.font = sloganStyle.font;
  const sloganWidth = ctx.measureText(SLOGAN).width;
  // flex 置中的不換行文字，超出時兩側平均溢出
  drawLines(ctx, sloganStyle, [SLOGAN], sx + (sw - sloganWidth) / 2, sx + (sw + sloganWidth) / 2, sy + (sh - sloganStyle.lineHeight) / 2);

  return { canvas, partial: !!card.avatarUrl && !avatar };
};

/** 產生政波卡圖片（預覽 dataURL 與分享用 File） */
export const renderChangeVibeCard = (card: ChangeVibeCardData) => async (width: number) => {
  const { canvas, partial } = await drawChangeVibeCard(card, width);
  return canvasToCapture(canvas, '政波卡.png', partial);
};
