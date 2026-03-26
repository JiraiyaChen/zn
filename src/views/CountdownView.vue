<template>
  <div class="countdown-section">
    <div class="section-title">专注倒计时</div>
    <div class="section-desc">为任务划定时间，让专注成为礼物</div>

    <input
      class="cd-task-input"
      v-model="taskName"
      type="text"
      placeholder="这段时间，你想做什么？"
      maxlength="40"
    />

    <div class="cd-presets">
      <button
        v-for="mins in [5, 10, 25, 45, 60]"
        :key="mins"
        class="cd-preset-btn"
        :class="{
          active: !cdRunning && cdH === 0 && cdS === 0 && cdM === mins,
        }"
        @click="cdQuickSet(mins)"
      >
        {{ mins }} 分
      </button>
    </div>

    <div class="cd-picker" :class="{ disabled: cdRunning }">
      <div class="cd-unit">
        <button class="cd-arrow" @click="cdAdjust('h', 1)">▲</button>
        <div class="cd-num">{{ String(cdH).padStart(2, '0') }}</div>
        <button class="cd-arrow" @click="cdAdjust('h', -1)">▼</button>
        <div class="cd-unit-label">时</div>
      </div>
      <div class="cd-sep">:</div>
      <div class="cd-unit">
        <button class="cd-arrow" @click="cdAdjust('m', 1)">▲</button>
        <div class="cd-num">{{ String(cdM).padStart(2, '0') }}</div>
        <button class="cd-arrow" @click="cdAdjust('m', -1)">▼</button>
        <div class="cd-unit-label">分</div>
      </div>
      <div class="cd-sep">:</div>
      <div class="cd-unit">
        <button class="cd-arrow" @click="cdAdjust('s', 1)">▲</button>
        <div class="cd-num">{{ String(cdS).padStart(2, '0') }}</div>
        <button class="cd-arrow" @click="cdAdjust('s', -1)">▼</button>
        <div class="cd-unit-label">秒</div>
      </div>
    </div>

    <div class="cd-task-label">
      {{ isCountdownActive && runningTaskName ? runningTaskName : '&nbsp;' }}
    </div>
    <div
      class="cd-display"
      :class="{ urgent: cdRemaining <= 10 && cdRemaining > 0 }"
    >
      {{ cdDisplayText }}
    </div>

    <div class="cd-progress-track">
      <div class="cd-progress-fill" :style="{ width: progressPct + '%' }"></div>
    </div>

    <div v-if="showDone" class="cd-done-msg">✦ 任务完成，好好休息 ✦</div>

    <div class="cd-controls">
      <button class="cd-btn" @click="resetCountdown" title="重置">↺</button>
      <button class="cd-btn primary" @click="toggleCountdown">
        {{ cdRunning ? '⏸' : '▶' }}
      </button>
    </div>

    <div class="cd-history">
      <div class="cd-history-title">已完成任务</div>
      <div v-if="!cdHistory.length" class="cd-history-empty">
        完成第一个任务后，它会出现在这里。
      </div>
      <div v-for="(item, i) in cdHistory" :key="i" class="cd-history-item">
        <span class="cd-history-name">{{ item.name }}</span>
        <span class="cd-history-meta"
          >{{ item.duration }} &nbsp;·&nbsp; {{ item.time }}</span
        >
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue';
import { useAudio } from '../composables/useAudio';

const { playBell } = useAudio();

const taskName = ref('');
const cdH = ref(0);
const cdM = ref(25);
const cdS = ref(0);
const cdTotalSecs = ref(0);
const cdRemaining = ref(0);
const cdRunning = ref(false);
const isCountdownActive = ref(false);
const showDone = ref(false);
const runningTaskName = ref('');
const cdHistory = ref([]);
let cdInterval = null;

const cdDisplayText = computed(() => {
  if (isCountdownActive.value) return formatCdTime(cdRemaining.value);
  return formatCdTime(cdH.value * 3600 + cdM.value * 60 + cdS.value);
});

const progressPct = computed(() => {
  if (!isCountdownActive.value || cdTotalSecs.value === 0) return 100;
  return (cdRemaining.value / cdTotalSecs.value) * 100;
});

function formatCdTime(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0)
    return (
      String(h).padStart(2, '0') +
      ':' +
      String(m).padStart(2, '0') +
      ':' +
      String(s).padStart(2, '0')
    );
  return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

function cdQuickSet(mins) {
  if (cdRunning.value) return;
  cdH.value = 0;
  cdM.value = mins;
  cdS.value = 0;
}

function cdAdjust(unit, delta) {
  if (cdRunning.value) return;
  if (unit === 'h') cdH.value = Math.max(0, Math.min(23, cdH.value + delta));
  if (unit === 'm') cdM.value = Math.max(0, Math.min(59, cdM.value + delta));
  if (unit === 's') cdS.value = Math.max(0, Math.min(59, cdS.value + delta));
}

function toggleCountdown() {
  showDone.value = false;
  if (cdRunning.value) {
    clearInterval(cdInterval);
    cdRunning.value = false;
  } else {
    if (!isCountdownActive.value) {
      const total = cdH.value * 3600 + cdM.value * 60 + cdS.value;
      if (total <= 0) return;
      cdTotalSecs.value = total;
      cdRemaining.value = total;
      isCountdownActive.value = true;
      runningTaskName.value = taskName.value;
    }
    cdRunning.value = true;
    cdInterval = setInterval(() => {
      cdRemaining.value--;
      if (cdRemaining.value <= 0) {
        clearInterval(cdInterval);
        cdRunning.value = false;
        showDone.value = true;
        playBell();
        saveCdTask();
      }
    }, 1000);
  }
}

function resetCountdown() {
  clearInterval(cdInterval);
  cdRunning.value = false;
  isCountdownActive.value = false;
  cdRemaining.value = 0;
  cdTotalSecs.value = 0;
  showDone.value = false;
  runningTaskName.value = '';
}

function saveCdTask() {
  const name = taskName.value.trim() || '专注任务';
  const item = {
    name,
    duration: formatCdTime(cdTotalSecs.value),
    time: new Date().toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
  const all = [item, ...cdHistory.value].slice(0, 30);
  localStorage.setItem('mindful_cd_history', JSON.stringify(all));
  cdHistory.value = all;
}

// Load history on setup
try {
  cdHistory.value = JSON.parse(
    localStorage.getItem('mindful_cd_history') || '[]'
  );
} catch {
  cdHistory.value = [];
}

onUnmounted(() => clearInterval(cdInterval));
</script>
