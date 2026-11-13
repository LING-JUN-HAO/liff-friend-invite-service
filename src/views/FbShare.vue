<script setup lang="ts">
// 外部瀏覽器的政波卡分享頁：LINE 內建瀏覽器不支援分享圖檔，
// 從 LINE 跳到這頁後，用網址帶來的資料重新產生政波卡，再交給系統分享選單（可選 Facebook）
import { onMounted, ref } from 'vue';
import CardDisplay from './changeVibe/CardDisplay.vue';
import { canShareImage, captureCard, shareImage } from '../utils/cardImage';

const query = new URLSearchParams(window.location.hash.split('?')[1] ?? '');
const avatarUrl = query.get('a') ?? '';
const nickname = query.get('n') ?? '';
const cardSubLabel = query.get('s') ?? '';

const cardImageUrl = ref('');
const cardFile = ref<File | null>(null);
const supported = ref(true);

onMounted(async () => {
  document.title = '分享政波卡';
  const el = document.getElementById('card-capture');
  if (!el) return;
  try {
    const { dataUrl, file } = await captureCard(el);
    cardImageUrl.value = dataUrl;
    cardFile.value = file;
    supported.value = canShareImage(file);
  } catch (e) { console.error('卡片產生失敗', e); }
});

const toastMessage = ref('');
let toastTimer: ReturnType<typeof setTimeout> | null = null;
const showToast = (msg: string) => {
  toastMessage.value = msg;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toastMessage.value = ''; }, 2500);
};

const onShare = async () => {
  const file = cardFile.value;
  if (!canShareImage(file)) {
    showToast('這個瀏覽器不支援直接分享圖片\n請長按圖片儲存後，到 FB 發文上傳');
    return;
  }
  const { result, copied } = await shareImage(file);
  if (result === 'shared' && copied) showToast('文案已複製，發文時可直接貼上');
  if (result === 'failed') showToast('分享失敗，請長按圖片儲存後到 FB 發文上傳');
};
</script>

<template>
  <div class="stage">
    <div class="card-offscreen">
      <CardDisplay :avatar-url="avatarUrl" :nickname="nickname" :card-sub-label="cardSubLabel" />
    </div>

    <img v-if="cardImageUrl" :src="cardImageUrl" class="card-preview" alt="政波卡" />
    <div v-else class="card-placeholder" />

    <p class="hint-text">
      <template v-if="supported">按下按鈕選擇 <strong class="hint-text__em">Facebook</strong><br/>文案會自動複製，發文時貼上即可</template>
      <template v-else><strong class="hint-text__em">長按圖片</strong>儲存政波卡<br/>再到 FB 發文上傳</template>
    </p>

    <div class="btn-group">
      <button class="btn btn--fb" :disabled="!cardFile" @click="onShare">
        {{ cardFile ? '分享圖片到其他社群' : '政波卡產生中…' }}
      </button>
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
  box-sizing: border-box;
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
  margin-top: 12px;
}
.btn:disabled { opacity: .6; cursor: default; }
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
  text-align: center;
}
.toast-enter-active, .toast-leave-active { transition: opacity .2s; }
.toast-enter-from, .toast-leave-to { opacity: 0; }
</style>
