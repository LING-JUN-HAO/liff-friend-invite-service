<script setup lang="ts">
import { onMounted } from 'vue';
import CardDisplay, { cardCaptureKey } from './CardDisplay.vue';
import { captureCardCached } from '../../utils/cardImage';

const props = defineProps<{
  avatarUrl: string;
  nickname: string;
  cardSubLabel: string;
}>();

defineEmits<{
  confirm: [];
  back: [];
}>();

// 使用者看預覽時就在背景先產生圖片，按下送出後完成頁可以直接顯示
onMounted(() => {
  const el = document.getElementById('card-capture');
  if (el) captureCardCached(cardCaptureKey(props), el).catch(() => undefined);
});
</script>

<template>
  <div class="stage">
    <CardDisplay
      :avatar-url="avatarUrl"
      :nickname="nickname"
      :card-sub-label="cardSubLabel"
    />

    <p class="hint-text">確認沒問題，就讓這股力量流出去</p>

    <div class="btn-group">
      <button class="btn btn--green" @click="$emit('confirm')">送出，成為政波</button>
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
  font-size: 18px;
  line-height: 1.7;
  margin-top: auto;
  margin-bottom: 16px;
  padding-top: 16px;
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
.btn--outline { background: #fff; color: #444; border: 1.5px solid #d5d9de; font-weight: 400; }
</style>
