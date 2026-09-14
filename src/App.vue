<script setup lang="ts">
import { onMounted } from 'vue';
import liff from '@line/liff';
import Game from './views/Game.vue';
import Share from './views/Share.vue';
import { autoSend, type ShareKey, SHARES } from './utils/share';

/**
 * 同一個 LIFF（一組 VITE_LIFF_ID），靠網址切換頁面。
 *
 * 部署經過 Cloudflare Worker（只轉發 /liff*）→ Render，
 * 所以實際到達的路徑會帶 /liff 前綴（例如 /liff、/liff/moongame）。
 * 因此這裡用「路徑含 moongame」判斷，有沒有前綴都成立。
 *
 * LIFF Endpoint 設成：https://haoyu-linebot-liff.qd513020.workers.dev/liff
 *   ‧ 分享頁（預設）  https://liff.line.me/<LIFF_ID>              → /liff
 *   ‧ 尋兔遊戲        https://liff.line.me/<LIFF_ID>/moongame    → /liff/moongame
 *   ‧ 或用 query      https://liff.line.me/<LIFF_ID>?p=moongame  → /liff?p=moongame
 *   ‧ 自動分享        https://liff.line.me/<LIFF_ID>?action=share&key=<key>
 */
const params = new URLSearchParams(window.location.search);
const path = window.location.pathname;
const mode = params.get('p');
const isGame = path.includes('moongame') || mode === 'moongame';

onMounted(async () => {
  const action = params.get('action');
  const key = params.get('key') as ShareKey;
  if (action === 'share' && key && key in SHARES) {
    await liff.init({ liffId: import.meta.env.VITE_LIFF_ID });
    await autoSend(key);
  }
});
</script>

<template>
  <Game v-if="isGame" />
  <Share v-else />
</template>
