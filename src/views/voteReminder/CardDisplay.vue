<script setup lang="ts">
const IMG_URL = 'https://res.cloudinary.com/dj4rwmdiu/image/upload/v1795237354/%E6%8A%95%E7%A5%A8%E6%8F%90%E9%86%92_%E5%9C%96%E5%8D%A1_ri7yqp.png';

defineProps<{
  person: string;
  inviteText: string;
}>();
</script>

<template>
  <div class="card" id="vote-card-capture">
    <img class="card__bg" :src="IMG_URL" crossorigin="anonymous" />
    <div class="card__overlay">
      <p class="card__title">給{{ person }}的邀請</p>
      <p class="card__text">{{ inviteText }}</p>
    </div>
  </div>
</template>

<style scoped>
.card {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: 20px;
  font-family: 'Noto Sans TC', system-ui, sans-serif;
}

.card__bg {
  width: 100%;
  display: block;
  max-height: 62vh;
  object-fit: cover;
  object-position: center;
}

/* 文字疊在圖片天空區域（上方約 45%） */
.card__overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 40%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0 32px;
  text-align: center;
  gap: 15px;
}

.card__title {
  font-size: clamp(32px, 8vw, 60px);
  font-weight: 700;
  color: #2d4a1e;
  margin: 0;
  line-height: 1.3;
  letter-spacing: 0.05em;
}

.card__text {
  font-size: clamp(16px, 5.5vw, 32px);
  font-weight: 500;
  margin: 0;
  line-height: 1.65;
  white-space: pre-wrap;
}
</style>
