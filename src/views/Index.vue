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

        <ToolsBtn></ToolsBtn>
    </div>
</template>

<script setup>
import Nav from '@/components/nav/TopNav.vue';
import ToolsBtn from '@/components/global/ToolsBtn.vue';
</script>

<style lang="scss" scoped>
    .bac{
        width: 100%;
        height: 100%;
        position: fixed;
        top: 0;
        left: 0;
        /* opacity: 0.3; */
        /* background: url('@/assets/img/neymar.jpg') no-repeat; */
        /* background: url('/img/bac2.jpg') no-repeat;
        background-size:cover;
        background-position: center;
        background-repeat: no-repeat; */
        background-color: var(--app-bg-primary);
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