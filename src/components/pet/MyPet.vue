<template>
  <!-- 3D透视容器 -->
  <div class="pet-view" ref="viewRef">
    <!-- 宠物3D主体 -->
    <div 
      class="pet-box" 
      ref="petBoxRef"
      @mousedown="startDrag"
      @click="clickInteract"
    >
      <!-- 宠物六个面，可替换自定义贴图 -->
      <div class="pet-face face-front"></div>
      <div class="pet-face face-back"></div>
      <div class="pet-face face-left"></div>
      <div class="pet-face face-right"></div>
      <div class="pet-face face-top"></div>
      <div class="pet-face face-bottom"></div>
    </div>

    <!-- 文字气泡交互 -->
    <div class="tip-bubble" :class="{show: bubbleShow}">{{bubbleText}}</div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const viewRef = ref(null)
const petBoxRef = ref(null)

// 位置拖拽
let isDrag = false
let offsetX = 0
let offsetY = 0
// 3D旋转角度
const rotateX = ref(0)
const rotateY = ref(0)
// 气泡提示
const bubbleShow = ref(false)
const bubbleText = ref('你好呀~')
// 待机定时器
let idleTimer = null
let moveTimer = null

// 鼠标按下拖拽
const startDrag = (e) => {
  isDrag = true
  const rect = viewRef.value.getBoundingClientRect()
  offsetX = e.clientX - rect.left
  offsetY = e.clientY - rect.top
}

// 鼠标移动监听
const handleMouseMove = (e) => {
  if (!viewRef.value) return
  const rect = viewRef.value.getBoundingClientRect()
  
  // 拖拽移位
  if(isDrag){
    viewRef.value.style.left = `${e.clientX - offsetX}px`
    viewRef.value.style.top = `${e.clientY - offsetY}px`
  }

  // 鼠标位置计算3D视角跟随
  const x = e.clientX - rect.left - rect.width / 2
  const y = e.clientY - rect.top - rect.height / 2
  rotateY.value = x * 0.15
  rotateX.value = -y * 0.15
}

// 松开停止拖拽
const stopDrag = () => {
  isDrag = false
}

// 点击互动触发动作+气泡
const clickInteract = () => {
  const textArr = ['陪你逛博客~','今天心情不错','点点我干嘛😜','欢迎来访']
  bubbleText.value = textArr[Math.floor(Math.random() * textArr.length)]
  bubbleShow.value = true

  // 3D翻转动画
  rotateY.value += 90
  setTimeout(() => bubbleShow.value = false, 1200)
}

// 随机待机3D小动作
const randomIdleAction = () => {
  idleTimer = setInterval(() => {
    if(!isDrag){
      rotateX.value += Math.random() * 6 - 3
      rotateY.value += Math.random() * 8 - 4
    }
  }, 4000)
}

onMounted(() => {
  // 初始右下角定位
  viewRef.value.style.right = '40px'
  viewRef.value.style.bottom = '40px'
  // 绑定全局事件
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseup', stopDrag)
  randomIdleAction()
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseup', stopDrag)
  clearInterval(idleTimer)
  clearTimeout(moveTimer)
})
</script>

<style scoped>
/* 3D透视根容器，开启立体视角 */
.pet-view {
  position: fixed;
  right: 40px;
  bottom: 40px;
  width: 90px;
  height: 90px;
  perspective: 350px;
  z-index: 9999;
  cursor: grab;
  user-select: none;
}
.pet-view:active {
  cursor: grabbing;
}

/* 3D立方体容器，保留子元素3D空间 */
.pet-box {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.25s ease-out;
}

/* 立方体六个面通用样式 */
.pet-face {
  position: absolute;
  width: 90px;
  height: 90px;
  border-radius: 8px;
  backface-visibility: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
}

/* 六个面3D定位与配色，可替换图片background:url() */
.face-front  { background: #7dd3fc; transform: translateZ(45px); }
.face-back   { background: #38bdf8; transform: translateZ(-45px) rotateY(180deg); }
.face-left   { background: #0ea5e9; transform: translateX(-45px) rotateY(-90deg); }
.face-right  { background: #0284c7; transform: translateX(45px) rotateY(90deg); }
.face-top    { background: #3b82f6; transform: translateY(-45px) rotateX(90deg); }
.face-bottom { background: #1d4ed8; transform: translateY(45px) rotateX(-90deg); }

/* 交互气泡 */
.tip-bubble {
  position: absolute;
  top: -45px;
  left: 50%;
  transform: translateX(-50%) scale(0);
  padding: 6px 12px;
  background: rgba(0,0,0,0.65);
  color: #fff;
  border-radius: 16px;
  font-size: 12px;
  white-space: nowrap;
  transition: transform 0.2s ease;
  pointer-events: none;
}
.tip-bubble.show {
  transform: translateX(-50%) scale(1);
}
</style>