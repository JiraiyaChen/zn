import { reactive } from 'vue';

// 模块级状态：切换路由后音效持续播放
const soundNodes = {};
export const activeSounds = reactive(new Set());

export function useAudio() {
  function playBell() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(528, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(264, ctx.currentTime + 2);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 2.5);
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
