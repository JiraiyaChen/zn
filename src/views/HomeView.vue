<template>
  <div>
    <div class="hero">
      <div class="hero-subtitle">每一刻 · 皆圆满</div>
      <h1>活在<br />当下</h1>
      <p>
        正念不是逃离，而是全然地与当下相遇。<br />
        放下过去，放下未来，只是此时此刻。
      </p>
      <button class="hero-cta" @click="router.push('/breath')">开始练习</button>
    </div>

    <div class="quote-card">
      <div class="tag">今日正念</div>
      <blockquote>{{ quote.text }}</blockquote>
      <cite>— {{ quote.author }}</cite>
      <button class="quote-refresh" @click="refreshQuote">↻ 换一句</button>
    </div>

    <div class="feature-grid">
      <div class="feature-card" @click="router.push('/breath')">
        <div class="feature-icon">🌬</div>
        <h3>呼吸练习</h3>
        <p>通过引导式呼吸，平复身心，回到当下。</p>
      </div>
      <div class="feature-card" @click="router.push('/timer')">
        <div class="feature-icon">🔔</div>
        <h3>冥想计时</h3>
        <p>为你的冥想设定时间，专注当下片刻。</p>
      </div>
      <div class="feature-card" @click="router.push('/journal')">
        <div class="feature-icon">📖</div>
        <h3>正念日记</h3>
        <p>记录内心感受，觉察情绪流动的轨迹。</p>
      </div>
      <div class="feature-card" @click="router.push('/countdown')">
        <div class="feature-icon">⏳</div>
        <h3>专注倒计时</h3>
        <p>为任务划定时间，让每一分钟都有着落。</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const QUOTES = [
  { text: '你无法停止海浪，但你可以学会冲浪。', author: '卡巴金' },
  { text: '正念就是：不加评判地，有意识地，活在当下。', author: '乔·卡巴金' },
  { text: '呼吸是我们与当下唯一的纽带。', author: '蒂克·纳特·汉' },
  { text: '每一次呼吸，都是重新开始的机会。', author: '佚名' },
  { text: '平静不是事物消失，而是你不再被事物席卷。', author: '佚名' },
  { text: '在慢下来的瞬间，生命才真正流过你。', author: '佚名' },
  { text: '不去评判，只是观察，这就是自由的开始。', author: '蒂克·纳特·汉' },
  { text: '感谢此刻，它将不再重来。', author: '佚名' },
  { text: '放下不是失去，而是给内心腾出空间。', author: '佚名' },
  { text: '身体在哪里，心就在哪里。这就是正念。', author: '卡巴金' },
  { text: '深呼吸，到达自己。', author: '蒂克·纳特·汉' },
  { text: '觉知本身就是疗愈。', author: '卡尔·罗杰斯' },
];

let currentIdx = -1;
const quote = ref({ text: '', author: '' });

function refreshQuote() {
  let idx;
  do {
    idx = Math.floor(Math.random() * QUOTES.length);
  } while (idx === currentIdx);
  currentIdx = idx;
  quote.value = QUOTES[idx];
}

onMounted(() => refreshQuote());
</script>
