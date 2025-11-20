<template>
  <div id="nav-container" :class="{ hidden: !isHeaderVisible }">
    <div class="nav-left">
      <img src="/logo.svg">
    </div>
        
    <div class="nav-right">
      <div class="nav-item">
        <!-- 新增导航栏选项 -->
        <div class="nav-links">
          <a 
            v-for="(item, index) in navItems" 
            :key="index"
            :class="{ active: activeIndex === index }"
            @click="setActive(item.path,index)"
          >
            <i class='iconfont' :class="item.icon"/>&nbsp;{{ item.label }}
          </a>
        </div>
      </div>

      <div class="dropdown-wrapper" @mouseover="showDropdown" @mouseleave="hideDropdown">
        <i class="iconfont icon-gengduo dropdown-trigger"></i>
        <transition name="fade">
          <ul v-show="isDropdownVisible" class="dropdown-menu">
            <li @click="handleMenuClick('个人信息')">个人信息</li>
            <li @click="navTo">后台管理</li>
            <li @click="handleMenuClick('主题')">设置</li>
            <li @click="handleMenuClick('退出')">退出</li>
          </ul>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter,useRoute } from 'vue-router';
const router = useRouter()
const route = useRoute()

// 导航栏常用选项
const navItems = ref([
  {
    label:'首页',
    path:'/',
    icon:'icon-ai-home'
  },
  {
    label:'碎碎念',
    path:'/chatty',
    icon:'icon-shuohuaren'
  },
  {
    label:'技术社区',
    path:'/technolyge',
    icon:'icon-jishufuwu'
  },
  {
    label:'作者生活',
    path:'/live',
    icon:'icon-icon'
  },
  {
    label:'留言板',
    path:'/comments',
    icon:'icon-xiaoxi'
  }
]);

const activeIndex = ref(0); // 默认选中第一项

// 导航栏点击事件
const setActive = (path,index) => {
  router.push(path)
  activeIndex.value=index
};

const isHeaderVisible = ref(true) // 控制导航栏的显示/隐藏
let lastScrollTop = 0 // 上一次滚动的位置
const isDropdownVisible = ref(false) // 控制下拉菜单的显示

const handleScroll = () => {
  const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop
  
  // 在页面顶部时始终显示导航栏
  if (currentScrollTop === 0) {
    isHeaderVisible.value = true
  } 
  // 向下滚动超过50px时隐藏导航栏
  else if (currentScrollTop > lastScrollTop && currentScrollTop > 50) {
    isHeaderVisible.value = false
    isDropdownVisible.value = false // 滚动时隐藏下拉菜单
  } 
  // 向上滚动时显示导航栏
  else if (currentScrollTop < lastScrollTop) {
    isHeaderVisible.value = true
  }
  
  lastScrollTop = currentScrollTop
}

const showDropdown = () => {
  isDropdownVisible.value = true
}

const hideDropdown = () => {
  isDropdownVisible.value = false
}

const handleMenuClick = (item) => {
  console.log(`选择了: ${item}`)
  isDropdownVisible.value = false
  // 这里可以添加菜单项点击后的具体逻辑
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

const navTo = ()=>{
  router.push('/admin')
}
</script>

<style scoped>
#nav-container {
  width: 100%;
  height: 100px;
  padding-left: 50px;
  min-width: 1000px;
  display: flex;
  flex-direction: row;
  box-shadow: 0 2px 4px 0 rgba(0,0,0,.2);
  /* background-color: white; */
  backdrop-filter: blur(10px); 
  position: fixed;
  top: 0;
  z-index: 1000;
  transition: transform 0.3s ease; /* 使用transform实现平滑过渡 */
  user-select: none;
  transform: translateY(0); /* 初始位置 */
}

#nav-container.hidden {
  transform: translateY(-100%); /* 完全隐藏导航栏 */
}

.nav-left {
  width: 50%; 
  display: flex;
  align-items: center;
  padding-left: 60px;
}

.nav-left img {
  user-select: none;
  height: 100%;
}

.nav-right {
  padding-right: 30px;
  width: 50%;
  display: flex;
  align-items: center;
  justify-content: flex-end;

  .nav-item{
    width: 70%;
    height: 100%;
    white-space: nowrap; /* 防止文字换行 */

    /*导航栏样式 */
    .nav-links {
      display: flex;
      height: 100%;
      align-items: center;
      justify-content: flex-end; /* 靠右对齐 */
      gap: 30px; /* 项间距 */
      padding-right: 20px; /* 右侧留空 */
    }

    .nav-links a {
      position: relative;
      color: #333;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      padding: 5px 0;
      transition: all 0.3s ease;
    }

    /* 下划线高亮效果 */
    .nav-links a::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 0;
      height: 2px;
      background-color: #22df6a; /* 与下拉菜单悬停色一致 */
      transition: width 0.3s ease;
    }

    .nav-links a.active {
      color: #17aa03; /* 激活状态文字颜色 */
      font-weight: 600;
    }

    .nav-links a.active::after {
      width: 100%; /* 激活状态下划线全宽 */
    }

    .nav-links a:hover::after {
      width: 100%; /* 悬停时也显示完整下划线 */
    }

  }
}

/* 下拉菜单样式 */
.dropdown-wrapper {
  position: relative;
  display: inline-block;
  cursor: pointer;
}

.dropdown-trigger {
  font-size: 24px;
  padding: 8px;
  transition: all 0.3s ease;
}

.dropdown-trigger:hover {
  color: #17aa03;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  min-width: 160px;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 5px 15px 0 rgba(0, 0, 0, 0.1);
  list-style: none;
  padding: 10px 0;
  margin: 5px 0 0 0;
  z-index: 2000;
}

.dropdown-menu li {
  padding: 10px 20px;
  font-size: 14px;
  color: #606266;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.dropdown-menu li:hover {
  background-color: #ecf5ff;
  color: #22df6a;
}

/* 过渡动画 */
.fade-enter-active, .fade-leave-active {
  transition: all 0.3s ease;
  transform-origin: top center;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>