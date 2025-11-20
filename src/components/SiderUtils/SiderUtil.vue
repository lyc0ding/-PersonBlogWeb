<template>
  <div class="container">
    <div class="sider">
      <div v-for="item in utilList" :key="item.id" 
           :class="{'hidden': item.id === 1 && !showToTop}">
        <i class="iconfont" :class="item.icon" @click="handleUtilClick(item.id)"></i>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';

const showToTop = ref(false);
const isNightMode = ref(false); // 新增：控制白天/黑夜模式的状态

// 使用计算属性动态生成工具列表
const utilList = computed(() => [
  {
    id: 1,
    icon: 'icon-huidaodingbu',
    label: '回到顶部'
  },
  {
    id: 2,
    icon: 'icon-search',
    label: '搜索'
  },
  {
    id: 3,
    // 根据isNightMode状态动态切换图标
    icon: isNightMode.value ? 'icon-wanshang' : 'icon-qingbaitian',
    label: isNightMode.value ? '夜晚' : '白天'
  },
  {
    id: 5,
    icon: 'icon-xietanxintanhua',
    label: '其他'
  }
]);

// 添加节流优化
const throttle = (fn, delay) => {
  let lastCall = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastCall < delay) return;
    lastCall = now;
    fn(...args);
  };
};

const handleScroll = throttle(() => {
  const scrollTop = window.pageYOffset 
    || document.documentElement.scrollTop 
    || document.body.scrollTop;
  
  showToTop.value = scrollTop > 500;
}, 100);

// 回到顶部实现
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

// 工具按钮点击处理
const handleUtilClick = (id) => {
  if (id === 1) {
    scrollToTop();
  } else if (id === 3) {
    // 切换白天/黑夜模式
    isNightMode.value = !isNightMode.value;
    // 这里可以添加主题切换的逻辑
    document.documentElement.setAttribute(
      'data-theme', 
      isNightMode.value ? 'dark' : 'light'
    );
  }
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  handleScroll();
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
.container {
  width: 100%;
  height: 100%;
  position: relative;
  
  .sider {
    width: 45px;
    height: 200px;
    position: fixed;
    bottom: 50px;
    right: 30px;
    display: flex;
    flex-direction: column;
    
    & > div {
      margin-bottom: 10px;
      flex: 1;
      border: white 1px solid;
      display: flex;
      border-radius: 50%;
      cursor: pointer; /* 添加指针样式 */
      transition: all 0.3s ease; /* 添加过渡效果 */
      
      &:hover {
        transform: scale(1.1); /* 悬停时放大效果 */
        background-color: rgba(255, 255, 255, 0.1); /* 悬停背景效果 */
      }
      
      .iconfont {
        flex: 1;
        font-size: 28px;
        text-align: center;
        border-radius: 50%;
        color: aqua;
        transition: color 0.3s ease; /* 图标颜色过渡 */
      }
    }
    
    .hidden {
      visibility: hidden;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
  }
}
</style>