<template>
  <div class="timer-section">
    <div class="section-title">冥想计时</div>
    <div class="section-desc">为此刻设定一段专属的静默</div>

    <div class="timer-presets">
      <button
        v-for="mins in [5, 10, 15, 20, 30]"
        :key="mins"
        class="preset-btn"
        :class="{ active: timerTotal === mins * 60 }"
        @click="setPreset(mins)"
      >
        {{ mins }} 分钟
      </button>
    </div>

    <div class="timer-circle-wrap">
      <svg class="timer-svg" width="240" height="240" viewBox="0 0 240 240">
        <defs>
          <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#a3c4a8" />
            <stop offset="100%" stop-color="#c9a0dc" />
          </linearGradient>
        </defs>
        <circle class="timer-track" cx="120" cy="120" r="108" />
        <circle
          class="timer-progress"
          cx="120"
          cy="120"
          r="108"
          stroke-dasharray="678.6"
          :stroke-dashoffset="strokeDashoffset"
        />
      </svg>
      <div class="timer-center">
        <div class="timer-display">{{ timerDisplay }}</div>
        <div class="timer-label">{{ timerLabel }}</div>
      </div>
    </div>

    <div class="timer-controls">
      <button
        class="timer-btn"
        :disabled="timerRunning"
        @click="adjustTimer(-60)"
      >
        −
      </button>
      <button class="timer-btn primary" @click="toggleTimer">
        {{ timerRunning ? '⏸' : '▶' }}
      </button>
      <button class="timer-btn" @click="resetTimer">↺</button>
    </div>

    <div class="ambient-section">
      <div class="ambient-title">环境音效</div>
      <div class="ambient-sounds">
        <button
          v-for="s in SOUNDS"
          :key="s.type"
          class="sound-btn"
          :class="{ active: activeSounds.has(s.type) }"
          @click="toggleSound(s.type)"
        >
          {{ s.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue';
import { useAudio } from '../composables/useAudio';

const { playBell, toggleSound, stopAllSounds, activeSounds } = useAudio();

const SOUNDS = [
  { type: 'rain', label: '🌧 雨声' },
  { type: 'forest', label: '🌿 森林' },
  { type: 'ocean', label: '🌊 海浪' },
  { type: 'fire', label: '🔥 篝火' },
];

const CIRCUM = 2 * Math.PI * 108; // ≈ 678.6

const timerTotal = ref(5 * 60);
const timerRemaining = ref(5 * 60);
const timerRunning = ref(false);
const timerLabel = ref('准备好了吗');
let timerInterval = null;

const timerDisplay = computed(() => {
  const m = Math.floor(timerRemaining.value / 60);
  const s = timerRemaining.value % 60;
  return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
});

const strokeDashoffset = computed(
  () => CIRCUM * (1 - timerRemaining.value / timerTotal.value)
);

function setPreset(mins) {
  timerTotal.value = mins * 60;
  resetTimer();
}

function adjustTimer(delta) {
  if (timerRunning.value) return;
  timerTotal.value = Math.max(60, timerTotal.value + delta);
  timerRemaining.value = timerTotal.value;
}

function toggleTimer() {
  if (timerRunning.value) {
    clearInterval(timerInterval);
    timerRunning.value = false;
    timerLabel.value = '已暂停';
  } else {
    if (timerRemaining.value <= 0) resetTimer();
    timerRunning.value = true;
    timerLabel.value = '冥想中...';
    timerInterval = setInterval(() => {
      timerRemaining.value--;
      if (timerRemaining.value <= 0) {
        clearInterval(timerInterval);
        timerRunning.value = false;
        timerLabel.value = '圆满完成 ✦';
        playBell();
      }
    }, 1000);
  }
}

function resetTimer() {
  clearInterval(timerInterval);
  timerRunning.value = false;
  timerRemaining.value = timerTotal.value;
  timerLabel.value = '准备好了吗';
}

onUnmounted(() => {
  clearInterval(timerInterval);
  stopAllSounds();
});
</script>
