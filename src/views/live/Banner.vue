<template>
  <div 
    id="live-banner" 
    class="fullscreen-carousel"
    @mouseenter="pauseAutoPlay"
    @mouseleave="resumeAutoPlay"
  >
    <!-- 轮播容器 -->
    <div 
      class="carousel-container"
      :style="{ 
        transform: `translateX(-${currentIndex * 100}%)`,
        transition: isTransitioning ? 'transform 0.5s ease-in-out' : 'none'
      }"
    >
      <div 
        v-for="(image, index) in carouselItems" 
        :key="index" 
        class="carousel-item"
      >
        <img 
          :src="image.url" 
          :alt="image.alt" 
          class="carousel-image"
        />
      </div>
    </div>

    <!-- 导航按钮 -->
    <button class="nav-btn prev-btn" @click="prevSlide">
      <i class="iconfont icon-zuojiantou" />
    </button>
    <button class="nav-btn next-btn" @click="nextSlide">
      <i class="iconfont icon-youjiantou" />
    </button>

    <!-- 指示器 -->
    <!-- <div class="indicators">
      <span 
        v-for="(image, index) in rawImages" 
        :key="index" 
        :class="{ active: currentIndex === index + 1 }"
        @click="goToSlide(index)"
      ></span>
    </div> -->
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

// 原始图片数据
const rawImages = [
  { url: '/img/bac1.jpg' }, // 图片放在public/img/目录
  { url: '/img/bac2.jpg' },
]

// 克隆首尾图片实现无缝循环
const carouselItems = ref([
  { ...rawImages[rawImages.length - 1] }, // 克隆最后一张
  ...rawImages,                           // 原始图片
  { ...rawImages[0] }                     // 克隆第一张
])

const currentIndex = ref(1) // 从真实第一张开始
const isTransitioning = ref(true)
let autoPlayTimer = null
const interval = 5000 // 3秒切换间隔

// 切换逻辑
const nextSlide = () => {
  isTransitioning.value = true
  currentIndex.value++
  
  if (currentIndex.value === carouselItems.value.length - 1) {
    setTimeout(() => {
      isTransitioning.value = false
      currentIndex.value = 1 // 跳回真实第一张
    }, 500)
  }
}

const prevSlide = () => {
  isTransitioning.value = true
  currentIndex.value--
  
  if (currentIndex.value === 0) {
    setTimeout(() => {
      isTransitioning.value = false
      currentIndex.value = carouselItems.value.length - 2
    }, 500)
  }
}

// 自动播放控制
const startAutoPlay = () => {
  autoPlayTimer = setInterval(nextSlide, interval)
}

const stopAutoPlay = () => clearInterval(autoPlayTimer)

// 生命周期钩子
onMounted(() => {
  startAutoPlay()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  stopAutoPlay()
  window.removeEventListener('resize', handleResize)
})

// 响应式优化
const handleResize = () => {
  // 可在此添加图片尺寸重置逻辑
}
</script>

<style scoped>
/* 全屏容器 */
.fullscreen-carousel {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: var(--app-media-letterbox);
}

/* 轮播容器 */
.carousel-container {
  display: flex;
  height: 100%;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.carousel-item {
  flex: 0 0 100%;
  min-width: 100%;
}

/* 图片自适应 */
.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 关键：保持比例填充 */
  object-position: center;
}

/* 导航按钮 */
.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 60px;
  height: 60px;
  background: var(--app-control-on-dark);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 10;
}

.nav-btn:hover {
  background: var(--app-control-on-dark-hover);
  transform: translateY(-50%) scale(1.1);
}

.prev-btn { left: 20px; }
.next-btn { right: 20px; }

/* 指示器 */
.indicators {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 12px;
  z-index: 10;
}

.indicators span {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--app-on-media) 40%, transparent);
  cursor: pointer;
  transition: all 0.3s ease;
}

.indicators span.active {
  background: var(--app-on-media);
  transform: scale(1.3);
}
</style>