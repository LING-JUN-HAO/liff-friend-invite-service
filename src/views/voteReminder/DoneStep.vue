<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import liff from '@line/liff';
import { getCardCapture } from '../../utils/cardImage';
import { cardCaptureKey, renderVoteCard } from './drawCard';
import { isPerfDebug, perfLines, perfMark, perfResources } from '../../utils/perfLog';
import { shareVoteInvitee, shareVoteCreate } from '../../utils/share';

const props = defineProps<{
  person: string;
  inviteText: string;
}>();

const CANDIDATE_URL = import.meta.env.VITE_CANDIDATE_URL || '';

const cardImageUrl = ref('');

// 卡片圖片的容器：用它的寬度（等於預覽頁卡片寬）畫圖，預覽頁背景產生的結果才能直接沿用
const cardBox = ref<HTMLElement | null>(null);

onMounted(async () => {
  perfMark('完成頁顯示');
  const width = cardBox.value?.clientWidth;
  if (!width) return;
  try {
    const { dataUrl } = await getCardCapture(cardCaptureKey(props), width, renderVoteCard({ ...props }));
    perfMark('取得圖片，交給 <img> 顯示');
    cardImageUrl.value = dataUrl;
  } catch (e) {
    perfMark(`產圖失敗：${String(e)}`);
    console.error('卡片截圖失敗', e);
  }
});

// 除錯面板（網址帶 debug 才顯示）：隨紀錄即時更新，卡住或失敗時也看得到停在哪一步
const debugText = computed(() => isPerfDebug() ? [
  `DPR ${window.devicePixelRatio}  視窗 ${window.innerWidth}x${window.innerHeight}`,
  ...perfLines.value,
  '— 網路 —',
  ...perfResources(),
  navigator.userAgent,
].join('\n') : '');
const onCardImageLoad = () => perfMark('圖片顯示完成');

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
    <!-- 長按可儲存的合成圖片 -->
    <div ref="cardBox">
      <img v-if="cardImageUrl" :src="cardImageUrl" class="card-preview" alt="投票邀請卡" @load="onCardImageLoad" />
      <div v-else class="card-placeholder" />
    </div>

    <p class="success-text">長按圖片可以直接儲存</p>

    <div class="btn-group">
      <button class="btn btn--green" @click="shareToInvitee">傳給{{ person }}</button>
      <button class="btn btn--teal" @click="shareCreateInvite">邀請其他好友製作</button>
      <button v-if="CANDIDATE_URL" class="btn btn--outline" @click="openCandidateUrl">認識候選人</button>
    </div>

    <pre v-if="debugText" class="debug-panel">{{ debugText }}</pre>

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

.debug-panel {
  margin: 12px 0 0;
  padding: 8px;
  background: #111;
  color: #9f9;
  font-size: 11px;
  line-height: 1.4;
  white-space: pre-wrap;
  word-break: break-all;
  border-radius: 8px;
}
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
