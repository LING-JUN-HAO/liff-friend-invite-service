<script setup lang="ts">
import { onMounted, ref } from 'vue';
import liff from '@line/liff';
import CardDisplay from './CardDisplay.vue';
import { shareOrDownload } from '../../utils/download';

const props = defineProps<{
  avatarUrl: string;
  nickname: string;
  cardSubLabel: string;
}>();


const buildAvatarBox = (url: string, outerSize: string, innerSize: string, padding: string) => ({
  type: 'box',
  layout: 'vertical',
  width: outerSize,
  height: outerSize,
  cornerRadius: '999px',
  backgroundColor: '#FFFFFF',
  paddingAll: padding,
  contents: [{
    type: 'box',
    layout: 'vertical',
    width: innerSize,
    height: innerSize,
    cornerRadius: '999px',
    contents: [{
      type: 'image',
      url: url.trim(),
      size: innerSize,
      aspectMode: 'cover',
      aspectRatio: '1:1',
    }],
  }],
});


const buildInviteCard = () => {
  const officialAccountUrl = 'https://line.me/R/ti/p/%40723znbzn';

  const nickname = props.nickname?.trim();

  const subLabel = props.cardSubLabel?.trim();

  const imageContents = props.avatarUrl?.startsWith('https://')
    ? [buildAvatarBox(props.avatarUrl, '88px', '78px', '5px')]
    : [{
        type: 'box',
        layout: 'vertical',
        width: '88px',
        height: '88px',
        cornerRadius: '999px',
        backgroundColor: '#FFFFFF',
        paddingAll: '5px',
        contents: [{
          type: 'box',
          layout: 'vertical',
          width: '78px',
          height: '78px',
          backgroundColor: '#C5CFDB',
          cornerRadius: '999px',
          contents: [],
        }],
      }];

  const memberInfo = [
    subLabel,
  ].filter(Boolean).join('・');

  return {
    type: 'flex',
    altText: `${nickname} 邀請你加入政波！`,
    contents: {
      type: 'bubble',
      size: 'mega',
      body: {
        type: 'box',
        layout: 'vertical',
        paddingAll: 'none',
        contents: [
          // 淺綠色會員區塊
          {
            type: 'box',
            layout: 'vertical',
            backgroundColor: '#E8F7ED',
            paddingAll: '24px',
            alignItems: 'center',
            contents: [
              ...imageContents,
              {
                type: 'text',
                text: '我是 ' + nickname,
                weight: 'bold',
                size: 'xl',
                color: '#222222',
                align: 'center',
                margin: 'lg',
                wrap: true,
              },
              ...(memberInfo
                ? [{
                    type: 'text',
                    text: memberInfo,
                    color: '#555555',
                    size: 'sm',
                    align: 'center',
                    margin: 'sm',
                    wrap: true,
                  }]
                : []),
            ],
          },

          // 淺綠分隔線
          {
            type: 'separator',
            color: '#A8D5B8',
          },

          // 下方邀請區塊
          {
            type: 'box',
            layout: 'vertical',
            backgroundColor: '#FFFFFF',
            paddingAll: '20px',
            contents: [
              {
                type: 'text',
                text: '我也加入政波',
                weight: 'bold',
                size: 'lg',
                color: '#222222',
              },
              {
                type: 'text',
                text: '30 秒做出專屬於你的政波卡',
                size: 'sm',
                color: '#666666',
                margin: 'sm',
                wrap: true,
              },

              {
                type: 'box',
                layout: 'vertical',
                backgroundColor: '#06C755',
                cornerRadius: '999px',
                paddingAll: '14px',
                margin: 'lg',
                action: {
                  type: 'uri',
                  label: '我也加入政波',
                  uri: officialAccountUrl,
                },
                contents: [{
                  type: 'text',
                  text: '我也加入政波',
                  color: '#FFFFFF',
                  weight: 'bold',
                  size: 'md',
                  align: 'center',
                }],
              },
            ],
          },
        ],
      },
    },
  };
};


const cardImageUrl = ref('');

// 依螢幕像素比輸出，避免高解析度手機上卡片被放大而模糊；上限 3 以免圖檔過大
const captureOptions = {
  useCORS: true,
  scale: Math.min(Math.max(window.devicePixelRatio || 1, 2), 3),
  backgroundColor: null,
};

onMounted(async () => {
  const el = document.getElementById('card-capture');
  if (!el) return;
  // 等卡片內所有圖片（背景圖、頭貼）載入完成再截圖
  const images = Array.from(el.querySelectorAll('img'));
  await Promise.all(
    images.map(img =>
      img.complete
        ? Promise.resolve()
        : new Promise<void>(resolve => { img.onload = () => resolve(); img.onerror = () => resolve(); })
    )
  );
  try {
    const { default: html2canvas } = await import('html2canvas');
    const canvas = await html2canvas(el, captureOptions);
    cardImageUrl.value = canvas.toDataURL('image/png');
  } catch (e) { console.error('卡片預覽產生失敗', e); }
});

const saveImage = async () => {
  const el = document.getElementById('card-capture');
  if (!el) return;
  try {
    const { default: html2canvas } = await import('html2canvas');
    const canvas = await html2canvas(el, captureOptions);
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      await shareOrDownload(blob, '政波卡.png');
    }, 'image/png');
  } catch (e) { console.error('儲存圖片失敗', e); }
};

const toastMessage = ref('');
let toastTimer: ReturnType<typeof setTimeout> | null = null;

const showToast = (msg: string) => {
  toastMessage.value = msg;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toastMessage.value = ''; }, 2500);
};

const inviteFriends = async () => {
  try {
    const inviteText = {
      type: 'text',
      text: `我成為政波了，你也一起來，讓希望擴散成波！\n#一股改變南投的力量`,
    };
    const result = await liff.shareTargetPicker([inviteText, buildInviteCard()] as any);
    if (result?.status === 'success') {
      showToast('已成功分享給朋友！');
    }
  } catch (e) {
    showToast(`分享失敗：${String(e)}`);
    console.error(e);
  }
};

</script>

<template>
  <div class="stage">
    <!-- 隱藏版供 html2canvas 捕捉 -->
    <div class="card-offscreen">
      <CardDisplay
        :avatar-url="avatarUrl"
        :nickname="nickname"
        :card-sub-label="cardSubLabel"
      />
    </div>

    <!-- 長按可儲存的圖片預覽 -->
    <img v-if="cardImageUrl" :src="cardImageUrl" class="card-preview" alt="政波卡" />
    <div v-else class="card-placeholder" />

    <p class="hint-text">傳出去，讓希望擴散成波🌊<br/>長按圖片也可以直接儲存</p>

    <div class="btn-group">
      <button class="btn btn--dark" @click="saveImage">儲存圖片</button>
      <button class="btn btn--green" @click="inviteFriends">分享給朋友</button>
    </div>

    <Transition name="toast">
      <div v-if="toastMessage" class="toast">{{ toastMessage }}</div>
    </Transition>
  </div>
</template>

<style scoped>
.stage {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 20px 20px 32px;
  background: #fff;
}
.card-offscreen {
  position: absolute;
  left: -9999px;
  top: 0;
  pointer-events: none;
  width: calc(100vw - 40px);
}
.card-preview {
  width: 100%;
  border-radius: 20px;
  display: block;
}
.card-placeholder {
  width: 100%;
  aspect-ratio: 9 / 16;
  border-radius: 20px;
  background: #e9e9eb;
}
.hint-text {
  text-align: center;
  color: #888;
  font-size: 13px;
  line-height: 1.7;
  margin: 16px 0;
}
.btn-group {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-top: auto;
  padding-top: 8px;
}
.btn {
  display: block;
  width: 100%;
  border: none;
  border-radius: 999px;
  padding: 15px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity .15s;
  margin-top: 12px;
}
.btn--dark { background: #01655B; color: #fff; }
.btn--green { background: #06C755; color: #fff; }

.toast {
  position: fixed;
  bottom: 32px;
  left: 16px;
  right: 16px;
  background: rgba(0,0,0,.75);
  color: #fff;
  font-size: 14px;
  padding: 10px 16px;
  border-radius: 12px;
  white-space: pre-wrap;
  word-break: break-all;
  pointer-events: none;
}
.toast-enter-active, .toast-leave-active { transition: opacity .3s; }
.toast-enter-from, .toast-leave-to { opacity: 0; }
</style>
