<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import liff from '@line/liff';
import PrivacyOverlay from './PrivacyOverlay.vue';
import FormStep from './FormStep.vue';
import PreviewStep from './PreviewStep.vue';
import DoneStep from './DoneStep.vue';

type Step = 'form' | 'preview' | 'done';
const step = ref<Step>('form');

const avatarUrl = ref('');

// 表單資料
const nickname = ref('');
const personType = ref<'nantou' | 'other'>('nantou');
const township = ref('');
const agreedToTerms = ref(false);
const showPrivacyDetail = ref(false);

const stepTitles: Record<Step, string> = {
  'form': '匯入你的力量',
  'preview': '看你的政波',
  'done': '你成為政波了！',
};

watch(step, (s) => {
  document.title = stepTitles[s];
}, { immediate: true });

onMounted(async () => {
  if (import.meta.env.DEV) return;
  try {
    const profile = await liff.getProfile();
    avatarUrl.value = profile.pictureUrl ?? '';
    // 自動帶入 LINE 名稱（欄位上限 10 字；使用者已輸入就不覆蓋）
    if (!nickname.value) {
      let name = '';
      for (const ch of profile.displayName ?? '') {
        if (name.length + ch.length > 10) break;
        name += ch;
      }
      nickname.value = name;
    }
  } catch {}
});

const isNantou = computed(() => personType.value === 'nantou');


const onPersonTypeChange = (val: 'nantou' | 'other') => {
  personType.value = val;
  township.value = '';
};

const cardSubLabel = computed(() => {
  if (personType.value === 'other') return '我是南投之友';
  return township.value ? `我是${township.value}在地人` : '';
});

const canSubmitForm = computed(() => {
  if (!nickname.value.trim()) return false;
  if (isNantou.value && !township.value) return false;
  return agreedToTerms.value;
});

const goToPreview = () => { step.value = 'preview'; };
const backToForm = () => { step.value = 'form'; };
const confirmCard = () => { step.value = 'done'; };
</script>

<template>
  <div class="app-wrap">
    <PrivacyOverlay :show="showPrivacyDetail" @close="showPrivacyDetail = false" />

    <FormStep
      v-if="step === 'form'"
      :avatar-url="avatarUrl"
      :nickname="nickname"
      :person-type="personType"
      :township="township"
      :agreed-to-terms="agreedToTerms"
      :can-submit="canSubmitForm"
      @update:nickname="nickname = $event"
      @update:person-type="onPersonTypeChange"
      @update:township="township = $event"
      @update:agreed-to-terms="agreedToTerms = $event"
      @toggle-privacy="showPrivacyDetail = !showPrivacyDetail"
      @submit="goToPreview"
    />

    <PreviewStep
      v-else-if="step === 'preview'"
      :avatar-url="avatarUrl"
      :nickname="nickname"
      :card-sub-label="cardSubLabel"
      @confirm="confirmCard"
      @back="backToForm"
    />

    <DoneStep
      v-else-if="step === 'done'"
      :avatar-url="avatarUrl"
      :nickname="nickname"
      :card-sub-label="cardSubLabel"
    />
  </div>
</template>

<style scoped>
.app-wrap {
  min-height: 100vh;
  background: #f0f4f0;
  font-family: 'Noto Sans TC', system-ui, sans-serif;
  color: #2b2b2b;
}
</style>
