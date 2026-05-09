<template>
  <Teleport to="body">
    <transition name="fade">
      <div v-if="show" class="overlay" @click.self="handleClick">
        <div class="spinner-container">
          <div class="spinner"></div>
          <p v-if="message">{{ message }}</p>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  // 控制遮罩显示/隐藏
  show: { type: Boolean, default: false },
  // 可自定义的加载提示文本
  message: { type: String, default: '加载中，请稍候...' },
  // 是否允许点击遮罩关闭
  clickToClose: { type: Boolean, default: false }
});

const emit = defineEmits(['close']);

// 处理遮罩点击事件
const handleClick = () => {
  if (props.clickToClose) {
    emit('close');
  }
};
</script>

<style scoped>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--app-loading-overlay);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(1px); /* 背景模糊效果 */
}

.spinner-container {
  text-align: center;
  color: var(--app-on-media);
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid color-mix(in srgb, var(--app-on-media) 35%, transparent);
  border-radius: 50%;
  border-top-color: var(--app-on-media);
  animation: spin 1s ease-in-out infinite;
  margin: 0 auto 15px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 过渡动画 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>