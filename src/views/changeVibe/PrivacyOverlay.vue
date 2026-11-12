<script setup lang="ts">
defineProps<{ show: boolean }>();
defineEmits<{ close: [] }>();

const sections = [
  { label: '蒐集哪些資料？',     text: '您的LINE 頭貼、暱稱（可使用化名）、鄉鎮市。' },
  { label: '資料的使用目的為何？', text: '僅用於在您的手機上製作「政波卡」。' },
  { label: '資料是否會被儲存？',  text: '您填寫的暱稱與鄉鎮市，僅用於在您的手機上產生政波卡。本活動不會另行儲存，亦不會提供予第三方。' },
  { label: '分享圖卡',           text: '是否分享給朋友，由您自行決定。圖片一經傳送，即無法收回。' },
  { label: '加入好友',           text: '適用 LINE 及本官方帳號之隱私權政策。' },
];
</script>

<template>
  <div v-if="show" class="privacy-overlay" @click.self="$emit('close')">
    <div class="privacy-sheet">
      <h3 class="privacy-heading">我們如何使用你的資料</h3>
      <div v-for="s in sections" :key="s.label" class="privacy-section">
        <p class="privacy-label">{{ s.label }}</p>
        <p class="privacy-text">{{ s.text }}</p>
      </div>
      <button class="btn btn--green" @click="$emit('close')">我知道了</button>
    </div>
  </div>
</template>

<style scoped>
.privacy-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.45);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  z-index: 100;
}
.privacy-sheet {
  background: #fff;
  border-radius: 20px 20px 0 0;
  padding: 28px 20px 40px;
  max-height: 80vh;
  overflow-y: auto;
}
.privacy-heading {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 20px;
}
.privacy-section { margin-bottom: 18px; }
.privacy-label {
  font-size: 16px;
  font-weight: 700;
  color: #2b2b2b;
  margin: 0 0 6px;
}
.privacy-text {
  font-size: 16px;
  color: #555;
  margin: 0;
  line-height: 1.6;
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
}
.btn--green { background: #06C755; color: #fff; }
</style>
