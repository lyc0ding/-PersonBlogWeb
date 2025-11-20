<template>
  <Transition :name="transitionName">
    <div 
      v-if="visible"
      class="toast-message"
      :class="[typeClass, positionClass]"
      :style="customStyles"
    >
      <div class="message-content">
        <slot>{{ content }}</slot>
      </div>
      <button 
        v-if="showClose" 
        class="close-btn" 
        @click="close"
      >
        ×
      </button>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

const props = defineProps({
  content: {
    type: String,
    default: '操作成功！'
  },
  type: {
    type: String,
    default: 'success', // success, error, warning, info
    validator: value => ['success', 'error', 'warning', 'info'].includes(value)
  },
  duration: {
    type: Number,
    default: 3000 // 显示时间(ms)，0表示不自动关闭
  },
  showClose: {
    type: Boolean,
    default: true
  },
  position: {
    type: String,
    default: 'right', // 支持 top, bottom, left, right
    validator: value => ['top', 'bottom', 'left', 'right'].includes(value)
  },
  backgroundColor: String,
  textColor: String,
  zIndex: {
    type: Number,
    default: 1000
  }
})

const emit = defineEmits(['close', 'destroy'])

const visible = ref(false)
const timer = ref(null)

// 根据类型设置样式类
const typeClass = computed(() => `message-${props.type}`)

// 根据位置设置样式类
const positionClass = computed(() => `position-${props.position}`)

// 自定义样式
const customStyles = computed(() => ({
  backgroundColor: props.backgroundColor,
  color: props.textColor,
  zIndex: props.zIndex
}))

// 根据位置确定过渡动画名称
const transitionName = computed(() => {
  switch(props.position) {
    case 'top': return 'slide-down'
    case 'bottom': return 'slide-up'
    case 'left': return 'slide-right'
    default: return 'slide-left' // 默认从右向左
  }
})

// 显示消息
const show = () => {
  visible.value = true
  startTimer()
}

// 关闭消息
const close = () => {
  visible.value = false
  emit('close')
  clearTimer()
}

// 启动定时器
const startTimer = () => {
  if (props.duration > 0) {
    clearTimer()
    timer.value = setTimeout(() => {
      close()
    }, props.duration)
  }
}

// 清除定时器
const clearTimer = () => {
  if (timer.value) {
    clearTimeout(timer.value)
    timer.value = null
  }
}

defineExpose({
  show,
  close
})
</script>

<style scoped>
.toast-message {
  position: fixed;
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  max-width: 380px;
  font-size: 14px;
}

.message-content {
  flex: 1;
  word-break: break-word;
}

.close-btn {
  background: none;
  border: none;
  color: inherit;
  font-size: 18px;
  cursor: pointer;
  margin-left: 15px;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.close-btn:hover {
  opacity: 1;
}

/* 消息类型样式 */
.message-success {
  background-color: #f0f9eb;
  color: #67c23a;
  border: 1px solid #e1f3d8;
}

.message-error {
  background-color: #fef0f0;
  color: #f56c6c;
  border: 1px solid #fde2e2;
}

.message-warning {
  background-color: #fdf6ec;
  color: #e6a23c;
  border: 1px solid #faecd8;
}

.message-info {
  background-color: #f4f4f5;
  color: #909399;
  border: 1px solid #e9e9eb;
}

/* 位置样式 */
.position-top {
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
}

.position-bottom {
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
}

.position-left {
  left: 20px;
  top: 10%;
  transform: translateY(-50%);
}

.position-right {
  right: 20px;
  top: 10%;
  transform: translateY(-50%);
}

/* 动画效果 */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55);
}

.slide-left-enter-from,
.slide-left-leave-to {
  opacity: 0;
  transform: translateY(-50%) translateX(100%);
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55);
}

.slide-right-enter-from,
.slide-right-leave-to {
  opacity: 0;
  transform: translateY(-50%) translateX(-100%);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55);
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(100%);
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55);
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-100%);
}
</style>