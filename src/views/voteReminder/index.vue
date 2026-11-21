<script setup lang="ts">
import { ref } from 'vue';
import Step1Who from './Step1Who.vue';
import Step2Activity from './Step2Activity.vue';
import PreviewStep from './PreviewStep.vue';
import DoneStep from './DoneStep.vue';

type Step = 'step1' | 'step2' | 'preview' | 'done';

type CardData = {
  person: string;
  inviteText: string;
};

const step = ref<Step>('step1');
const cardData = ref<CardData>({ person: '', inviteText: '' });

// const stepTitles: Record<Step, string> = {
//   step1: '投票提醒',
//   step2: '投票提醒',
//   preview: '確認邀請卡',
//   done: '邀請卡完成！',
// };

// watch(step, (s) => {
//   document.title = stepTitles[s];
// }, { immediate: true });

const onStep1Submit = (person: string) => {
  cardData.value = { ...cardData.value, person };
  step.value = 'step2';
};

const onStep2Submit = (data: CardData) => {
  cardData.value = data;
  step.value = 'preview';
};

const onConfirm = () => { step.value = 'done'; };
const backToStep1 = () => { step.value = 'step1'; };
const backToStep2 = () => { step.value = 'step2'; };
</script>

<template>
  <div class="app-wrap">
    <Step1Who
      v-if="step === 'step1'"
      @submit="onStep1Submit"
    />
    <Step2Activity
      v-else-if="step === 'step2'"
      :person="cardData.person"
      @submit="onStep2Submit"
      @back="backToStep1"
    />
    <PreviewStep
      v-else-if="step === 'preview'"
      :person="cardData.person"
      :invite-text="cardData.inviteText"
      @confirm="onConfirm"
      @back="backToStep2"
    />
    <DoneStep
      v-else-if="step === 'done'"
      :person="cardData.person"
      :invite-text="cardData.inviteText"
    />
  </div>
</template>

<style scoped>
.app-wrap {
  min-height: 100vh;
  font-family: 'Noto Sans TC', system-ui, sans-serif;
  color: #2b2b2b;
}
</style>
