<script setup lang="ts">
import { onMounted, ref } from 'vue';
import liff from '@line/liff';
import Game from './views/Game.vue';
import { autoSend, type ShareKey, SHARES } from './utils/share';

/**
 * 同一個 LIFF（一組 VITE_LIFF_ID），靠網址切換頁面。
 * liff.init() 完成後 LINE 才會把 liff.state 還原成原始 query params，
 * 所以路由判斷必須在 init 之後進行。
 *
 * LIFF Endpoint 設成：https://haoyu-linebot-liff.qd513020.workers.dev/liff
 *   ‧ 尋兔遊戲   https://liff.line.me/<LIFF_ID>?p=moongame
 *   ‧ 自動分享   https://liff.line.me/<LIFF_ID>?action=share&key=<key>
 */
type View = 'game' | 'none';
const view = ref<View>('none');

onMounted(async () => {
  await liff.init({ liffId: import.meta.env.VITE_LIFF_ID });

  const params = new URLSearchParams(window.location.search);
  const action = params.get('action');
  const key = params.get('key') as ShareKey;
  const p = params.get('p');

  if (action === 'share' && key && key in SHARES) {
    await autoSend(key);
  } else if (p === 'moongame') {
    view.value = 'game';
  }
});
</script>

<template>
  <Game v-if="view === 'game'" />
</template>
