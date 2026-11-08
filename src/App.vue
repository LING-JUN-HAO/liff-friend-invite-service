<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import liff from "@line/liff";
import Game from './views/Game.vue';
import ChangeVibe from './views/changeVibe/index.vue';
import NotInLine from './views/NotInLine.vue';
import { share } from './utils/share';

const LIFF_ID = import.meta.env.VITE_LIFF_ID as string;

type View = 'game' | 'changevibe' | 'not-in-line' | 'none';
const view = ref<View>('none');
const debugInfo = ref('');

const pageTitles: Partial<Record<View, string>> = {
  'not-in-line': '請用 LINE 開啟',
  'none': '温世政 Wen shih-cheng',
};

watch(view, (v) => {
  document.title = pageTitles[v] ?? pageTitles['none']!;
});

onMounted(async () => {
  if (import.meta.env.DEV) {
    const hash = window.location.hash;
    view.value = hash === '#moongame' ? 'game' : 'changevibe';
    return;
  }
  try {
    await liff.init({ liffId: LIFF_ID });
    if (!liff.isInClient()) {
      view.value = 'not-in-line';
      return;
    }
    if (!liff.isLoggedIn()) {
      liff.login();
      return;
    }
    const hash = window.location.hash;
    if (hash === '#moongame') {
      view.value = 'game';
    } else if (hash === '#changevibe') {
      view.value = 'changevibe';
    } else if (hash === '#share/moonquiz') {
      await share('moonquiz');
      liff.closeWindow();
    } else if (hash === '#share/dawn') {
      await share('duanwu');
      liff.closeWindow();
    } else {
      debugInfo.value = `hash: ${hash} | 無對應頁面`;
    }
  } catch (error) {
    debugInfo.value = `ERROR: ${String(error)}`;
    console.error('LIFF 初始化失敗', error);
  }
});
</script>

<template>
  <Game v-if="view === 'game'" />
  <ChangeVibe v-else-if="view === 'changevibe'" />
  <NotInLine v-else-if="view === 'not-in-line'" />
  <pre v-else style="padding:16px;font-size:12px;word-break:break-all;white-space:pre-wrap;">{{ debugInfo }}</pre>
</template>
