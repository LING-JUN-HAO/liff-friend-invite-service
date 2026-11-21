<script setup lang="ts">
import { onMounted, ref } from 'vue';
import liff from '@line/liff';
import CardDisplay, { cardCaptureKey } from './CardDisplay.vue';
import { getCardCapture } from '../../utils/cardImage';
import { shareVoteInvitee, shareVoteCreate } from '../../utils/share';

const props = defineProps<{
  person: string;
  inviteText: string;
}>();

const CANDIDATE_URL = import.meta.env.VITE_CANDIDATE_URL || '';

const cardImageUrl = ref('');

onMounted(async () => {
  const el = document.getElementById('vote-card-capture');
  if (!el) return;
  try {
    const { dataUrl } = await getCardCapture(cardCaptureKey(props), el);
    cardImageUrl.value = dataUrl;
  } catch (e) { console.error('卡片截圖失敗', e); }
});

const toastMessage = ref('');
let toastTimer: ReturnType<typeof setTimeout> | null = null;

const showToast = (msg: string) => {
  toastMessage.value = msg;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toastMessage.value = ''; }, 2500);
};

const shareToInvitee = async () => {
  try {
    const result = await shareVoteInvitee(props.person, props.inviteText);
    if (result?.status === 'success') showToast('已成功送出邀請！');
  } catch (e) {
    showToast(`分享失敗：${String(e)}`);
  }
};

const shareCreateInvite = async () => {
  try {
    const result = await shareVoteCreate(props.person);
    if (result?.status === 'success') showToast('已成功分享！');
  } catch (e) {
    showToast(`分享失敗：${String(e)}`);
  }
};

const openCandidateUrl = () => {
  if (!CANDIDATE_URL) return;
  liff.openWindow({ url: CANDIDATE_URL, external: false });
};
</script>

<template>
  <div class="stage">
    <!-- 隱藏版供 html2canvas 捕捉 -->
    <div class="card-offscreen">
      <CardDisplay :person="person" :invite-text="inviteText" />
    </div>

    <!-- 長按可儲存的合成圖片 -->
    <img v-if="cardImageUrl" :src="cardImageUrl" class="card-preview" alt="投票邀請卡" />
    <div v-else class="card-placeholder" />

    <p class="success-text">長按圖片可以直接儲存</p>

    <div class="btn-group">
      <button class="btn btn--green" @click="shareToInvitee">傳給{{ person }}</button>
      <button class="btn btn--teal" @click="shareCreateInvite">邀請其他好友製作</button>
      <button v-if="CANDIDATE_URL" class="btn btn--outline" @click="openCandidateUrl">認識候選人</button>
    </div>

    <Transition name="toast">
      <div v-if="toastMessage" class="toast">{{ toastMessage }}</div>
    </Transition>
  </div>
</template>

<style scoped>
.stage {
  position: relative;
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
  /* 跟預覽頁卡片同寬（.stage 內容寬），預覽頁背景產生的截圖才能直接沿用 */
  width: calc(100% - 40px);
}
.card-preview {
  width: 100%;
  border-radius: 20px;
  display: block;
}
.card-placeholder {
  width: 100%;
  aspect-ratio: 20 / 13;
  border-radius: 20px;
  background: #e9e9eb;
}
.success-text {
  text-align: center;
  color: #2b2b2b;
  font-size: 16px;
  margin-top: 12px;
  margin-bottom: 20px;
}
.btn-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: auto;
}
.btn {
  display: block;
  width: 100%;
  border: none;
  border-radius: 999px;
  padding: 15px;
  font-size: 17px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity .15s;
}
.btn--green { background: #4CAF50; color: #fff; }
.btn--teal { background: #01655B; color: #fff; }
.btn--outline { background: #fff; color: #444; border: 1.5px solid #d5d9de; font-weight: 400; }

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
  pointer-events: none;
  text-align: center;
}
.toast-enter-active, .toast-leave-active { transition: opacity .3s; }
.toast-enter-from, .toast-leave-to { opacity: 0; }
</style>
