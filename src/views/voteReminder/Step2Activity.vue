<script setup lang="ts">
import { computed, ref } from 'vue';

type CardData = {
  person: string;
  inviteText: string;
};

const props = defineProps<{
  person: string;
}>();

const PRESET_LABELS = ['一起吃早餐', '一起散步過去', '投完去喝飲料'];

const buildInviteText = (label: string) => `投票日我們${label}，\n再一起去投票！`;

const selectedPreset = ref<number | null>(null);
const isCustom = ref(false);
const customText = ref('');
const useTemplate = ref(true);

const selectPreset = (idx: number) => {
  selectedPreset.value = idx;
  isCustom.value = false;
};

const selectCustom = () => {
  selectedPreset.value = null;
  isCustom.value = true;
};

const previewText = computed(() => {
  if (!customText.value.trim()) return '';
  if (useTemplate.value) return `投票日${customText.value.trim()}，再一起去投票！`;
  return customText.value.trim();
});

const resolvedText = computed(() => {
  if (isCustom.value) return previewText.value;
  if (selectedPreset.value !== null) return buildInviteText(PRESET_LABELS[selectedPreset.value]);
  return '';
});

const canSubmit = computed(() => !!resolvedText.value);

const emit = defineEmits<{
  submit: [value: CardData];
  back: [];
}>();

const submit = () => {
  if (!canSubmit.value) return;
  emit('submit', { person: props.person, inviteText: resolvedText.value });
};
</script>

<template>
  <div class="page">
    <div class="form-panel">
      <h2 class="question">投票日，想跟{{ person }}一起做什麼？</h2>

      <div class="option-list">
        <!-- 預設選項 -->
        <div
          v-for="(label, idx) in PRESET_LABELS"
          :key="idx"
          class="option-card"
          :class="{ 'option-card--active': selectedPreset === idx && !isCustom }"
          @click="selectPreset(idx)"
        >
          <div class="option-row">
            <span class="option-label" :class="{ 'option-label--active': selectedPreset === idx && !isCustom }">{{ label }}</span>
            <span class="option-radio" :class="{ 'option-radio--checked': selectedPreset === idx && !isCustom }">
              <span v-if="selectedPreset === idx && !isCustom" class="option-radio__dot" />
            </span>
          </div>
        </div>

        <!-- 自己寫一句話 -->
        <div
          class="option-card"
          :class="{ 'option-card--active': isCustom }"
          @click="selectCustom"
        >
          <div class="option-row">
            <span class="option-label" :class="{ 'option-label--active': isCustom }">自己寫一句話</span>
            <span class="option-radio" :class="{ 'option-radio--checked': isCustom }">
              <span v-if="isCustom" class="option-radio__dot" />
            </span>
          </div>

          <!-- 展開子表單 -->
          <div v-if="isCustom" class="subform" @click.stop>
            <!-- 統一輸入框：文字區 + 計數器合為一個框 -->
            <div class="textarea-box" @click.stop>
              <textarea
                v-model="customText"
                class="subform__textarea"
                maxlength="24"
                placeholder="請輸入文字"
                rows="2"
                autofocus
                @click.stop
              />
              <div class="textarea-footer">
                <span>最多 24 字</span>
                <span>{{ customText.length }}/24</span>
              </div>
            </div>

            <!-- 使用預設句型 checkbox -->
            <label class="template-row" @click.stop="useTemplate = !useTemplate">
              <span class="checkbox" :class="{ 'checkbox--checked': useTemplate }">
                <svg v-if="useTemplate" width="12" height="10" viewBox="0 0 12 10" fill="none">
                  <path d="M1 5l3.5 3.5L11 1" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
              <span class="template-label">使用預設句型</span>
            </label>

            <!-- 預覽文字 -->
            <div class="preview">
              <span class="preview-label">邀請卡將顯示：</span>
              <span v-if="previewText" class="preview-text">{{ previewText }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="cta-bar">
      <button class="btn btn--green" :disabled="!canSubmit" @click="submit">下一步</button>
      <button class="btn btn--outline" @click="emit('back')">上一步</button>
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

/* 子表單 */
.subform {
  padding: 0 18px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 統一輸入框 */
.textarea-box {
  border: 1px solid #d5d9de;
  border-radius: 8px;
  background: #f9f9f9;
  overflow: hidden;
}
.textarea-box:focus-within { border-color: #06C755; background: #fff; }

.subform__textarea {
  width: 100%;
  border: none;
  background: transparent;
  padding: 10px 12px 4px;
  font-size: 15px;
  color: #1a1a1a;
  outline: none;
  resize: none;
  display: block;
  font-family: inherit;
  line-height: 1.6;
}

.textarea-footer {
  display: flex;
  justify-content: space-between;
  padding: 2px 12px 8px;
  font-size: 13px;
  color: #888;
}

/* 使用預設句型 */
.template-row {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}
.checkbox {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 1.5px solid #d5d9de;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background .15s, border-color .15s;
}
.checkbox--checked { background: #06C755; border-color: #06C755; }
.template-label { font-size: 15px; color: #1a1a1a; }

/* 預覽 */
.preview {
  background: #f4f4f4;
  border-radius: 8px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.preview-label { font-size: 13px; color: #888; }
.preview-text { font-size: 15px; color: #1a1a1a; font-weight: 400; line-height: 1.6; }

/* CTA */
.cta-bar {
  padding: 16px 20px 36px;
  display: flex;
  flex-direction: column;
  gap: 12px;
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
.btn--outline { background: #fff; color: #444; border: 1.5px solid #d5d9de; font-weight: 400; }
</style>
