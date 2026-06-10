import { createRouter, createWebHistory } from 'vue-router'
import { useTagStore } from '@/stores/tagStore'
import { done, start } from '@/utils/nprogress'

const keepQueryRedirect = (path) => (to) => ({
    path,
    query: to.query,
    hash: to.hash,
})

const deferredScrollTargets = {
    MomentDetail: {
        listName: 'Space',
        storageKey: 'personblog_space_scroll_target',
    },
    ArticleDetail: {
        listName: 'Articles',
        storageKey: 'personblog_article_scroll_target',
    },
}

const cachedPageScrollKeyPrefix = 'personblog_cached_page_scroll:'

const getScrollContainers = () => [
    document.scrollingElement,
    document.documentElement,
    document.body,
].filter((item, index, list) => item && list.indexOf(item) === index)

const getCurrentScrollTop = () => {
    if (typeof window === 'undefined') return 0

    return Math.max(
        window.scrollY || window.pageYOffset || 0,
        ...getScrollContainers().map((container) => container.scrollTop || 0)
    )
}

const getCachedPageScrollKey = (route) => {
    const cacheName = route.meta?.cacheName || route.name
    if (!cacheName) return ''
    return `${cachedPageScrollKeyPrefix}${String(cacheName)}:${route.fullPath}`
}

const readCachedPageScroll = (route) => {
    if (!route.meta?.keepAlive || typeof window === 'undefined') return null

    const storageKey = getCachedPageScrollKey(route)
    if (!storageKey) return null

    const value = Number(window.sessionStorage.getItem(storageKey))
    return Number.isFinite(value) ? Math.max(0, value) : null
}

const saveCachedPageScroll = (route) => {
    if (!route.meta?.keepAlive || typeof window === 'undefined') return

    const storageKey = getCachedPageScrollKey(route)
    if (!storageKey) return

    window.sessionStorage.setItem(storageKey, String(getCurrentScrollTop()))
}

const shouldDeferListScroll = (to, from) => {
    const target = deferredScrollTargets[from.name]
    if (!target || to.name !== target.listName || typeof window === 'undefined') {
        return false
    }

    return Boolean(window.sessionStorage.getItem(target.storageKey))
}

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    scrollBehavior(to, from, savedPosition) {
        if (shouldDeferListScroll(to, from)) {
            return false
        }

        if (savedPosition) {
            return savedPosition
        }

        if (to.hash) {
            return {
                el: to.hash,
                behavior: 'smooth',
            }
        }

        const cachedPageScrollTop = readCachedPageScroll(to)
        if (cachedPageScrollTop != null) {
            return new Promise((resolve) => {
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        resolve({ top: cachedPageScrollTop })
                    })
                })
            })
        }

        return { top: 0 }
    },
    routes: [
        {
            path: '/technolyge',
            redirect: keepQueryRedirect('/articles')
        },
        {
            path: '/links',
            redirect: '/photos'
        },
        {
            path: '/admin/tec/article',
            redirect: keepQueryRedirect('/admin/articles')
        },
        {
            path: '/admin/tec/article/add',
            redirect: keepQueryRedirect('/admin/articles/new')
        },
        {
            path: '/admin/tec/article/edit/:id',
            redirect: (to) => ({
                path: `/admin/articles/${to.params.id}/edit`,
                query: to.query,
                hash: to.hash,
            })
        },
        {
            path: '/admin/tec/article/tag',
            redirect: keepQueryRedirect('/admin/articles/tags')
        },
        {
            path: '/',
            component: () => import('@/layouts/PublicLayout.vue'),
            children: [
                {
                    path: '',
                    name: 'Home',
                    component: () => import('@/views/home/Index.vue'),
                    meta: {
                        title: '首页',
                        keepAlive: true,
                        cacheName: 'HomePage',
                    }
                },
                {
                    path: 'space',
                    name: 'Space',
                    component: () => import('@/views/space/Index.vue'),
                    meta: {
                        title: '朋友圈',
                        keepAlive: true,
                        cacheName: 'SpacePage',
                    }
                },
                {
                    path: 'space/:id',
                    name: 'MomentDetail',
                    component: () => import('@/views/space/Detail.vue'),
                    meta: {
                        title: '朋友圈详情'
                    }
                },
                {
                    path: 'articles',
                    name: 'Articles',
                    component: () => import('@/views/articles/Index.vue'),
                    meta: {
                        title: '文章',
                        keepAlive: true,
                        cacheName: 'ArticlesPage',
                    }
                },
                {
                    path: 'articles/:id',
                    name: 'ArticleDetail',
                    component: () => import('@/views/articles/Detail.vue'),
                    meta: {
                        title: '文章详情'
                    }
                },
                {
                    path: 'comments',
                    name: 'Comments',
                    component: () => import('@/views/comments/Index.vue'),
                    meta: {
                        title: '留言板',
                        keepAlive: true,
                        cacheName: 'CommentsPage',
                    }
                },
                {
                    path: 'photos',
                    name: 'Photos',
                    component: () => import('@/views/photos/Index.vue'),
                    meta: {
                        title: '照片',
                        keepAlive: true,
                        cacheName: 'PhotosPage',
                    }
                },
                {
                    path: 'about',
                    name: 'About',
                    component: () => import('@/views/about/Index.vue'),
                    meta: {
                        title: '关于',
                        keepAlive: true,
                        cacheName: 'AboutPage',
                    }
                },
            ]
        },
        {
            path: '/admin',
            name: 'Admin',
            component: () => import('@/layouts/AdminLayout.vue'),
            redirect: '/admin/dashboard',
            meta: {
                title: '仪表盘'
            },
            children: [
                {
                    path: '/redirect/:path(.*)',
                    name: 'Redirect',
                    component: () => import('@/views/redirect/RedirectView.vue')
                },
                {
                    path: 'dashboard',
                    name: 'Dashboard',
                    component: () => import('@/views/admin/Dashboard.vue'),
                    meta: {
                        title: '首页'
                    },
                },
                {
                    path: 'user',
                    name: 'User',
                    component: () => import('@/views/admin/User.vue'),
                    meta: {
                        title: '用户管理'
                    },
                },
                {
                    path: 'setting',
                    name: 'Setting',
                    component: () => import('@/views/admin/Setting.vue'),
                    meta: {
                        title: '系统设置'
                    },
                },
                {
                    path: 'articles',
                    name: 'AdminArticles',
                    component: () => import('@/views/admin/articles/ArticleManage.vue'),
                    meta: {
                        title: '文章管理'
                    },
                },
                {
                    path: 'articles/new',
                    name: 'AdminArticleCreate',
                    component: () => import('@/views/admin/articles/ArticlePublish.vue'),
                    meta: {
                        title: '新增文章'
                    },
                },
                {
                    path: 'articles/:id/edit',
                    name: 'AdminArticleEdit',
                    component: () => import('@/views/admin/articles/ArticlePublish.vue'),
                    meta: {
                        title: '编辑文章'
                    },
                },
                {
                    path: 'articles/tags',
                    name: 'AdminArticleTags',
                    component: () => import('@/views/admin/articles/TagManage.vue'),
                    meta: {
                        title: '标签管理'
                    },
                },
                {
                    path: 'timeline',
                    name: 'TimelineManage',
                    component: () => import('@/views/admin/TimelineManage.vue'),
                    meta: {
                        title: '朋友圈管理'
                    },
                },
                {
                    path: 'build-timeline',
                    name: 'BuildTimelineManage',
                    component: () => import('@/views/admin/BuildTimelineManage.vue'),
                    meta: {
                        title: '建站时间线'
                    },
                },
                {
                    path: 'photos',
                    name: 'PhotoManage',
                    component: () => import('@/views/admin/PhotoManage.vue'),
                    meta: {
                        title: '照片管理'
                    },
                },
                {
                    path: 'about',
                    name: 'AboutManage',
                    component: () => import('@/views/admin/AboutManage.vue'),
                    meta: {
                        title: '关于页面'
                    },
                },
                {
                    path: 'comment',
                    name: 'CommentManage',
                    component: () => import('@/views/admin/CommentManage.vue'),
                    meta: {
                        title: '留言评论管理'
                    },
                }
            ]
        }
    ],

})

router.afterEach(() => {
    done(); // 结束进度条
});


router.beforeEach((to, from) => {
    saveCachedPageScroll(from)
    start()
    const tagStore = useTagStore()
    // 添加标签
    tagStore.addTag(to)
    return true
})

// 处理动态路由参数变化
router.afterEach((to, from) => {
    const tagStore = useTagStore()
    if (to.name === from.name && to.path !== from.path) {
        tagStore.updateTagPath(from.path, to.path, to.fullPath)
    }
})

export default router
