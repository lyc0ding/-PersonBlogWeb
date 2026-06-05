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
            <router-view v-slot="{ Component, route }"> <!-- 主内容动态切换 -->
                <KeepAlive>
                    <component
                        :is="route.meta.keepAlive ? Component : KeepAlivePlaceholder"
                        :key="route.meta.keepAlive ? route.name : 'keep-alive-placeholder'"
                    />
                </KeepAlive>
                <transition name="fade" mode="out-in">
                    <component
                        :is="Component"
                        v-if="!route.meta.keepAlive"
                        :key="route.fullPath"
                    />
                </transition>
            </router-view>
        </main>

        <FloatingTools />
    </div>
</template>

<script setup>
import { defineComponent, h } from 'vue'
import Nav from '@/components/nav/TopNav.vue'
import FloatingTools from '@/components/layout/FloatingTools.vue'

const KeepAlivePlaceholder = defineComponent({
    name: 'KeepAlivePlaceholder',
    render: () => h('span', { style: 'display: none;' }),
})
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
</style>
