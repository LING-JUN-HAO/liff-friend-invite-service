<script setup lang="ts">
import { onMounted, ref } from 'vue';
import liff from '@line/liff';
import CardDisplay from './CardDisplay.vue';
import { INVITE_TEXT, LIFF_URL, buildFbShareUrl, canShareImage, captureCard, shareImage } from '../../utils/cardImage';

const props = defineProps<{
  avatarUrl: string;
  nickname: string;
  cardSubLabel: string;
}>();


const HERO_IMAGE_URL = 'https://res.cloudinary.com/dj4rwmdiu/image/upload/v1794013731/%E8%81%8A%E5%A4%A9%E5%AE%A4_jbs2jz.png';

const buildInviteCard = () => ({
  type: 'flex',
  altText: '一起成為改變南投的力量',
  contents: {
    type: 'bubble',
    size: 'giga',
    hero: {
      type: 'image',
      url: HERO_IMAGE_URL,
      size: 'full',
      aspectRatio: '20:9',
      aspectMode: 'cover',
      action: { type: 'uri', label: '加入政波', uri: LIFF_URL },
    },
    body: {
      type: 'box',
      layout: 'vertical',
      paddingAll: 'none',
      contents: [{
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
            action: { type: 'uri', label: '加入政波', uri: LIFF_URL },
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
      }],
    },
  },
});


const cardImageUrl = ref('');
// 預先轉好的圖檔：按下按鈕時直接呼叫系統分享，避免 await 轉檔讓 iOS 判定不是使用者觸發
const cardFile = ref<File | null>(null);

onMounted(async () => {
  const el = document.getElementById('card-capture');
  if (!el) return;
  try {
    const { dataUrl, file } = await captureCard(el);
    cardImageUrl.value = dataUrl;
    cardFile.value = file;
  } catch (e) { console.error('卡片預覽產生失敗', e); }
});

const toastMessage = ref('');
let toastTimer: ReturnType<typeof setTimeout> | null = null;

const showToast = (msg: string) => {
  toastMessage.value = msg;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toastMessage.value = ''; }, 2500);
};

// 分享圖片到 FB：瀏覽器支援就直接跳系統分享選單；
// LINE 內建瀏覽器不支援分享圖檔，改開外部瀏覽器的分享頁（在那邊重新產生政波卡再分享）
const shareCardImage = async () => {
  const file = cardFile.value;
  if (canShareImage(file)) {
    const { result, copied } = await shareImage(file);
    if (result === 'shared' && copied) showToast('文案已複製，發文時可直接貼上');
    if (result === 'failed') showToast('分享失敗，請長按圖片儲存後到 FB 發文上傳');
    return;
  }
  liff.openWindow({
    url: buildFbShareUrl({ avatarUrl: props.avatarUrl, nickname: props.nickname, cardSubLabel: props.cardSubLabel }),
    external: true,
  });
};

const inviteFriends = async () => {
  try {
    const inviteText = {
      type: 'text',
      text: INVITE_TEXT,
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

    <p class="hint-text">傳出去，讓希望擴散成波🌊<br/><strong class="hint-text__em">長按圖片</strong>可以直接儲存政波卡</p>

    <div class="btn-group">
      <button class="btn btn--green" @click="inviteFriends">分享給朋友</button>
      <button class="btn btn--fb" @click="shareCardImage">分享圖片到 FB</button>
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
  color: #2b2b2b;
  font-size: 18px;
  line-height: 1.7;
  margin-top: auto;
  margin-bottom: 16px;
  padding-top: 16px;
}
.hint-text__em {
  color: #0B5E4E;
  font-weight: 700;
}
.btn-group {
  display: flex;
  flex-direction: column;
  gap: 0;
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
.btn--green { background: #06C755; color: #fff; }
.btn--fb { background: #1877F2; color: #fff; }

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
