import { reactive } from 'vue';

// 模块级状态：切换路由后音效持续播放
const soundNodes = {};
export const activeSounds = reactive(new Set());

export function useAudio() {
  function playBell() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();

      // 敲击一次铃声：freq 频率，t 起始时间，dur 持续时长，vol 峰值音量
      function strike(freq, t, dur, vol) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        // 第二谐波叠加，让音色更饱满
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc.type = 'sine';
        osc2.type = 'sine';
        osc.frequency.value = freq;
        osc2.frequency.value = freq * 2.756; // 非整数谐波，类钟声
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(vol, t + 0.01); // 瞬间起音
        gain.gain.exponentialRampToValueAtTime(0.001, t + dur); // 缓慢衰减
        gain2.gain.setValueAtTime(0, t);
        gain2.gain.linearRampToValueAtTime(vol * 0.3, t + 0.01);
        gain2.gain.exponentialRampToValueAtTime(0.001, t + dur * 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + dur);
        osc2.start(t);
        osc2.stop(t + dur);
      }

      // 三次敲击：0s / 1.5s / 3.0s，每次渐弱，总时长约 5s
      strike(528, ctx.currentTime, 5.0, 0.45);
      strike(528, ctx.currentTime + 1.5, 3.5, 0.3);
      strike(528, ctx.currentTime + 3.0, 2.0, 0.18);
    } catch (e) {}
  }

  function toggleSound(type) {
    if (activeSounds.has(type)) {
      activeSounds.delete(type);
      try {
        soundNodes[type]?.stop();
      } catch (e) {}
      delete soundNodes[type];
      return;
    }
    activeSounds.add(type);
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const buf = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < buf.length; i++) data[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      src.buffer = buf;
      src.loop = true;
      const filterMap = {
        rain: 'bandpass',
        forest: 'lowpass',
        ocean: 'lowshelf',
        fire: 'highpass',
      };
      const freqMap = { rain: 800, forest: 400, ocean: 200, fire: 1200 };
      filter.type = filterMap[type] || 'lowpass';
      filter.frequency.value = freqMap[type] || 600;
      gain.gain.value = 0.06;
      src.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      src.start();
      soundNodes[type] = src;
    } catch (e) {
      activeSounds.delete(type);
    }
  }

  function stopAllSounds() {
    for (const key of Object.keys(soundNodes)) {
      try {
        soundNodes[key].stop();
      } catch (e) {}
      delete soundNodes[key];
    }
    activeSounds.clear();
  }

  return { playBell, toggleSound, stopAllSounds, activeSounds };
}
