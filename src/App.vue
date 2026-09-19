<script setup lang="ts">
import { onMounted, ref } from "vue";
import liff from "@line/liff";
import Game from './views/Game.vue';

const officialAccountUrl = 'https://line.me/R/ti/p/%40723znbzn';

type View = 'game' | 'none';
const view = ref<View>('none');
const debugInfo = ref('');

const handleUserLogin = () => {
  if (!liff.isLoggedIn()) {
    liff.login()
    return false;
  }
  return true;
}

onMounted(async () => {
  try {
       await liff.init({
      liffId: import.meta.env.VITE_LIFF_ID,
    });
    if (!handleUserLogin()) {
      return;
    }
    const isGame = window.location.hash === '#moongame';
    debugInfo.value = `hash: ${window.location.hash} | isGame: ${isGame}`;

    if (isGame) {
      view.value = 'game';
    } 
  } catch (error) {
    debugInfo.value = `ERROR: ${String(error)}`;
    console.error('LIFF 初始化失敗', error);
  }
});
</script>

<template>
  <Game v-if="view === 'game'" />
  <pre v-else style="padding:16px;font-size:12px;word-break:break-all;white-space:pre-wrap;">{{ debugInfo }}</pre>
</template>
