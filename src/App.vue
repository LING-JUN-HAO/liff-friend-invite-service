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

// DEBUG
const debugInfo = ref('');

onMounted(async () => {
  // init 前先解析 liff.state（LINE 將原始 query params 編碼在此）
  const preParams = new URLSearchParams(window.location.search);
  const liffState = decodeURIComponent(preParams.get('liff.state') ?? '');

  debugInfo.value = `[pre] search: ${window.location.search}\n[pre] liff.state: ${liffState}`;

  await liff.init({ liffId: import.meta.env.VITE_LIFF_ID });

  // init 後 LINE 會把 liff.state 還原成原始 query params
  const postParams = new URLSearchParams(window.location.search);
  const action = postParams.get('action') || (liffState.includes('action=share') ? 'share' : null);
  const key = (postParams.get('key') || new URLSearchParams(liffState.replace(/^\?/, '')).get('key')) as ShareKey;
  const p = postParams.get('p') || new URLSearchParams(liffState.replace(/^\?/, '')).get('p');

  debugInfo.value += `\n[post] search: ${window.location.search}\naction: ${action}, key: ${key}, p: ${p}\n→ view: ${p === 'moongame' ? 'game' : action === 'share' ? 'autoSend' : 'none'}`;

  if (action === 'share' && key && key in SHARES) {
    await autoSend(key);
  } else if (p === 'moongame') {
    view.value = 'game';
  }
});
</script>

<template>
  <Game v-if="view === 'game'" />
  <!-- DEBUG -->
  <pre v-else style="padding:16px;font-size:12px;word-break:break-all;white-space:pre-wrap;">{{ debugInfo }}</pre>
</template>
