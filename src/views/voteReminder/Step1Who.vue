<script setup lang="ts">
import { computed, ref } from 'vue';

const PRESET_OPTIONS = ['阿嬤', '阿公', '爸媽', '家人朋友'];

const selectedPreset = ref<string | null>(null);
const isCustom = ref(false);
const customName = ref('');

const selectPreset = (value: string) => {
  selectedPreset.value = value;
  isCustom.value = false;
};

const selectCustom = () => {
  selectedPreset.value = null;
  isCustom.value = true;
};

const resolvedName = computed(() => {
  if (isCustom.value) return customName.value.trim();
  return selectedPreset.value ?? '';
});

const canSubmit = computed(() => !!resolvedName.value);

const emit = defineEmits<{
  submit: [person: string];
}>();
</script>

<template>
  <div class="page">
    <div class="form-panel">
      <h2 class="question">你想約誰一起去投票？</h2>

      <div class="option-list">
        <!-- 預設選項 -->
        <div
          v-for="opt in PRESET_OPTIONS"
          :key="opt"
          class="option-card"
          :class="{ 'option-card--active': selectedPreset === opt && !isCustom }"
          @click="selectPreset(opt)"
        >
          <div class="option-row">
            <span class="option-label" :class="{ 'option-label--active': selectedPreset === opt && !isCustom }">{{ opt }}</span>
            <span class="option-radio" :class="{ 'option-radio--checked': selectedPreset === opt && !isCustom }">
              <span v-if="selectedPreset === opt && !isCustom" class="option-radio__dot" />
            </span>
          </div>
        </div>

        <!-- 自訂名稱 -->
        <div
          class="option-card"
          :class="{ 'option-card--active': isCustom }"
          @click="selectCustom"
        >
          <div class="option-row">
            <span class="option-label" :class="{ 'option-label--active': isCustom }">自訂名稱</span>
            <span class="option-radio" :class="{ 'option-radio--checked': isCustom }">
              <span v-if="isCustom" class="option-radio__dot" />
            </span>
          </div>

          <!-- 展開：輸入框 -->
          <div v-if="isCustom" class="subform" @click.stop>
            <div class="input-wrap">
              <input
                v-model="customName"
                class="subform__input"
                maxlength="8"
                placeholder="請輸入名稱"
                autofocus
                @click.stop
              />
              <span class="input-counter">{{ customName.length }}/8</span>
            </div>
            <p class="subform__hint">最多 8 個字，將顯示於卡片標題：我想邀請 ＯＯ</p>
          </div>
        </div>
      </div>
    </div>

    <div class="cta-bar">
      <button class="btn btn--green" :disabled="!canSubmit" @click="emit('submit', resolvedName)">
        下一步
      </button>
    </div>
  </div>
</template>

<style scoped>
* { box-sizing: border-box; }

.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fff;
  -webkit-font-smoothing: antialiased;
}
.form-panel {
  flex: 1;
  padding: 28px 20px 16px;
}
.question {
  font-size: 22px;
  font-weight: 500;
  color: #1a1a1a;
  margin: 0 0 20px 0;
  line-height: 1.4;
}

.option-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.option-card {
  border: 1.5px solid #d5d9de;
  border-radius: 12px;
  background: #fff;
  cursor: pointer;
  overflow: hidden;
  transition: border-color .15s;
}
.option-card--active { border-color: #06C755; }

.option-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
}

.option-label { font-size: 17px; font-weight: 400; color: #3c3c3c; }
.option-label--active { font-weight: 700; color: #1a1a1a; }

.option-radio {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 1.5px solid #d5d9de;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: border-color .15s, background .15s;
}
.option-radio--checked { border-color: #06C755; background: #06C755; box-shadow: 0 0 0 4px rgba(6, 199, 85, 0.2); }
.option-radio__dot { display: none; }

/* 展開子表單 */
.subform {
  padding: 0 18px 16px;
}
.input-wrap {
  position: relative;
}
.subform__input {
  width: 100%;
  border: 1px solid #d5d9de;
  border-radius: 8px;
  padding: 14px 44px 14px 16px;
  font-size: 17px;
  color: #1a1a1a;
  outline: none;
  background: #f9f9f9;
}
.subform__input:focus { border-color: #06C755; background: #fff; }
.input-counter {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  color: #888;
  pointer-events: none;
}
.subform__hint {
  font-size: 13px;
  color: #888;
  margin: 8px 0 0;
  line-height: 1.5;
}

.cta-bar {
  padding: 16px 20px 36px;
}
.btn {
  display: block;
  width: 100%;
  border: none;
  border-radius: 999px;
  padding: 16px;
  font-size: 17px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity .15s;
}
.btn:disabled { opacity: .4; cursor: not-allowed; }
.btn--green { background: #4CAF50; color: #fff; }
</style>
