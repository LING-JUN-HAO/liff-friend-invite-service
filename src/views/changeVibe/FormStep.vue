<script setup lang="ts">
type Duration = '1y' | '5y' | 'over10y' | 'forever'

const DURATION_OPTIONS = [
  { value: '1y',      label: '一年內'    },
  { value: '5y',      label: '5 年內'    },
  { value: 'over10y', label: '10 年以上' },
  { value: 'forever', label: '一輩子'   },
] as const satisfies { value: Duration; label: string }[]

const NANTOU_TOWNSHIPS = [
  '南投市', '埔里鎮', '草屯鎮', '竹山鎮', '集集鎮',
  '名間鄉', '中寮鄉', '鹿谷鄉', '水里鄉', '魚池鄉',
  '國姓鄉', '信義鄉', '仁愛鄉',
];

defineProps<{
  avatarUrl: string;
  nickname: string;
  personType: 'nantou' | 'other';
  township: string;
  duration: Duration | '';
  agreedToTerms: boolean;
  canSubmit: boolean;
}>();

const emit = defineEmits<{
  'update:nickname': [value: string];
  'update:personType': [value: 'nantou' | 'other'];
  'update:township': [value: string];
  'update:duration': [value: Duration];
  'update:agreedToTerms': [value: boolean];
  'toggle-privacy': [];
  'submit': [];
}>();
</script>

<template>
  <div class="page">
    <div class="form-panel">

      <!-- LINE 頭貼 -->
      <div class="avatar-row">
        <div class="avatar-wrap">
          <img v-if="avatarUrl" :src="avatarUrl" class="avatar-img" crossorigin="anonymous" />
          <div v-else class="avatar-placeholder"></div>
        </div>
        <span class="avatar-label">已帶入您的 LINE 頭貼</span>
      </div>

      <!-- 暱稱 -->
      <div class="field">
        <label class="field__label">您的暱稱？(最多 10 字，可用暱稱)</label>
        <div class="input-wrap">
          <input
            :value="nickname"
            class="field__input"
            maxlength="10"
            placeholder="輸入名稱"
            @input="emit('update:nickname', ($event.target as HTMLInputElement).value)"
          />
          <span class="char-count">{{ nickname.length }}/10</span>
        </div>
      </div>

      <!-- 南投人 or 外縣市朋友 -->
      <div class="field">
        <label class="field__label">您是南投人，還是關心南投的朋友？</label>
        <div class="toggle-group">
          <button
            class="toggle-btn"
            :class="{ 'toggle-btn--active': personType === 'nantou' }"
            @click="emit('update:personType', 'nantou')"
          >南投人</button>
          <button
            class="toggle-btn"
            :class="{ 'toggle-btn--active': personType === 'other' }"
            @click="emit('update:personType', 'other')"
          >外縣市朋友</button>
        </div>
      </div>

      <!-- 外縣市朋友特殊提示 -->
      <div v-if="personType === 'other'" class="other-notice">
        <p>雖然不是南投居民，但我也要成為南投的一股力量 💪</p>
      </div>

      <!-- 鄉鎮市選擇（南投人限定） -->
      <div v-if="personType === 'nantou'" class="field">
        <label class="field__label">您住在南投哪個鄉鎮市？</label>
        <select
          :value="township"
          class="field__select"
          @change="emit('update:township', ($event.target as HTMLSelectElement).value)"
        >
          <option value="" disabled>選擇鄉鎮市</option>
          <option v-for="t in NANTOU_TOWNSHIPS" :key="t" :value="t">{{ t }}</option>
        </select>
      </div>

      <!-- 年資（南投人限定） -->
      <div v-if="personType === 'nantou'" class="field">
        <label class="field__label">您在南投生活多久了呢？</label>
        <div class="duration-group">
          <button
            v-for="{ value, label } in DURATION_OPTIONS"
            :key="value"
            class="duration-btn"
            :class="{ 'duration-btn--active': duration === value }"
            @click="emit('update:duration', value)"
          >{{ label }}</button>
        </div>
      </div>

      <!-- 隱私同意 -->
      <div class="field">
        <label class="checkbox-label">
          <input
            type="checkbox"
            :checked="agreedToTerms"
            @change="emit('update:agreedToTerms', ($event.target as HTMLInputElement).checked)"
          />
          <span>我已閱讀並同意<button class="link-btn" @click.prevent="emit('toggle-privacy')">隱私說明</button>，{{ personType === 'nantou' ? '同意以頭貼、暱稱與區域製作政波卡。' : '同意以頭貼與暱稱製作政波卡。' }}</span>
        </label>
      </div>

      <button class="btn btn--green" :disabled="!canSubmit" @click="emit('submit')">製作政波卡</button>
    </div>
  </div>
</template>

<style scoped>
* { box-sizing: border-box; }

.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.form-panel {
  flex: 1;
  background: #fff;
  padding: 24px 20px 36px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

/* 頭貼 */
.avatar-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  background: #06C755;
  border-radius: 12px;
  padding: 12px 16px;
}
.avatar-wrap { flex: 0 0 44px; }
.avatar-img {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  display: block;
  border: 2px solid rgba(255,255,255,.8);
}
.avatar-placeholder {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255,255,255,.35);
  border: 2px solid rgba(255,255,255,.8);
}
.avatar-label { font-size: 16px; font-weight: 400; color: #fff; }

/* 表單欄位 */
.field { margin-bottom: 20px; }
.field__label {
  display: block;
  font-size: 16px;
  font-weight: 400;
  color: #2b2b2b;
  margin-bottom: 10px;
}
.input-wrap { position: relative; }
.field__input {
  width: 100%;
  border: 1.5px solid #d5d9de;
  border-radius: 10px;
  padding: 12px 40px 12px 14px;
  font-size: 16px;
  outline: none;
}
.field__input:focus, .field__input:not(:placeholder-shown) {
  border-color: #22b357;
}
.char-count {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  color: #2b2b2b;
}
.field__select {
  width: 100%;
  border: 1.5px solid #d5d9de;
  border-radius: 10px;
  padding: 12px 14px;
  font-size: 16px;
  color: #2b2b2b;
  background: #fff;
  outline: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23888' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
}
.field__select:focus { border-color: #22b357; }

/* Segmented control */
.toggle-group {
  display: flex;
  background: #e9e9eb;
  border-radius: 10px;
  padding: 3px;
  gap: 3px;
}
.toggle-btn {
  flex: 1;
  padding: 10px 0;
  border: none;
  border-radius: 8px;
  background: transparent;
  font-size: 15px;
  font-weight: 400;
  color: #666;
  cursor: pointer;
  transition: all .2s;
}
.toggle-btn--active {
  background: #fff;
  color: #2b2b2b;
  font-weight: 700;
  box-shadow: 0 1px 4px rgba(0,0,0,.12);
}

/* 外縣市提示 */
.other-notice {
  background: #e9e9eb;
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 20px;
}
.other-notice p { margin: 0; font-size: 16px; color: #2b2b2b; line-height: 1.6; }

/* 年資選擇 */
.duration-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.duration-btn {
  flex: 0 0 auto;
  padding: 10px 18px;
  border: 1.5px solid #d5d9de;
  border-radius: 999px;
  background: #fff;
  font-size: 15px;
  font-weight: 400;
  color: #aaa;
  cursor: pointer;
  transition: all .15s;
}
.duration-btn--active {
  border-color: #06C755;
  background: #e8fbf0;
  color: #06C755;
  font-weight: 700;
}

/* Checkbox */
.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 14px;
  color: #555;
  cursor: pointer;
  line-height: 1.5;
}
.checkbox-label input[type="checkbox"] {
  appearance: none;
  -webkit-appearance: none;
  flex: 0 0 20px;
  width: 20px;
  height: 20px;
  border: 2px solid #d5d9de;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  margin-top: 1px;
}
.checkbox-label input[type="checkbox"]:checked {
  background: #22b357;
  border-color: #22b357;
}
.link-btn {
  background: none;
  border: none;
  padding: 0;
  color: #1a73e8;
  text-decoration: underline;
  cursor: pointer;
  font-size: inherit;
}

/* 按鈕 */
.btn {
  display: block;
  width: 100%;
  border: none;
  border-radius: 999px;
  padding: 15px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity .15s;
}
.btn:disabled { opacity: .4; cursor: not-allowed; }
.btn--green { background: #06C755; color: #fff; }
</style>
