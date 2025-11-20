<template>
  <!-- 图片预览模态框 -->
  <div v-if="showPreview" class="image-preview-modal">
    <!-- 遮罩层 -->
    <div class="preview-overlay" @click="closePreview"></div>
    
    <!-- 预览内容区域 -->
    <div class="preview-content">
      <!-- 控制按钮 -->
      <div class="preview-controls">
        <button @click="zoomIn" title="放大">
          <i class="iconfont icon-fangda"></i>
        </button>
        <button @click="zoomOut" title="缩小">
          <i class="iconfont icon-suoxiao"></i>
        </button>
        <button @click="rotateLeft" title="左旋转">
          <i class="iconfont icon-zuoxuanzhuan"></i>
        </button>
        <button @click="rotateRight" title="右旋转">
          <i class="iconfont icon-youxuanzhuan"></i>
        </button>
        <button @click="reset" title="重置">
          <i class="iconfont icon-zhongzhi"></i>
        </button>
        <button @click="closePreview" title="关闭">
          <i class="iconfont icon-close"></i>
        </button>
      </div>
      
      <!-- 图片区域 -->
      <div class="image-container" 
           @mousedown="startDrag"
           @mousemove="onDrag"
           @mouseup="stopDrag"
           @mouseleave="stopDrag"
           @wheel.prevent="handleWheel">
        <img ref="previewImage" 
             :src="currentImage" 
             :style="imageStyle" 
             alt="预览图片" 
             class="preview-image" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

// 组件属性
const props = defineProps({
  showPreview: Boolean,
  currentImage: String
});

// 组件事件
const emit = defineEmits(['close']);

// 图片状态
const scale = ref(1);
const rotate = ref(0);
const position = ref({ x: 0, y: 0 });
const isDragging = ref(false);
const startDragPosition = ref({ x: 0, y: 0 });
const previewImage = ref(null);

// 图片样式计算
const imageStyle = computed(() => {
  return {
    transform: `scale(${scale.value}) rotate(${rotate.value}deg) translate(${position.value.x}px, ${position.value.y}px)`,
    cursor: isDragging.value ? 'grabbing' : 'grab'
  };
});

// 缩放功能
const zoomIn = () => scale.value += 0.1;
const zoomOut = () => {
  if (scale.value > 0.2) scale.value -= 0.1;
};

// 旋转功能
const rotateLeft = () => rotate.value -= 90;
const rotateRight = () => rotate.value += 90;

// 重置功能
const reset = () => {
  scale.value = 1;
  rotate.value = 0;
  position.value = { x: 0, y: 0 };
};

// 关闭预览
const closePreview = () => {
  reset();
  emit('close');
};

// 拖拽功能
const startDrag = (event) => {
  isDragging.value = true;
  startDragPosition.value = {
    x: event.clientX - position.value.x,
    y: event.clientY - position.value.y
  };
};

const onDrag = (event) => {
  if (!isDragging.value) return;
  
  position.value = {
    x: event.clientX - startDragPosition.value.x,
    y: event.clientY - startDragPosition.value.y
  };
};

const stopDrag = () => {
  isDragging.value = false;
};

// 滚轮缩放
const handleWheel = (event) => {
  event.preventDefault();
  const delta = event.deltaY > 0 ? -0.1 : 0.1;
  scale.value = Math.max(0.2, scale.value + delta);
};

// 键盘控制
const handleKeyDown = (event) => {
  if (!props.showPreview) return;
  
  switch(event.key) {
    case 'Escape':
      closePreview();
      break;
    case '+':
    case '=':
      zoomIn();
      break;
    case '-':
      zoomOut();
      break;
    case 'ArrowLeft':
      rotateLeft();
      break;
    case 'ArrowRight':
      rotateRight();
      break;
    case '0':
      reset();
      break;
  }
};

// 添加/移除键盘事件监听
onMounted(() => window.addEventListener('keydown', handleKeyDown));
onUnmounted(() => window.removeEventListener('keydown', handleKeyDown));
</script>

<style scoped>
/* 预览模态框 */
.image-preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* 遮罩层 */
.preview-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(3px);
}

/* 预览内容区域 */
.preview-content {
  position: relative;
  z-index: 1001;
  max-width: 80vw;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  background-color: white;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

/* 控制按钮 */
.preview-controls {
  display: flex;
  justify-content: center;
  padding: 15px;
  background-color: rgba(0, 0, 0, 0.7);
  gap: 12px;
}

.preview-controls button {
  background: rgba(255, 255, 255, 0.15);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: white;
  font-size: 16px;

  & > .iconfont{
    font-size: 25px;
  }
}

.preview-controls button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

/* 图片容器 */
.image-container {
  padding: 20px;
  max-width: 100%;
  max-height: calc(90vh - 70px);
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

/* 预览图片 */
.preview-image {
  max-width: 100%;
  max-height: 100%;
  transition: transform 0.3s ease-out;
  object-fit: contain;
}
</style>