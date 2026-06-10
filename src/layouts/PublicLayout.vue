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
            <router-view v-slot="{ Component, route }">
                <transition name="fade" mode="out-in">
                    <KeepAlive :include="cachedPageNames">
                        <component
                            :is="Component"
                            :key="route.meta.keepAlive ? route.meta.cacheName : route.fullPath"
                        />
                    </KeepAlive>
                </transition>
            </router-view>
        </main>

        <FloatingTools />
    </div>
</template>

<script setup>
import Nav from '@/components/nav/TopNav.vue'
import FloatingTools from '@/components/layout/FloatingTools.vue'

const cachedPageNames = [
    'HomePage',
    'SpacePage',
    'ArticlesPage',
    'CommentsPage',
    'PhotosPage',
    'AboutPage',
]
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
        margin-top: var(--blog-header-height, 118px);
        position: relative;
        min-height: calc(100vh - var(--blog-header-height, 118px));
    }

    .fade-enter-active,
    .fade-leave-active {
        transition:
            opacity 0.16s ease,
            transform 0.16s ease;
    }

    .fade-enter-from,
    .fade-leave-to {
        opacity: 0;
        transform: translateY(4px);
    }

    @media (prefers-reduced-motion: reduce) {
        .fade-enter-active,
        .fade-leave-active {
            transition: none;
        }

        .fade-enter-from,
        .fade-leave-to {
            opacity: 1;
            transform: none;
        }
    }
</style>
