<script setup lang="ts">
import { onMounted } from 'vue';
import CardDisplay from './CardDisplay.vue';
import { cardCaptureKey, renderVoteCard } from './drawCard';
import { renderCardCached } from '../../utils/cardImage';

const props = defineProps<{
  person: string;
  inviteText: string;
}>();

defineEmits<{
  confirm: [];
  back: [];
}>();

// 使用者看預覽時就在背景先產生圖片，按下產生邀請卡後完成頁可以直接顯示
onMounted(() => {
  const el = document.getElementById('vote-card-capture');
  if (el) renderCardCached(cardCaptureKey(props), el.offsetWidth, renderVoteCard({ ...props })).catch(() => undefined);
});
</script>

<template>
  <div class="stage">
    <CardDisplay :person="person" :invite-text="inviteText" />

    <p class="hint-text">確認沒問題後送出</p>

    <div class="btn-group">
      <button class="btn btn--green" @click="$emit('confirm')">產生邀請卡</button>
      <button class="btn btn--outline" @click="$emit('back')">返回修改</button>
    </div>
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
.hint-text {
  text-align: center;
  color: #2b2b2b;
  font-size: 16px;
  margin-bottom: 16px;
}
.btn-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
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
.btn--outline { background: #fff; color: #444; border: 1.5px solid #d5d9de; font-weight: 400; }
</style>
