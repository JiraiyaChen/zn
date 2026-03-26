<template>
  <div class="stars">
    <header>
      <div class="logo">正 念</div>
      <nav>
        <button
          v-for="item in navItems"
          :key="item.path"
          :class="{ active: route.path === item.path }"
          @click="router.push(item.path)"
        >
          {{ item.label }}
        </button>
      </nav>
    </header>

    <div class="container">
      <RouterView v-slot="{ Component }">
        <Transition name="page-fade" mode="out-in">
          <component :is="Component" v-if="Component" :key="route.path" />
        </Transition>
      </RouterView>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const navItems = [
  { path: '/', label: '首页' },
  { path: '/breath', label: '呼吸' },
  { path: '/timer', label: '冥想' },
  { path: '/journal', label: '日记' },
  { path: '/countdown', label: '倒计时' },
];
</script>
