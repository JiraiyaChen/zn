<template>
  <div class="journal-section">
    <div class="journal-header">
      <div>
        <div class="section-title">正念日记</div>
        <div class="section-desc" style="margin-bottom: 0">
          记录，是对自己的凝视
        </div>
      </div>
      <div class="journal-date">{{ todayStr }}</div>
    </div>

    <div class="mood-row">
      <button
        v-for="(item, idx) in moods"
        :key="item.label"
        class="mood-btn"
        :class="{ selected: selectedMoodIdx === idx }"
        @click="selectedMoodIdx = selectedMoodIdx === idx ? -1 : idx"
      >
        {{ item.emoji }}
        <span>{{ item.label }}</span>
      </button>
    </div>

    <div class="journal-prompts">
      <span
        v-for="p in prompts"
        :key="p"
        class="prompt-chip"
        @click="injectPrompt(p)"
        >{{ p }}</span
      >
    </div>

    <textarea
      ref="taRef"
      class="journal-textarea"
      v-model="journalText"
      placeholder="把你的感受写在这里...不需要华丽，只需真实。"
    ></textarea>

    <div class="journal-footer">
      <button class="save-btn" @click="saveEntry">保存这一刻</button>
    </div>

    <div class="journal-entries">
      <div class="entries-title">过往记录</div>
      <div v-if="!entries.length" class="no-entries-hint">
        还没有记录，留下今天的第一笔吧。
      </div>
      <div v-for="(entry, i) in entries" :key="i" class="entry-item">
        <div class="entry-meta">
          <span class="entry-date-tag">{{ entry.date }}</span>
          <span class="entry-mood">{{ entry.mood }}</span>
        </div>
        <div class="entry-text">{{ entry.text }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const moods = [
  { emoji: '😌', label: '平静' },
  { emoji: '😊', label: '愉悦' },
  { emoji: '😌', label: '满足' },
  { emoji: '😔', label: '低落' },
  { emoji: '😟', label: '焦虑' },
  { emoji: '😤', label: '烦躁' },
];

const prompts = [
  '此刻我注意到...',
  '我感激...',
  '让我放下...',
  '我需要的是...',
  '今天的礼物是...',
];

const taRef = ref(null);
const selectedMoodIdx = ref(-1);
const journalText = ref('');
const entries = ref([]);

const todayStr = computed(() =>
  new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })
);

function injectPrompt(text) {
  const ta = taRef.value;
  if (!ta) return;
  const pos = ta.selectionStart;
  journalText.value =
    journalText.value.substring(0, pos) +
    text +
    journalText.value.substring(pos);
  setTimeout(() => {
    ta.focus();
    ta.selectionStart = ta.selectionEnd = pos + text.length;
  }, 0);
}

function saveEntry() {
  const text = journalText.value.trim();
  if (!text) return;
  const mood =
    selectedMoodIdx.value >= 0 ? moods[selectedMoodIdx.value].emoji : '';
  const newEntry = {
    date: new Date().toLocaleString('zh-CN', {
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    mood,
    text,
  };
  const all = [newEntry, ...entries.value].slice(0, 50);
  localStorage.setItem('mindful_entries', JSON.stringify(all));
  entries.value = all;
  journalText.value = '';
  selectedMoodIdx.value = -1;
}

onMounted(() => {
  try {
    entries.value = JSON.parse(localStorage.getItem('mindful_entries') || '[]');
  } catch {
    entries.value = [];
  }
});
</script>
