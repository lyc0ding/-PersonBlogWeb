<template>
  <div class="container" ref="boxRef">
    <div class="box">
      <h3 class="widget-title">公告</h3>
      <div class="personal-info">
        <div class="background">
          <div class="blur-mask"></div>
        </div>
        <div class="avatar" @click="toAbout()">
          <img src="/src/assets/img/avatar.png" alt="头像">
        </div>
        <div class="marker">
          把握住当下，才能开辟未来
        </div>
        <div class="overview">
          <div class="vertical-list">
            <span>文章数<br>23 </span>
            <span>评论数<br>23</span>
            <span>访问量<br>2389</span>
          </div>
        </div>
      </div>
      <h3 class="widget-title link-widget-title">链接</h3>
      <div class="other-link">
        <div class="github">
          <i class="iconfont icon-github">&nbsp;&nbsp;GitHub</i>
        </div>
        <div class="link">
          <i class="iconfont icon-lianjie">&nbsp;&nbsp;Links</i>
        </div>
        <div class="video">
          <i class="iconfont icon-music">&nbsp;&nbsp;Music</i>
        </div>
        <div class="music">
          <i class="iconfont icon-shipin">&nbsp;&nbsp;Video</i>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const toAbout = () => {
  router.push('/about')
}

const boxRef = ref(null)
const distanceToViewportTop = ref(0)
const scrollY = ref(0) // 记录页面滚动距离

onMounted(() => {
  calculateDistance()
  // 记录初始滚动位置
  scrollY.value = window.scrollY
  window.addEventListener('scroll', handleScroll)
  window.addEventListener('resize', calculateDistance)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('resize', calculateDistance)
})

// 合并滚动处理逻辑
const handleScroll = () => {
  calculateDistance()
  scrollY.value = window.scrollY // 更新滚动距离
}

const calculateDistance = () => {
  if (boxRef.value) {
    const rect = boxRef.value.getBoundingClientRect()
    distanceToViewportTop.value = rect.top
  }
}
</script>

<style scoped>
.container {
  width: 100%;
}

.widget-title {
  margin: 0 0 10px;
  font-size: 15px;
  font-weight: 600;
  color: var(--app-text-primary);
  padding-bottom: 8px;
  border-bottom: 1px solid var(--blog-divider);
}

.link-widget-title {
  margin-top: 18px;
}

.box {
  width: 100%;
  background-color: var(--app-surface);
  border: 1px solid var(--blog-card-border);
  padding: 14px 12px 16px;
  transition: border-color 0.2s ease;
}

.personal-info {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--app-text-primary);
  padding: 100px 0 0 0;
  gap: 5px;
  box-sizing: border-box;
  /* border-bottom: gray 1px solid; */
}

.background{
  background:url('/src/assets/img/avatar.png') no-repeat;
  width: 100%;
  height: 220px;
  position: absolute;
  top: 0;
  background-size: cover;
}

.blur-mask {
  position: absolute;
  bottom: 0; 
  width: 100%;
  height: 150px;
  background-color: var(--app-surface);
  /* 关键：透明渐变遮罩（从完全透明到不透明） */
  -webkit-mask-image: linear-gradient(to bottom, transparent, black);
  mask-image: linear-gradient(to bottom, transparent, black);
  /* 关键：对遮罩层应用模糊滤镜 */
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.avatar {
  display: flex;
  justify-content: center; /* 确保头像居中 */
  align-items: center;
  user-select: none;

}

.avatar img {
  object-fit: cover;
  border-radius: 50%;
  overflow: hidden;
  width: 110px;
  height: 110px;
  transition: all 0.3s ease; /* 添加过渡动画 */
  user-select: none;
  z-index: 9;
}

.avatar img:hover {
  transform: scale(1.2); /* 使用scale变形保持布局稳定 */
  transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94); /* 平滑过渡曲线 */
}

.nickname{
  font-size: 35px;
  font-family: fantasy;
  color: var(--app-text-primary);
  cursor: none;
}

.marker {
  width: 100%;
  margin-top: 16px;
  padding: 0 8px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--app-text-muted);
  text-align: center;
}

.nickname, .marker {
  transition: none !important; /* 禁止位置变化 */
  width: 100%;
  text-align: center; /* 保持居中 */
}

.overview{
  width: 100%;

  .vertical-list {
    display: flex;
    justify-content: space-between; /* li 均匀分布，两端对齐 */
    padding: 0 20px; /* 左右内间距相等（按需调整数值） */
    list-style: none;
    margin: 0;
    box-sizing: border-box; /* 确保 padding 不增加总宽度 */
    width: 100%; /* 占满整行 */
  }

  .vertical-list > span {
    font-family: Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
    font-weight: 600;
    flex: 1; /* 每个 li 等分剩余空间 */
    text-align: center;
    margin: 0 5px; /* li 之间的间隔（按需调整） */
  }
}

.other-link {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
  margin: 0;
  padding: 10px 0 0 0;
  gap: 5px;
  color: var(--app-text-primary);
}

.other-link > div {
  width: 100%;           /* 子项占满宽度 */
  text-align: left;      /* 文本强制左对齐 */
  font-size: 20px;       /* 统一字体大小 */
  padding-left: 10px;    /* 左侧留白 */
}

.other-link > div:hover {
  color: var(--app-link-hover);
  cursor: pointer;
}

/* 移除固定的box-fixed类样式 */
</style>
