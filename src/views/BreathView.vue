<template>
  <div class="breath-section">
    <div class="section-title">呼吸练习</div>
    <div class="section-desc">跟随节奏，让呼吸成为锚点</div>

    <div class="breath-modes">
      <button
        v-for="(mode, key) in BREATH_MODES"
        :key="key"
        class="mode-btn"
        :class="{ active: breathMode === key }"
        @click="selectMode(key)"
      >
        {{ mode.label }}
      </button>
    </div>

    <div class="breath-orb-wrapper">
      <div class="glow-ring glow-ring-1"></div>
      <div class="glow-ring glow-ring-2"></div>
      <!-- ref 用于直接操控 CSS 动画重启，orbClass 保持 Vue 同步 -->
      <div ref="orbRef" :class="orbClass" @click="toggleBreath">
        <span class="orb-label">{{ orbLabel }}</span>
      </div>
    </div>

    <div class="breath-status">{{ breathStatus }}</div>
    <div class="breath-count">{{ breathRound > 0 ? breathRound : '' }}</div>
    <div class="breath-info">{{ breathInfo }}</div>
    <button class="breath-start-btn" @click="toggleBreath">
      {{ breathRunning ? '停止' : '开始' }}
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue';

const BREATH_MODES = {
  478: { label: '4-7-8 放松', inhale: 4, hold: 7, exhale: 8, hold2: 0 },
  box: { label: '方形呼吸', inhale: 4, hold: 4, exhale: 4, hold2: 4 },
  calm: { label: '4-4 平静', inhale: 4, hold: 0, exhale: 4, hold2: 0 },
  deep: { label: '深度放松', inhale: 5, hold: 2, exhale: 7, hold2: 0 },
};

const orbRef = ref(null);
const orbClass = ref('breath-orb');
const orbLabel = ref('点击开始');
const breathRunning = ref(false);
const breathMode = ref('478');
const breathRound = ref(0);
const breathStatus = ref('');
let breathTimer = null;

const breathInfo = computed(() => {
  const m = BREATH_MODES[breathMode.value];
  const parts = [`吸气 ${m.inhale}s`];
  if (m.hold) parts.push(`屏息 ${m.hold}s`);
  parts.push(`呼气 ${m.exhale}s`);
  if (m.hold2) parts.push(`屏息 ${m.hold2}s`);
  return parts.join('  ·  ');
});

function selectMode(key) {
  if (breathRunning.value) stopBreath();
  breathMode.value = key;
}

function toggleBreath() {
  breathRunning.value ? stopBreath() : startBreath();
}

function stopBreath() {
  breathRunning.value = false;
  clearTimeout(breathTimer);
  orbClass.value = 'breath-orb';
  if (orbRef.value) orbRef.value.className = 'breath-orb';
  orbLabel.value = '点击开始';
  breathStatus.value = '';
  breathRound.value = 0;
}

function startBreath() {
  breathRunning.value = true;
  breathRound.value = 0;
  nextPhase('inhale');
}

function nextPhase(phase) {
  if (!breathRunning.value) return;
  const m = BREATH_MODES[breathMode.value];
  const phaseMap = {
    inhale: {
      label: '吸 气',
      next: m.hold > 0 ? 'hold' : 'exhale',
      dur: m.inhale,
      css: 'inhale',
      cssProp: '--in-dur',
      lbl: '吸',
    },
    hold: {
      label: '屏 息',
      next: 'exhale',
      dur: m.hold,
      css: 'hold',
      cssProp: '--hold-dur',
      lbl: '停',
    },
    exhale: {
      label: '呼 气',
      next: m.hold2 > 0 ? 'hold2' : 'inhale',
      dur: m.exhale,
      css: 'exhale',
      cssProp: '--ex-dur',
      lbl: '呼',
    },
    hold2: {
      label: '屏 息',
      next: 'inhale',
      dur: m.hold2,
      css: 'hold2',
      cssProp: '--hold2-dur',
      lbl: '停',
    },
  };

  const p = phaseMap[phase];
  if (!p) return;

  // CSS 动画重启技巧：直接操作 DOM + 强制 reflow，再同步 Vue 响应式状态
  if (orbRef.value) {
    orbRef.value.style.setProperty(p.cssProp, p.dur + 's');
    orbRef.value.className = 'breath-orb';
    void orbRef.value.offsetWidth; // 强制 reflow，重置动画
    orbRef.value.className = `breath-orb ${p.css}`;
  }
  orbClass.value = `breath-orb ${p.css}`; // 保持 Vue VNode 同步

  orbLabel.value = p.lbl;
  breathStatus.value = p.label;
  if (phase === 'exhale') breathRound.value++;

  breathTimer = setTimeout(() => {
    if (!breathRunning.value) return;
    nextPhase(p.next);
  }, p.dur * 1000);
}

onUnmounted(() => {
  clearTimeout(breathTimer);
  breathRunning.value = false;
});
</script>
