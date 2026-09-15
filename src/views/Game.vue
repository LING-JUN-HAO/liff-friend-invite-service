<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';

/**
 * 中秋尋兔賀卡 — LIFF 遊戲（螢幕②～⑥）
 * 玩法：在插圖上點一下放圈（可重新圈選），送出後比對是否圈中 3 隻玉兔。
 *
 * ★ 上線前要換的東西：
 *   1) BG_IMG / CARD_IMG / RABBIT_IMG 換成 Cloudinary 圖片網址
 *   2) TARGETS 換成正式插圖上 3 隻玉兔的實際座標（x/y 為 board 百分比 0~100）
 *   3) R 為命中半徑（board 百分比）：只要玉兔落在玩家畫的圈內就算中，可依插圖微調
 */
const BG_IMG = 'https://res.cloudinary.com/dj4rwmdiu/image/upload/v1789306852/img03_%E5%B0%8B%E6%89%BE%E7%8E%89%E5%85%94_o7km6z.png';     // 藏了玉兔的插圖（建議正方形 1:1）
const CARD_IMG = 'https://res.cloudinary.com/dj4rwmdiu/image/upload/v1789306851/img04_%E8%B3%80%E5%8D%A1_o2ijsn.png';   // 中秋賀卡圖
const RABBIT_IMG = 'https://res.cloudinary.com/dj4rwmdiu/image/upload/v1789306854/img03_rabbit_ixxu9s.png'; // 玉兔頭像（綠色 banner 左側）

type Pt = { x: number; y: number };
const TARGETS: Pt[] = [
  { x: 90.5, y: 10.9}, // 廟頂雲上
  { x: 68.0, y: 63.9 }, // 蒸籠裡
  { x: 63.8, y: 85.1 }, // 水果籃裡
];
const R = 14; // 命中半徑（% of board）

type Screen = 'loading' | 'game' | 'win' | 'fail' | 'reveal' | 'card';
const screen = ref<Screen>('loading');

type Marker = { x: number; y: number };
const markers = reactive<Marker[]>([]);
const board = ref<HTMLElement | null>(null);

const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);

// 判定結果
type Result = { hits: number; wrong: number; foundTarget: boolean[]; markCls: string[] };
const evaluate = (): Result => {
  const foundTarget = new Array(TARGETS.length).fill(false);
  const markCls: string[] = [];
  markers.forEach((m) => {
    let matched = -1;
    TARGETS.forEach((t, i) => {
      if (!foundTarget[i] && dist(m, t) <= R) matched = i;
    });
    if (matched >= 0) {
      foundTarget[matched] = true;
      markCls.push('correct');
    } else {
      markCls.push('wrong');
    }
  });
  const hits = foundTarget.filter(Boolean).length;
  const wrong = markCls.filter((c) => c === 'wrong').length;
  return { hits, wrong, foundTarget, markCls };
};

// const debugCoord = ref('');

const onBoardClick = (e: MouseEvent) => {
  if (screen.value !== 'game' || !board.value) return;
  const r = board.value.getBoundingClientRect();
  const x = ((e.clientX - r.left) / r.width) * 100;
  const y = ((e.clientY - r.top) / r.height) * 100;
  // debugCoord.value = `x: ${x.toFixed(1)}, y: ${y.toFixed(1)}`;
  markers.push({ x, y });
};

// 各畫面要顯示的標記（遊戲：白色虛線圈；結算：綠/紅/虛線）
type Shown = { x: number; y: number; cls: string };
const shownMarks = computed<Shown[]>(() => {
  if (screen.value === 'game') {
    return markers.map((m) => ({ x: m.x, y: m.y, cls: 'tap' }));
  }
  if (screen.value === 'win' || screen.value === 'fail') {
    const r = evaluate();
    return markers.map((m, i) => ({ x: m.x, y: m.y, cls: r.markCls[i] }));
  }
  if (screen.value === 'reveal') {
    const r = evaluate();
    const out: Shown[] = TARGETS.map((t, i) => ({
      x: t.x,
      y: t.y,
      cls: r.foundTarget[i] ? 'correct' : 'missed',
    }));
    markers.forEach((m, i) => {
      if (r.markCls[i] === 'wrong') out.push({ x: m.x, y: m.y, cls: 'wrong' });
    });
    return out;
  }
  return [];
});

const restart = () => {
  markers.splice(0, markers.length);
  screen.value = 'game';
};
const submit = () => {
  const r = evaluate();
  screen.value = r.hits === TARGETS.length && r.wrong === 0 ? 'win' : 'fail';
};


const download = () => window.alert('長按賀卡即可儲存');

onMounted(() => {
  screen.value = 'game';
});
</script>

<template>
  <div class="app">
    <header class="topbar">
      <div class="acc"><b>温世政 Wen shih-cheng</b><small>ec.twmountain.com</small></div>
      <span class="ic">⋮ ✕</span>
    </header>
    <div class="green-line"></div>

    <!-- ②③④⑤ 遊戲 / 結算 / 揭曉 -->
    <main class="stage" v-if="screen !== 'card'">
      <div class="banner">
        <span class="ava" :style="RABBIT_IMG ? { backgroundImage: `url(${RABBIT_IMG})` } : {}"></span>
        <span>{{ screen === 'reveal' ? '玉兔長這樣，總共有三隻唷！' : '目標：找出玉兔們' }}</span>
      </div>

      <p class="hint red" v-if="screen === 'fail'">💡 總共有 {{ TARGETS.length }} 隻玉兔喔！</p>
      <p class="hint" v-else-if="screen === 'reveal'">💡 原來玉兔躲在這些地方呀！</p>

      <p class="subtitle" v-if="screen === 'game'">點擊畫面圈出玉兔位置</p>
      <!-- <p v-if="debugCoord" style="text-align:center;font-size:13px;color:#888;margin:4px 0;">{{ debugCoord }}</p> -->

      <div class="board" ref="board" @click="onBoardClick" :class="{ playing: screen === 'game' }">
        <img v-if="BG_IMG" :src="BG_IMG" alt="尋兔畫面" />
        <div v-else class="placeholder">尋兔插圖<br />待替換（正方形）</div>
        <div v-for="(m, i) in shownMarks" :key="i" class="mk" :class="m.cls" :style="{ left: m.x + '%', top: m.y + '%' }"></div>
      </div>

      <p class="subtitle" v-if="screen === 'game'">隨時都能送出答案</p>
      <p class="subtitle strong" v-else-if="screen === 'win'">太厲害了！{{ TARGETS.length }} 隻玉兔都被你找到了！</p>
      <p class="subtitle strong" v-else-if="screen === 'fail'">還差一點點！還有玉兔藏在裡面</p>
      <p class="subtitle strong" v-else-if="screen === 'reveal'">感謝參與！一樣能領取祝福賀卡唷</p>

      <!-- 按鈕組 -->
      <template v-if="screen === 'game'">
        <button class="btn gray-o" @click="restart">重新圈選</button>
        <button class="btn green" @click="submit">送出答案</button>
      </template>
      <template v-else-if="screen === 'win'">
        <!-- <button class="btn green-o" @click="share('moongame')">分享給好友玩</button> -->
        <button class="btn gold" @click="screen = 'card'">領取專屬賀卡</button>
      </template>
      <template v-else-if="screen === 'fail'">
        <button class="btn gray-o" @click="restart">再挑戰一次</button>
        <button class="btn gray" @click="screen = 'reveal'">查看解答</button>
      </template>
      <template v-else-if="screen === 'reveal'">
        <button class="btn gray-o" @click="restart">再挑戰一次</button>
        <button class="btn gold" @click="screen = 'card'">領取中秋賀卡</button>
      </template>
    </main>

    <!-- ⑥ 賀卡 -->
    <main class="stage" v-else>
      <div class="banner">
        <span class="ava" :style="RABBIT_IMG ? { backgroundImage: `url(${RABBIT_IMG})` } : {}"></span>
        <span>玉兔長這樣，總共有三隻唷！</span>
      </div>
      <div class="card">
        <img v-if="CARD_IMG" :src="CARD_IMG" alt="中秋賀卡" />
        <div v-else class="placeholder cardph">中秋賀卡圖<br />待替換</div>
      </div>
      <p class="save-tip">長按圖片可直接儲存<br />將祝福轉傳給親朋好友吧！</p>
      <!-- <button class="btn green-o" @click="share('moongame')">分享給好友玩</button> -->
      <button class="btn gold" @click="download">賀卡下載</button>
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
.stage { padding: 14px 18px 0; }
.banner { display: flex; align-items: center; gap: 12px; background: #22b357; color: #fff; border-radius: 14px; padding: 12px 16px; font-weight: 700; font-size: 16px; }
.banner .ava { width: 40px; height: 40px; border-radius: 50%; background: #fff; flex: 0 0 40px; background-size: cover; background-position: center; }
.hint { text-align: center; font-weight: 700; margin: 14px 0 4px; }
.hint.red { color: #e5484d; }
.subtitle { text-align: center; color: #555; margin: 12px 0; font-weight: 500; }
.subtitle.strong { font-weight: 700; color: #2b2b2b; }
.board { position: relative; width: 100%; aspect-ratio: 1/1; border-radius: 16px; overflow: hidden; margin-top: 12px; box-shadow: 0 2px 10px rgba(0,0,0,.08); }
.board.playing { cursor: crosshair; }
.board img { width: 100%; height: 100%; object-fit: cover; display: block; pointer-events: none; }
.placeholder { display: flex; align-items: center; justify-content: center; text-align: center; color: #8a94a0; font-size: 14px; line-height: 1.9; background: #f1f3f5; border: 1px dashed #ccd2d8; width: 100%; height: 100%; }
.cardph { aspect-ratio: 1/1; }
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
.save-tip { text-align: center; color: #444; margin: 14px 0; font-weight: 600; line-height: 1.7; }
</style>
