<template>
  <div class="time-line">
    <el-timeline>
      <el-timeline-item 
        v-for="(item, index) in lineList" 
        :key="index" 
        :timestamp="item.timestamp" 
        placement="top"
        :ref="el => itemRefs[index] = el"
      >
        <el-card 
          :class="{
            'card-animation': true,
            'card-enter': cardStates[index].visible,
            'card-exit': !cardStates[index].visible
          }"
        >
          <h4>{{ item.title }}</h4>
          <p>{{ item.content }}</p>
        </el-card>
      </el-timeline-item>
    </el-timeline>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const lineList = ref([
  {
    timestamp: '2018/4/3',
    title: 'Update Github template',
    content: 'Tom committed 2018/4/12 20:46'
  }, {
    timestamp: '2019/6/15',
    title: 'Refactor component',
    content: 'Lisa optimized performance'
  }, {
    timestamp: '2020/2/28',
    title: 'Fix security issues',
    content: 'David patched vulnerabilities'
  }
])

// 存储每个卡片的DOM引用
const itemRefs = ref([])

// 卡片状态管理
const cardStates = ref(lineList.value.map(() => ({
  visible: false,
  hasBeenVisible: false
})))

// 滚动方向跟踪
const lastScrollTop = ref(0)
const scrollDirection = ref('down')

// 节流函数优化性能
const throttle = (func, limit) => {
  let lastFunc, lastRan
  return function() {
    const context = this
    const args = arguments
    if (!lastRan) {
      func.apply(context, args)
      lastRan = Date.now()
    } else {
      clearTimeout(lastFunc)
      lastFunc = setTimeout(() => {
        if ((Date.now() - lastRan) >= limit) {
          func.apply(context, args)
          lastRan = Date.now()
        }
      }, limit - (Date.now() - lastRan))
    }
  }
}

// 检查元素是否在视口中
const isInViewport = (el) => {
  if (!el) return false
  const rect = el.getBoundingClientRect()
  return (
    rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.bottom >= 0
  )
}

// 处理滚动事件
const handleScroll = () => {
  const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop
  scrollDirection.value = currentScrollTop > lastScrollTop.value ? 'down' : 'up'
  lastScrollTop.value = currentScrollTop

  itemRefs.value.forEach((el, index) => {
    if (!el) return
    
    const isVisible = isInViewport(el.$el || el)
    
    // 向下滚动：卡片逐个进入
    if (scrollDirection.value === 'down') {
      if (isVisible) {
        // 只有当前面的卡片已显示时才显示当前卡片
        if (index === 0 || cardStates.value[index - 1].hasBeenVisible) {
          cardStates.value[index].visible = true
          cardStates.value[index].hasBeenVisible = true
        }
      }
    } 
    // 向上滚动：卡片逐个退出
    else {
      if (!isVisible && cardStates.value[index].hasBeenVisible) {
        cardStates.value[index].visible = false
      }
    }
  })
}

// 初始化观察器
onMounted(() => {
  window.addEventListener('scroll', throttle(handleScroll, 100))
  // 初始检查可见卡片
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', throttle(handleScroll, 100))
})
</script>

<style scoped>
.time-line {
  width: 70%;
}


.el-card {
  height: 300px;
}

:deep(.el-timeline-item__timestamp) {
  color: var(--app-text-primary) !important;
  font-size: 18px !important;
  font-weight: bold !important;
  text-shadow: 0 0 3px var(--app-shadow-soft);
  margin-bottom: 10px !important;   /* 增加下边距 */
}

/* 修改顶部时间戳的特定样式 */
:deep(.el-timeline-item__timestamp.is-top) {
  font-size: 20px !important;       /* 顶部时间戳更大 */
  padding-top: 5px;                 /* 顶部留白 */
}

/* 卡片基础动画设置 */
.card-animation {
  transition: transform 0.6s linear, opacity 0.6s linear;
  transform: translateX(100%);
  opacity: 0;
}

/* 进入动画：从右向左滑入 */
.card-enter {
  transform: translateX(0);
  opacity: 1;
}

/* 退出动画：从左向右滑出 */
.card-exit {
  transform: translateX(-100%);
  opacity: 0;
}
</style>