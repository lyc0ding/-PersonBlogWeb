<template>
  <div id="app-container">
    <!-- 全局背景 -->
    <div class="bac"></div>

    <!-- 导航栏组件 -->
    <header>
      <Nav/>
    </header>

    <!-- 主内容区 -->
    <main>
      <router-view v-slot="{ Component }"> <!-- 主内容动态切换 -->
        <transition name="fade" mode="out-in"> <!-- 可选：添加过渡动画 -->
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <SiderUtilVue></SiderUtilVue>
  </div>
</template>

<script setup>
import Nav from '@/components/TopNav/Index.vue';
import SiderUtilVue from '@/components/SiderUtils/SiderUtil.vue';
</script>

<style scoped>
#app-container {
  width: 100%;
  height: 100%;
}

.bac{
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  /* opacity: 0.3; */
  /* background: url('@/assets/img/neymar.jpg') no-repeat; */
  background: url('/img/bac2.jpg') no-repeat;
  background-size:cover;     /* 等比例缩放填满容器 */
  background-position: center; /* 图片居中 */
  background-repeat: no-repeat; /* 不重复 */
}

header{
width: 100%;
position:fixed;
top: 0;
z-index: 999;
}

main{
  margin-top: 100px;
  position: relative;
}
</style>