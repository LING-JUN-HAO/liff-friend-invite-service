<script setup lang="ts">
import { onMounted, ref } from 'vue';
import liff from '@line/liff';
import CardDisplay from './CardDisplay.vue';
import { captureCard } from '../../utils/cardImage';

const props = defineProps<{
  person: string;
  inviteText: string;
}>();

const LIFF_URL = `https://liff.line.me/${import.meta.env.VITE_LIFF_ID}#votereminder`;
const COVER_IMG_URL = 'https://res.cloudinary.com/dj4rwmdiu/image/upload/v1795237356/%E6%8A%95%E7%A5%A8%E6%8F%90%E9%86%92_%E5%B0%81%E9%9D%A2_anw4kg.png';
const CANDIDATE_URL = import.meta.env.VITE_CANDIDATE_URL || '';

const cardImageUrl = ref('');
const cardFile = ref<File | null>(null);

onMounted(async () => {
  const el = document.getElementById('vote-card-capture');
  if (!el) return;
  try {
    const { dataUrl, file } = await captureCard(el);
    cardImageUrl.value = dataUrl;
    cardFile.value = file;
  } catch (e) { console.error('卡片截圖失敗', e); }
});

const toastMessage = ref('');
let toastTimer: ReturnType<typeof setTimeout> | null = null;

const showToast = (msg: string) => {
  toastMessage.value = msg;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toastMessage.value = ''; }, 2500);
};

/** 傳給邀請對象：用系統分享直接傳合成圖片 */
const shareToInvitee = async () => {
  const file = cardFile.value;
  if (!file || !navigator.canShare?.({ files: [file] })) {
    showToast('此裝置不支援直接分享圖片');
    return;
  }
  try {
    await navigator.share({
      text: `我做了邀請卡，約${props.person}投票日一起出門！`,
      files: [file],
    });
  } catch (e: any) {
    if (e?.name !== 'AbortError') showToast(`分享失敗：${String(e)}`);
  }
};

/** 邀請其他好友製作：分享製作入口給朋友 */
const shareCreateInvite = async () => {
  try {
    const messages = [
      {
        type: 'text',
        text: `我剛做了一張邀請卡，約了${props.person}投票日一起出門！\n\n邀請你也來做一張，約你最想約的人，讓這份心意傳出去！`,
      },
      buildCreateCard(),
    ];
    const result = await liff.shareTargetPicker(messages as any);
    if (result?.status === 'success') {
      showToast('已成功分享！');
    }
  } catch (e) {
    showToast(`分享失敗：${String(e)}`);
  }
};

const openCandidateUrl = () => {
  if (!CANDIDATE_URL) return;
  liff.openWindow({ url: CANDIDATE_URL, external: false });
};


/** 創建邀請 Flex：分享「開始製作」按鈕給其他朋友 */
const buildCreateCard = () => ({
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
              action: { type: 'uri', label: '開始製作', uri: LIFF_URL },
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
});
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
