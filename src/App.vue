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

// const handleShareMessage = async () => {
//   if (!liff.isApiAvailable('shareTargetPicker')) {
//     window.alert('此裝置不支援分享功能，將關閉 LIFF 視窗。');
//     liff.closeWindow();
//     return;
//   }

//   await liff.shareTargetPicker([
//     {
//       type: 'flex',
//       altText: '溫醫師的端午護牙大挑戰',
//       contents: {
//         type: 'bubble',
//         size: "giga",
//         body: {
//           type: 'box',
//           layout: 'vertical',
//           paddingAll: 'none',
//           contents: [
//             {
//               type: 'image',
//               url: 'https://res.cloudinary.com/dseg0uwc9/image/upload/v1780279859/%E8%B1%AA%E5%B6%BC%20linebot%20%E5%B7%A5%E4%BD%9C/%E8%AD%B7%E7%89%99-01_bfm6nj.png',
//               size: 'full',
//               aspectRatio: '1040:768',
//               action: {
//                 type: 'uri',
//                 label: '溫醫師的端午護牙大挑戰',
//                 uri: officialAccountUrl
//               }
//             }
//           ]
//         }
//       }
//     }
//   ]);
//   liff.closeWindow();
// }
onMounted(async () => {
  try {
       await liff.init({
      liffId: import.meta.env.VITE_LIFF_ID,
    });
    if (!handleUserLogin()) {
      return;
    }
    console.log('Tessssst')
    // 1. 先抓標準的網址參數
    let urlParams = new URLSearchParams(window.location.search);
    let p = urlParams.get('p');
        
    debugInfo.value = `search: ${window.location.search} | p: ${p}`;

    if (p === 'moongame') {
      view.value = 'game';
    } else {
      // await handleShareMessage();
    }
  } catch (error) {
    console.error('LIFF 初始化失敗', error);
  }
});
</script>

<template>
  <Game v-if="view === 'game'" />
  <pre v-else style="padding:16px;font-size:12px;word-break:break-all;white-space:pre-wrap;">{{ debugInfo }}</pre>
</template>
