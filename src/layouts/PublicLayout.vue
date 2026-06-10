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
                <transition name="fade" mode="out-in" @after-enter="onTransitionAfterEnter">
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
import { nextTick, watch, ref } from 'vue'
import { useRoute } from 'vue-router'
import Nav from '@/components/nav/TopNav.vue'
import FloatingTools from '@/components/layout/FloatingTools.vue'

const route = useRoute()

const cachedPageNames = [
    'HomePage',
    'SpacePage',
    'ArticlesPage',
    'CommentsPage',
    'PhotosPage',
    'AboutPage',
]

// 详情页返回列表页的映射
const deferredListScrollTargets = {
    MomentDetail: { listName: 'Space', storageKey: 'personblog_space_scroll_target' },
    ArticleDetail: { listName: 'Articles', storageKey: 'personblog_article_scroll_target' },
}

// 记录上一个路由名称，用于判断是否为详情页返回
let lastRouteName = ''

// 是否为"详情页返回列表页"场景
const isReturningFromDetail = ref(false)

// 检查是否为详情页返回列表页的场景
function checkReturnFromDetail(to, fromName) {
    const target = deferredListScrollTargets[fromName]
    if (!target || to.name !== target.listName) return false
    return typeof window !== 'undefined' && !!window.sessionStorage.getItem(target.storageKey)
}

// 重置滚动到顶部
function resetScrollToTop() {
    if (typeof window === 'undefined') return
    try {
        // 同时重置多个滚动容器，确保跨浏览器兼容
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
        if (document.scrollingElement) document.scrollingElement.scrollTop = 0
        if (document.documentElement) document.documentElement.scrollTop = 0
        if (document.body) document.body.scrollTop = 0
    } catch (e) {
        // 忽略滚动重置异常
    }
}

// 监听路由变化
watch(
    () => [route.name, route.fullPath],
    ([newName], oldValue) => {
        const oldName = oldValue ? oldValue[0] : null
        if (oldName && checkReturnFromDetail(route, oldName)) {
            isReturningFromDetail.value = true
        } else {
            isReturningFromDetail.value = false
        }
        lastRouteName = newName
    }
)

// 过渡动画结束后的处理
async function onTransitionAfterEnter() {
    await nextTick()
    // 给 DOM 一个稳定的时机
    await new Promise(resolve => {
        requestAnimationFrame(() => requestAnimationFrame(resolve))
    })

    // 如果不是"详情页返回列表页"的场景，就重置滚动到顶部
    if (!isReturningFromDetail.value) {
        resetScrollToTop()
    }
    // 标记重置完成
    isReturningFromDetail.value = false
}
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
