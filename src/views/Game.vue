<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import liff from '@line/liff';
import { share } from '../utils/share';

/**
 * 中秋尋兔賀卡 — LIFF 遊戲（螢幕②～⑥）
 * 玩法：在插圖上點一下放圈（可重新圈選），送出後比對是否圈中 3 隻玉兔。
 * TARGETS 為 3 隻玉兔的座標（x/y 為 board 百分比 0~100），R 為命中半徑（board 百分比）。
 */
const BG_IMG = 'https://res.cloudinary.com/dj4rwmdiu/image/upload/v1789306852/img03_%E5%B0%8B%E6%89%BE%E7%8E%89%E5%85%94_o7km6z.png';     // 藏了玉兔的插圖（建議正方形 1:1）
const CARD_IMG = 'https://res.cloudinary.com/dj4rwmdiu/image/upload/v1789306851/img04_%E8%B3%80%E5%8D%A1_o2ijsn.png';   // 中秋賀卡圖
const RABBIT_IMG = 'https://res.cloudinary.com/dj4rwmdiu/image/upload/v1789306854/img03_rabbit_ixxu9s.png'; // 玉兔頭像（綠色 banner 左側）

type Coord = { x: number; y: number };
const TARGETS: Coord[] = [
  { x: 90.5, y: 10.9}, // 廟頂雲上
  { x: 68.0, y: 63.9 }, // 蒸籠裡
  { x: 63.8, y: 85.1 }, // 水果籃裡
];
const HIT_R = 10; // 命中半徑（% of board）＝ 視覺圈圈半徑，玉兔中心須落在圈內

type Screen = 'game' | 'win' | 'fail' | 'reveal' | 'card';
const screen = ref<Screen>('game');

const markers = reactive<Coord[]>([]);
const board = ref<HTMLElement | null>(null);

const dist = (a: Coord, b: Coord) => Math.hypot(a.x - b.x, a.y - b.y);

// 判定結果
type Result = { hits: number; foundTarget: boolean[]; markCls: string[] };
const evaluate = (): Result => {
  const foundTarget = new Array(TARGETS.length).fill(false);
  const markCls: string[] = [];
  markers.forEach((m) => {
    let matched = -1;
    TARGETS.forEach((t, i) => {
      if (!foundTarget[i] && dist(m, t) <= HIT_R) matched = i;
    });
    if (matched >= 0) {
      foundTarget[matched] = true;
      markCls.push('correct');
    } else {
      markCls.push('wrong');
    }
  });
  const hits = foundTarget.filter(Boolean).length;
  return { hits, foundTarget, markCls };
};

const onBoardClick = (e: MouseEvent) => {
  if (screen.value !== 'game' || !board.value) return;
  if (markers.length >= TARGETS.length) markers.shift();
  const r = board.value.getBoundingClientRect();
  const x = ((e.clientX - r.left) / r.width) * 100;
  const y = ((e.clientY - r.top) / r.height) * 100;
  markers.push({ x, y });
};

// 各畫面要顯示的標記（遊戲：白色虛線圈；結算：綠/紅/虛線）
type Shown = Coord & { cls: string };
const shownMarks = computed<Shown[]>(() => {
  if (screen.value === 'game') {
    return markers.map((m) => ({ ...m, cls: 'tap' }));
  }
  if (screen.value === 'fail') {
    const r = evaluate();
    return markers.map((m, i) => ({ ...m, cls: r.markCls[i] === 'correct' ? 'correct' : 'tap' }));
  }
  if (screen.value === 'win') {
    const r = evaluate();
    return markers.map((m, i) => ({ ...m, cls: r.markCls[i] }));
  }
  if (screen.value === 'reveal') {
    const r = evaluate();
    const out: Shown[] = TARGETS.map((t, i) => ({
      ...t,
      cls: r.foundTarget[i] ? 'correct' : 'missed',
    }));
    markers.forEach((m, i) => {
      if (r.markCls[i] === 'wrong') out.push({ ...m, cls: 'wrong' });
    });
    return out;
  }
  return [];
});

const goToCard = () => {
  liff.sendMessages([
    {
      type: 'text',
      text: `🌕 感謝您一起熱情尋寶！祝您與家人：\n🥮 月圓人團園，事事順心如意\n🥮 闔家平安、中秋佳節愉快！\n\n💡 長按下方賀卡即可直接儲存，轉傳祝福給親朋好友！`,
    },
    {
      type: 'image',
      originalContentUrl: CARD_IMG,
      previewImageUrl: CARD_IMG,
    },
  ]);
  screen.value = 'card';
};

const restart = () => {
  markers.splice(0);
  screen.value = 'game';
};
const submit = () => {
  const r = evaluate();
  screen.value = r.hits === TARGETS.length ? 'win' : 'fail';
};

const download = async () => {
  const isIOS = /iP(hone|ad|od)/.test(navigator.userAgent);
  if (isIOS) {
    window.open(CARD_IMG, '_blank');
    return;
  }
  const res = await fetch(CARD_IMG);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = '中秋賀卡.png';
  a.click();
  URL.revokeObjectURL(url);
};
</script>

<template>
  <div class="app">
    <!-- ②③④⑤ 遊戲 / 結算 / 揭曉 -->
    <main class="stage" v-if="screen !== 'card'">
      <div class="banner">
        <span class="ava" :style="{ backgroundImage: `url(${RABBIT_IMG})` }"></span>
        <span>{{ screen === 'reveal' ? '玉兔長這樣，總共有三隻唷！' : '目標：找出玉兔們' }}</span>
      </div>

      <p class="hint red" v-if="screen === 'fail'">💡 總共有 {{ TARGETS.length }} 隻玉兔喔！</p>
      <p class="subtitle" v-else-if="screen === 'reveal'">💡 原來玉兔躲在這些地方呀！</p>

      <p class="subtitle" v-if="screen === 'game' || screen === 'win'">點擊畫面圈出玉兔位置</p>

      <div class="board" ref="board" @click="onBoardClick" :class="{ playing: screen === 'game' }">
        <img :src="BG_IMG" alt="尋兔畫面" />
        <div v-for="(m, i) in shownMarks" :key="i" class="mk" :class="m.cls" :style="{ left: m.x + '%', top: m.y + '%' }"></div>
      </div>

      <p class="subtitle" v-if="screen === 'game'">隨時都能送出答案</p>
      <p class="subtitle" v-else-if="screen === 'win'">太厲害了！{{ TARGETS.length }} 隻玉兔都被你找到了！</p>
      <p class="subtitle" v-else-if="screen === 'fail'">還差一點點！還有玉兔藏在裡面</p>
      <p class="subtitle" v-else-if="screen === 'reveal'">感謝參與！一樣能領取祝福賀卡唷</p>

      <!-- 按鈕組 -->
      <div class="btn-group">
        <template v-if="screen === 'game'">
          <button class="btn gray-o" @click="restart">重新圈選</button>
          <button class="btn green" @click="submit">送出答案</button>
        </template>
        <template v-else-if="screen === 'win'">
          <button class="btn green-o" @click="share('moongame')">分享給好友玩</button>
          <button class="btn gold" @click="goToCard">領取專屬賀卡</button>
        </template>
        <template v-else-if="screen === 'fail'">
          <button class="btn gray-o" @click="restart">再挑戰一次</button>
          <button class="btn gray" @click="screen = 'reveal'">查看解答</button>
        </template>
        <template v-else-if="screen === 'reveal'">
          <button class="btn gray-o" @click="restart">再挑戰一次</button>
          <button class="btn gold" @click="goToCard">領取中秋賀卡</button>
        </template>
      </div>
    </main>

    <!-- ⑥ 賀卡 -->
    <main class="stage" v-else>
      <div class="banner">
        <span class="ava" :style="{ backgroundImage: `url(${RABBIT_IMG})` }"></span>
        <span>玉兔長這樣，總共有三隻唷！</span>
      </div>
      <div class="card">
        <img :src="CARD_IMG" alt="中秋賀卡" />
      </div>
      <p class="save-tip">長按圖片可直接儲存<br />將祝福轉傳給親朋好友吧！</p>
      <button class="btn green-o" @click="share('moongame')">分享給好友玩</button>
      <button class="btn gold" @click="download">賀卡下載</button>
    </main>
  </div>
</template>

<style>
* { box-sizing: border-box; }
body { margin: 0; }
.app { min-height: 100vh; background: #fff; color: #2b2b2b;
  font-family: 'Noto Sans TC', system-ui, sans-serif; }
.stage { display: flex; flex-direction: column; min-height: 100vh; padding: 14px 18px 24px; }
.btn-group { margin-top: auto; padding-top: 12px; }
.banner { display: flex; align-items: center; gap: 12px; background: #22b357; color: #fff; border-radius: 14px; padding: 12px 16px; font-weight: 700; font-size: 16px; }
.banner .ava { width: 40px; height: 40px; border-radius: 50%; background: #fff; flex: 0 0 40px; background-size: cover; background-position: center; }
.hint { text-align: center; font-weight: 700; margin: 14px 0 4px; }
.hint.red { color: #e5484d; }
.subtitle { text-align: center; color: #555; margin: 12px 0; font-weight: 400; }
.board { position: relative; width: 100%; aspect-ratio: 1/1; border-radius: 16px; overflow: hidden; margin-top: 12px; box-shadow: 0 2px 10px rgba(0,0,0,.08); }
.board.playing { cursor: crosshair; }
.board img { width: 100%; height: 100%; object-fit: cover; display: block; pointer-events: none; }
.mk { position: absolute; transform: translate(-50%, -50%); width: 20%; aspect-ratio: 1/1; border-radius: 50%; pointer-events: none; }
.mk.tap { border: 3px dashed #fff; box-shadow: 0 0 0 2px rgba(0,0,0,.15); }
.mk.correct { border: 4px solid #35c759; box-shadow: 0 0 8px rgba(53,199,89,.5); }
.mk.missed { border: 4px dashed #35c759; }
.mk.wrong { border: 4px solid #ff5a4d; }
.mk.wrong::after { content: '✕'; position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; color: #ff5a4d; font-weight: 800; font-size: 22px; }
.btn { display: block; width: 100%; border: none; border-radius: 999px; padding: 15px; font-size: 16px; font-weight: 700; margin-top: 12px; cursor: pointer; }
.btn.green { background: #06C755; color: #fff; }
.btn.green-o { background: #fff; color: #06C755; border: 1.5px solid #06C755; }
.btn.gold { background: #D9A400; color: #fff; }
.btn.gray-o { background: #fff; color: #666; border: 1.5px solid #d5d9de; }
.btn.gray { background: #9aa0a6; color: #fff; }
.card { border-radius: 16px; overflow: hidden; margin: 14px 0 10px; box-shadow: 0 2px 10px rgba(0,0,0,.08); }
.card img { width: 100%; display: block; }
.save-tip { text-align: center; color: #555; margin: 14px 0; font-weight: 600; line-height: 1.7; }
</style>
