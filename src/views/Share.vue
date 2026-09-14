<script setup lang="ts">
import { onMounted } from 'vue';
import liff from '@line/liff';
import { share, SHARE_BUTTONS } from '../utils/share';

// 要加分享按鈕：到 utils/share.ts 的 SHARES 加一個 key，再到 SHARE_BUTTONS 加一列即可
onMounted(async () => {
  try {
    await liff.init({ liffId: import.meta.env.VITE_LIFF_ID });
  } catch (error) {
    console.error('LIFF 初始化失敗', error);
  }
});
</script>

<template>
  <div class="app">
    <header class="topbar">
      <div class="acc"><b>温世政 Wen shih-cheng</b><small>ec.twmountain.com</small></div>
      <span class="ic">⋮ ✕</span>
    </header>
    <div class="green-line"></div>

    <main class="stage">
      <h1 class="title">分享給好友</h1>
      <p class="sub">選一張想分享的卡片，傳給 LINE 上的親朋好友</p>
      <button
        v-for="b in SHARE_BUTTONS"
        :key="b.key"
        class="btn green"
        @click="share(b.key)"
      >
        {{ b.label }}
      </button>
    </main>
  </div>
</template>

<style>
* { box-sizing: border-box; }
body { margin: 0; }
.app { min-height: 100vh; background: #fff; color: #2b2b2b;
  font-family: 'Noto Sans TC', system-ui, sans-serif; padding-bottom: 24px; }
.topbar { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px 10px; border-bottom: 1px solid #eee; }
.acc b { font-size: 15px; } .acc small { display: block; color: #9aa0a6; font-size: 11px; }
.ic { color: #9aa0a6; font-size: 16px; }
.green-line { height: 3px; width: 80px; background: #06C755; }
.stage { padding: 20px 18px 0; }
.title { font-size: 20px; font-weight: 800; margin: 6px 0; }
.sub { color: #666; font-size: 14px; margin: 0 0 18px; }
.btn { display: block; width: 100%; border: none; border-radius: 999px; padding: 15px; font-size: 16px; font-weight: 700; margin-top: 12px; cursor: pointer; }
.btn.green { background: #06C755; color: #fff; }
</style>
