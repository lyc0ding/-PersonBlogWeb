<template>
  <div class="container">
    <div class="sider">
      <button
        type="button"
        class="tool-button"
        :class="{ hidden: !showToTop }"
        aria-label="回到顶部"
        title="回到顶部"
        @click="scrollToTop"
      >
        <i class="iconfont icon-huidaodingbu" aria-hidden="true"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const showToTop = ref(false);

// 添加节流优化
const throttle = (fn, delay) => {
  let lastCall = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastCall < delay) return;
    lastCall = now;
    fn(...args);
  };
};

const handleScroll = throttle(() => {
  const scrollTop = window.pageYOffset 
    || document.documentElement.scrollTop 
    || document.body.scrollTop;
  
  showToTop.value = scrollTop > 500;
}, 100);

// 回到顶部实现
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  handleScroll();
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
.container {
  width: 100%;
  height: 100%;
  position: relative;
  
  .sider {
    width: 45px;
    height: 45px;
    position: fixed;
    bottom: 50px;
    right: 30px;
    display: flex;
    flex-direction: column;
    
    .tool-button {
      width: 45px;
      height: 45px;
      padding: 0;
      border: 1px solid var(--app-border);
      display: flex;
      border-radius: 50%;
      background: var(--app-surface);
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover {
        transform: scale(1.1);
        background-color: color-mix(in srgb, var(--app-text-primary) 10%, transparent);
      }
      
      .iconfont {
        flex: 1;
        font-size: 28px;
        text-align: center;
        line-height: 43px;
        border-radius: 50%;
        color: var(--nav-trigger-hover);
        transition: color 0.3s ease;
      }
    }
    
    .hidden {
      visibility: hidden;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
  }
}
</style>
