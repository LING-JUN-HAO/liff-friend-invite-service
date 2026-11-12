<script setup lang="ts">
const BG_URL = 'https://res.cloudinary.com/dj4rwmdiu/image/upload/v1794013736/%E6%94%BF%E6%B3%A2%E5%8D%A1_sr5fzy.png';

defineProps<{
  avatarUrl: string;
  nickname: string;
  cardSubLabel: string;
}>();
</script>

<template>
  <div class="card" id="card-capture">
    <img class="card__bg" :src="BG_URL" crossorigin="anonymous" />
    <img v-if="avatarUrl" :src="avatarUrl" class="card__avatar" crossorigin="anonymous" />
    <div v-else class="card__avatar card__avatar--placeholder"></div>
    <p class="card__name">我是 {{ nickname }}</p>
    <p class="card__identity">{{ cardSubLabel }}</p>
    <p class="card__slogan">一起成為改變南投的力量！</p>
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
}
/* 頭貼：模板圓形中心在 38.5%，直徑佔卡片寬 40.9% */
.card__avatar {
  position: absolute;
  width: 40%;
  aspect-ratio: 1;
  border-radius: 50%;
  object-fit: cover;
  top: 38.5%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.card__avatar--placeholder {
  position: absolute;
  width: 40%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: rgba(255,255,255,0.3);
  top: 38.5%;
  left: 50%;
  transform: translate(-50%, -50%);
}
/* 名字格中心：模板量測 67.8% */
.card__name {
  position: absolute;
  left: 0;
  right: 0;
  top: 67.8%;
  transform: translateY(-50%);
  text-align: center;
  padding: 0 24px;
  font-size: 16px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  line-height: 1.3;
}
/* 身份格中心：模板量測 75.1% */
.card__identity {
  position: absolute;
  left: 0;
  right: 0;
  top: 75.1%;
  transform: translateY(-50%);
  text-align: center;
  padding: 0 24px;
  font-size: 16px;
  font-weight: 700;
  color: #333;
  margin: 0;
  line-height: 1.3;
}
/* 第三格：蓋掉底圖原本的「# 一股改變南投的力量」，保留右側浮水印；模板量測中心 82.3% */
.card__slogan {
  position: absolute;
  left: 21%;
  right: 22.5%;
  top: 79.6%;
  height: 5.4%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  font-size: 16px;
  font-weight: 700;
  color: #0B5E4E;
  margin: 0;
  white-space: nowrap;
}
</style>
