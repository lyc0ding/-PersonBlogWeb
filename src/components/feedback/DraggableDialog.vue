<template>
  <!-- 遮罩层 @click.self="closeDialog" -->
  <div v-if="visible" class="dialog-mask">
    <!-- 弹窗主体 -->
    <div 
      class="dialog-container"
      ref="dialog"
      :style="{ top: position.y + 'px', left: position.x + 'px' }"
    >
      <!-- 可拖拽区域（顶部20px） -->
      <div 
        class="dialog-header"
        @mousedown="startDrag"
      >
        <slot name="header"></slot>
        <button class="close-btn" @click="closeDialog">
          <i class="iconfont icon-guanbi1"/>
        </button>
      </div>
      
      <!-- 内容区域（父组件自定义） -->
      <div class="dialog-content">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, watch,nextTick} from 'vue'


const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

// 弹窗位置
const position = reactive({ x: 0, y: 0 })
// 拖拽状态和初始位置
const isDragging = ref(false)
const startPos = reactive({ x: 0, y: 0 })
const dialog = ref(null)

// 计算居中位置
const calculateCenter = () => {
  if (!dialog.value) return
  const { width, height } = dialog.value.getBoundingClientRect()
  position.x = (window.innerWidth - width) / 2
  position.y = (window.innerHeight - height) / 3
}

// 开始拖拽
const startDrag = (e) => {
  if (e.target.classList.contains('close-btn')) return
  
  isDragging.value = true
  startPos.x = e.clientX - position.x
  startPos.y = e.clientY - position.y
  document.addEventListener('mousemove', dragDialog)
  document.addEventListener('mouseup', stopDrag)
}

// 拖拽中
const dragDialog = (e) => {
  if (!isDragging.value) return
  
  position.x = e.clientX - startPos.x
  position.y = e.clientY - startPos.y
  
  // 限制在窗口内
  const { width, height } = dialog.value.getBoundingClientRect()
  position.x = Math.max(0, Math.min(position.x, window.innerWidth - width))
  position.y = Math.max(0, Math.min(position.y, window.innerHeight - height))
}

// 停止拖拽
const stopDrag = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', dragDialog)
  document.removeEventListener('mouseup', stopDrag)
}

// 关闭弹窗
const closeDialog = () => {
  emit('close')
}

// 监听窗口变化时重新居中
onMounted(() => {
  window.addEventListener('resize', calculateCenter)
})

onUnmounted(() => {
  window.removeEventListener('resize', calculateCenter)
  document.removeEventListener('mousemove', dragDialog)
  document.removeEventListener('mouseup', stopDrag)
})

// 当visible变化时重新计算位置
watch(() => props.visible, (newVal) => {
  if (newVal) {
    nextTick(calculateCenter)
  }
})
</script>

<style scoped>
.dialog-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--app-backdrop);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.dialog-container {
  position: absolute;
  background: var(--app-dialog-bg);
  box-shadow: 0 2px 12px 0 var(--app-shadow-soft);
  color: var(--app-text-primary);
  overflow: hidden;
  min-width: 400px;
  min-height: 200px;
}

.dialog-header {
  font-size: 20px;
  font-weight: 700;
  padding: 16px 20px;
  cursor: move;
  display: flex;
  justify-content: space-between;
  align-items: center;
  user-select: none;
}

/* 关闭按钮 */
.close-btn {
  cursor: pointer;
  font-size: 20px;
  color: var(--app-dialog-muted);
  background: transparent;
  border: none;
  outline: none;
  padding: 0 10px;
}

/* 关闭按钮高亮 */
.close-btn:hover {
  color: var(--app-dialog-danger);
}

.dialog-content {
  padding: 20px;
  max-height: 70vh; 
  overflow-y: auto;
}
</style>