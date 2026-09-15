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
  const preParams = new URLSearchParams(window.location.search);
  const isOAuthCallback = preParams.has('code') && preParams.has('liffClientId');

  // OAuth redirect 前把 routing 資訊存起來，以免 redirect 後遺失
  if (!isOAuthCallback) {
    const liffState = decodeURIComponent(preParams.get('liff.state') ?? '');
    const stateParams = new URLSearchParams(liffState.replace(/^\?/, ''));
    const p = preParams.get('p') || stateParams.get('p');
    const action = preParams.get('action') || stateParams.get('action');
    const key = preParams.get('key') || stateParams.get('key');
    if (p) localStorage.setItem('liff_p', p);
    if (action) localStorage.setItem('liff_action', action);
    if (key) localStorage.setItem('liff_key', key);
  }

  await liff.init({ liffId: import.meta.env.VITE_LIFF_ID });

  // init 後從 URL 或 localStorage 取得 routing 資訊
  const postParams = new URLSearchParams(window.location.search);
  const p = postParams.get('p') || localStorage.getItem('liff_p');
  const action = postParams.get('action') || localStorage.getItem('liff_action');
  const key = (postParams.get('key') || localStorage.getItem('liff_key')) as ShareKey;

  // 用完清掉
  localStorage.removeItem('liff_p');
  localStorage.removeItem('liff_action');
  localStorage.removeItem('liff_key');

  debugInfo.value = `search: ${window.location.search}\np: ${p}, action: ${action}, key: ${key}`;

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
