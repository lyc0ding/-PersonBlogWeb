<template>
  <div class="container" style="width: 250px;height: 470px;" ref="boxRef">
    <div class="box" :class="{'box-fixed': distanceToViewportTop < 100 }">
      <div class="personal-info">
        <div class="background"> 
          <div class="blur-mask"></div>
        </div>
        <!-- 修改头像容器固定尺寸 -->
        <div class="avatar" @click="ToLive()"> 
          <img src="/src/assets/img/avatar.png">
        </div>
        <!-- <div class="nickname">sudo</div> -->
        <div class="marker" style="width: 90%;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;margin-top: 20px;">
          “做都做了，做完再说”
        </div>
        <div class="overview">
          <div class="vertical-list">
            <span>生活<br>23 </span>
            <span>分享<br>23</span>
            <span>访问量<br>2389</span>
          </div>
        </div>
      </div>
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

const ToLive =() => {
  router.push('/live')
}

const boxRef = ref(null)
const distanceToViewportTop = ref(0)

onMounted(() => {
  calculateDistance()
  window.addEventListener('scroll', calculateDistance)
  window.addEventListener('resize', calculateDistance)
})

onUnmounted(() => {
  window.removeEventListener('scroll', calculateDistance)
  window.removeEventListener('resize', calculateDistance)
})

const calculateDistance = () => {
  if (boxRef.value) {
    const rect = boxRef.value.getBoundingClientRect()
    distanceToViewportTop.value = rect.top
  }
}
</script>

<style scoped>
.box {
  width: 250px;
  height: 470px;
  /* background: linear-gradient(135deg, #a6ffea 0%, #f9ffb7 100%);  */
  background-color: white;
  transition: all 0.3s ease-out;
  position: relative;
  /* border-radius: 15px; */
}

.personal-info {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: black;
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
  background-color: white;
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
  color: rgb(30, 30, 30);
  cursor: none;
}

.marker{
  font-size: 15px;
  font-family: Arial, Helvetica, sans-serif;
  color: gray;
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
  align-items: center;    /* 容器水平居中 */
  width: 40%;             /* 适当宽度 */
  margin: 0 auto;         /* 水平居中关键 */
  padding: 10px 0 0 0;        /* 增加垂直间距 */
  gap: 5px;              /* 子项间距 */
  color: black;
}

.other-link > div {
  width: 100%;           /* 子项占满宽度 */
  text-align: left;      /* 文本强制左对齐 */
  font-size: 20px;       /* 统一字体大小 */
  padding-left: 10px;    /* 左侧留白 */
}

.other-link > div:hover {
  color: aqua;     /* 悬停效果 */
  cursor: pointer;
}

.box-fixed {
  position: fixed;
  top: 100px;
  transition: all 0.3s ease-out;
}

</style>