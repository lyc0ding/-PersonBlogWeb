<template>
  <div id="live-container" @wheel="handleWheel" :class="{'no-scroll': isAnimating}">
    <ToIndex/>
    
    <!-- 走马灯banner区域 -->
    <div class="banner-carousel">
      <Carousel></Carousel>
    </div>
    
    <!-- 内容区域 - 将覆盖在banner上方滚动 -->
    <div class="live-container-content">
      <div class="aboutme-container">
        <div class="aboutme-tile">
          <h1>关于我</h1>
          <h2>About Me</h2>
        </div>

        <el-divider border-style="dashed" class="theme-divider"/>

        <div class="aboutme-content">
          <!-- 这里可以添加关于我的具体内容 -->
          <p>这里是关于我的详细介绍内容...</p>
          <p>更多关于我的信息...</p>
        </div>
      </div>
      
      <!-- 可以添加更多内容区块，它们都会滚动覆盖banner -->
      <div class="other-section">
        <h2>其他内容区域</h2>
        <p>这是另一个内容区块，会随着滚动继续覆盖banner</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import ToIndex from '@/components/global/ToIndex.vue';
import Carousel from './Carousel.vue';
import { ref, onMounted, onBeforeUnmount } from 'vue';



</script>

<style scoped>
#live-container {
  position: relative;
  width: 100%;
  overflow-x: hidden;
}

/* 走马灯banner样式 */
.banner-carousel {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1;
  width: 100%;
  height: 100vh;
}

/* 内容区域样式 - 会滚动覆盖在banner上方 */
.live-container-content{
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--app-text-primary);
  z-index: 10;
  position: relative;
  margin-top: 100vh;
  background-color: var(--app-bg-primary);
  min-height: 100vh;
}

.aboutme-container{
  width: 90%; 
  display: flex;
  flex-direction: column;
  align-items: center;
}

.aboutme-tile{
  width: 100%;
  padding: 10px 0px;
  text-align: center;
  
  h1, h2 {
    letter-spacing: 10px;
    margin: 10px 0;
  }
}

.aboutme-content {
  margin-top: 30px;
  font-size: 18px;
  line-height: 1.8;
  max-width: 800px;
  text-align: center;
}

/* 其他内容区块样式 */
.other-section {
  width: 90%;
  max-width: 800px;
  margin-top: 100px;
  padding: 50px;
  text-align: center;
  background-color: var(--app-surface-muted);
  border-radius: 8px;
}

.theme-divider :deep(.el-divider__text) {
  color: var(--app-text-secondary);
}

.theme-divider.el-divider--horizontal {
  border-top-color: var(--app-border);
}

/* 禁止滚动的类 */
.no-scroll {
  overflow: hidden;
}
</style>