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
    console.log('🔥 NEW LIFF VERSION 2026-09-15');

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

    // 2. 如果標準網址抓不到，嘗試去解析被 LINE 移到 liff.state 裡的參數
    if (!p) {
      const liffState = urlParams.get('liff.state');
      if (liffState) {
        // 解碼 liff.state (它通常會以 ? 或 & 開頭，例如 ?p=moongame)
        const decodedState = decodeURIComponent(liffState);
        const stateParams = new URLSearchParams(decodedState);
        p = stateParams.get('p');
      }
    }

    console.log('手動解析取得的 p:', p);
        
    if (p === 'moongame') {
      view.value = 'game';
    } else {
      // await handleShareMessage();
      console.log('p',p)
    }
  } catch (error) {
    console.error('LIFF 初始化失敗', error);
  }
});
</script>

<template>
  <!-- <Game v-if="view === 'game'" /> -->
  <!-- DEBUG -->
</template>
