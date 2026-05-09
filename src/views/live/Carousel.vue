<template>
  <div 
    class="carousel-container" 
    @mouseenter="stopAutoplay" 
    @mouseleave="startAutoplay"
    @wheel="handleWheel"
  >
    <!-- 走马灯容器 -->
    <div class="carousel-wrapper">
      <!-- 图片轨道，通过transform实现滑动效果 -->
      <div 
        class="carousel-track" 
        :style="{ 
          transform: `translateX(-${currentIndex * 100}%)`,
          transition: isTransitioning ? 'transform 0.5s ease-out' : 'none'
        }"  
        @transitionend="handleTransitionEnd"
      >
        <!-- 渲染图片，复制第一张到末尾实现无缝滚动 -->
        <div 
          class="carousel-item" 
          v-for="(item, index) in extendedImages" 
          :key="index"
        >
          <img :src="item.src" :alt="item.alt" class="carousel-img">
        </div>
      </div>
    </div>
    
    <!-- 导航按钮 -->
    <button class="nav-btn prev-btn" @click="prevSlide">
      <i class="iconfont icon-zuojiantou"></i>
    </button>
    <button class="nav-btn next-btn" @click="nextSlide">
        <i class="iconfont icon-youjiantou"></i>
    </button>
    
    <!-- 指示器 -->
    <div class="indicators">
      <button 
        class="indicator" 
        v-for="(item, index) in images" 
        :key="index"
        :class="{ active: index === realIndex }"
        @click="goToSlide(index)"
      ></button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

// 图片数据 - 实际使用时可替换为你的图片地址
const images = ref([
  { src: 'https://wallpaperm.cmcm.com/398f4912b45260cca24eb3ec9b37e711.jpg', alt: '风景图片1' },
  { src: 'https://tse4-mm.cn.bing.net/th/id/OIP-C.focTqr1sYnUJ4cu8oa6snwHaEh?w=296&h=181&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3', alt: '风景图片2' },
  { src: 'https://img1.qunarzz.com/travel/d8/1610/f2/871050328bca42b5.jpg?color=#337a98', alt: '风景图片3' },
  { src: 'https://n.sinaimg.cn/sinacn08/199/w1600h999/20180731/5d3d-hhacrcc9704465.jpg', alt: '风景图片4' }
]);

// 当前显示的图片索引
const currentIndex = ref(0);
// 是否正在过渡动画中
const isTransitioning = ref(false);
// 自动播放计时器
const autoplayTimer = ref(null);
// 自动播放间隔(毫秒)
const autoplayInterval = 3000;

// 扩展图片数组，在末尾添加第一张图片用于无缝滚动
const extendedImages = computed(() => {
  return [...images.value, images.value[0]];
});

// 计算实际显示的索引（用于指示器）
const realIndex = computed(() => {
  return currentIndex.value % images.value.length;
});

// 切换到下一张（自左向右）
const nextSlide = () => {
  if (isTransitioning.value) return;
  
  isTransitioning.value = true;
  currentIndex.value++;
};

// 切换到上一张
const prevSlide = () => {
  if (isTransitioning.value) return;
  
  isTransitioning.value = true;
  // 如果当前是第一张，先切换到最后复制的那张
  if (currentIndex.value === 0) {
    currentIndex.value = images.value.length;
    // 强制重绘后再执行动画
    setTimeout(() => {
      currentIndex.value--;
    }, 50);
  } else {
    currentIndex.value--;
  }
};

// 跳转到指定图片
const goToSlide = (index) => {
  if (isTransitioning.value || index === realIndex.value) return;
  
  isTransitioning.value = true;
  currentIndex.value = index;
};

// 处理过渡结束事件
const handleTransitionEnd = () => {
  // 如果滚动到了最后复制的那张，无缝切换到第一张
  if (currentIndex.value === images.value.length) {
    isTransitioning.value = false;
    currentIndex.value = 0;
  } else {
    isTransitioning.value = false;
  }
};

// 开始自动播放
const startAutoplay = () => {
  if (autoplayTimer.value) return;
  
  autoplayTimer.value = setInterval(nextSlide, autoplayInterval);
};

// 停止自动播放
const stopAutoplay = () => {
  if (autoplayTimer.value) {
    clearInterval(autoplayTimer.value);
    autoplayTimer.value = null;
  }
};

// 处理鼠标滚轮事件
const handleWheel = (e) => {
  // 获取浏览器视口宽度
  const viewportWidth = window.innerWidth;
  // 获取鼠标相对于视口的水平位置
  const mouseX = e.clientX;
  
  // 定义中间区域范围：视口宽度的 20% ~ 80%
  const middleStart = viewportWidth * 0.2;
  const middleEnd = viewportWidth * 0.8;
  
  // 只有鼠标在中间区域时，才触发轮播切换
  if (mouseX >= middleStart && mouseX <= middleEnd) {
    // 阻止默认行为，避免页面整体滚动
    e.preventDefault();
    
    // deltaY > 0 表示向下滚动，deltaY < 0 表示向上滚动
    if (e.deltaY > 0) {
      // 向下滚动 - 自左向右切换（下一张）
      nextSlide();
    } else {
      // 向上滚动 - 自右向左切换（上一张）
      prevSlide();
    }
  }
  // 鼠标在两侧区域时，不做任何处理，保留默认的页面滚动行为
};

// 组件挂载时开始自动播放
onMounted(() => {
  startAutoplay();
});

// 组件卸载时清除计时器
onUnmounted(() => {
  stopAutoplay();
});
</script>

<style scoped>
.carousel-container {
  position: relative;
  width: 100%;
  height: 100vh;
  margin: 0 auto;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  /* 鼠标在中间区域时显示可滚动提示，两侧区域恢复默认 */
  cursor: grab;
}

.carousel-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.carousel-track {
  display: flex;
  height: 100%;
}

.carousel-item {
  min-width: 100%;
  height: 100%;
}

.carousel-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* 导航按钮 */
.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(147, 146, 146, 0.7);
  border: none;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
  font-size: 18px;
  color: #333;

  & > .iconfont{
        font-size: 25px;
        font-weight: 1000;
        color: rgb(58, 59, 59);
    }
}

.nav-btn:hover {
    background-color: rgb(255, 255, 255);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.prev-btn {
  left: 16px;
}

.next-btn {
  right: 16px;
}

/* 指示器 */
.indicators {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 10;
}

.indicator {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  border: none;
  user-select: none;
  background-color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.3s ease;
}

.indicator.active {
  background-color: white;
  width: 28px;
  border-radius: 5px;
}
</style>