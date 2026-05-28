import { createRouter, createWebHistory } from 'vue-router'
import { useTagStore } from '@/stores/tagStore'

const keepQueryRedirect = (path) => (to) => ({
    path,
    query: to.query,
    hash: to.hash,
})

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
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
                        keepAlive: true, // 启用缓存
                        title: '首页'
                    }
                },
                {
                    path: 'space',
                    name: 'Space',
                    component: () => import('@/views/space/Index.vue'),
                    meta: {
                        keepAlive: true, // 启用缓存
                        title: '朋友圈'
                    }
                },
                {
                    path: 'articles',
                    name: 'Articles',
                    component: () => import('@/views/articles/Index.vue'),
                    meta: {
                        keepAlive: true, // 启用缓存
                        title: '文章'
                    }
                },
                {
                    path: 'comments',
                    name: 'Comments',
                    component: () => import('@/views/comments/Index.vue'),
                    meta: {
                        keepAlive: true, // 启用缓存
                        title: '留言板'
                    }
                },
                {
                    path: 'photos',
                    name: 'Photos',
                    component: () => import('@/views/photos/Index.vue'),
                    meta: {
                        keepAlive: true,
                        title: '照片'
                    }
                },
                {
                    path: 'about',
                    name: 'About',
                    component: () => import('@/views/about/Index.vue'),
                    meta: {
                        keepAlive: true,
                        title: '关于'
                    }
                },
                {
                    path: 'live',
                    name: 'Live',
                    component: () => import('@/views/live/Index.vue'),
                    meta: {
                        keepAlive: true, // 启用缓存
                        title: '关于我'
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
                keepAlive: true, // 启用缓存
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
                        keepAlive: true, // 启用缓存
                        title: '首页'
                    },
                },
                {
                    path: 'user',
                    name: 'User',
                    component: () => import('@/views/admin/User.vue'),
                    meta: {
                        keepAlive: true, // 启用缓存
                        title: '用户管理'
                    },
                },
                {
                    path: 'setting',
                    name: 'Setting',
                    component: () => import('@/views/admin/Setting.vue'),
                    meta: {
                        keepAlive: true, // 启用缓存
                        title: '系统设置'
                    },
                },
                {
                    path: 'articles',
                    name: 'AdminArticles',
                    component: () => import('@/views/admin/articles/ArticleManage.vue'),
                    meta: {
                        keepAlive: true, // 启用缓存
                        title: '文章管理'
                    },
                },
                {
                    path: 'articles/new',
                    name: 'AdminArticleCreate',
                    component: () => import('@/views/admin/articles/ArticlePublish.vue'),
                    meta: {
                        keepAlive: false,
                        title: '新增文章'
                    },
                },
                {
                    path: 'articles/:id/edit',
                    name: 'AdminArticleEdit',
                    component: () => import('@/views/admin/articles/ArticlePublish.vue'),
                    meta: {
                        keepAlive: false,
                        title: '编辑文章'
                    },
                },
                {
                    path: 'articles/tags',
                    name: 'AdminArticleTags',
                    component: () => import('@/views/admin/articles/TagManage.vue'),
                    meta: {
                        keepAlive: true, // 启用缓存  
                        title: '标签管理'
                    },
                },
                {
                    path: 'timeline',
                    name: 'TimelineManage',
                    component: () => import('@/views/admin/TimelineManage.vue'),
                    meta: {
                        keepAlive: true,
                        title: '朋友圈管理'
                    },
                },
                {
                    path: 'about',
                    name: 'AboutManage',
                    component: () => import('@/views/admin/AboutManage.vue'),
                    meta: {
                        keepAlive: true,
                        title: '关于页面'
                    },
                },
                {
                    path: 'comment',
                    name: 'CommentManage',
                    component: () => import('@/views/admin/CommentManage.vue'),
                    meta: {
                        keepAlive: true,
                        title: '留言评论管理'
                    },
                }
            ]
        },
        {
            path: '/lab/article-editor',
            name: 'ArticleEditorDemo',
            component: () => import('@/views/lab/ArticleEditorDemo.vue'),
        },
        {
            path: '/test',
            redirect: '/lab/article-editor',
        }
    ],

})

// 模拟网络延迟函数
const simulateNetworkDelay = (delay = 5000) => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(), delay);
    });
};

// 路由守卫
// router.beforeEach(async (to, from, next) => {
//   start(); // 启动进度条

//   // 对特定路由模拟卡顿（示例：/admin 路由）
//   // if (to.path === "/admin" || to.path === "/live") {
//   //   await simulateNetworkDelay(2000); // 阻塞 2 秒
//   //   nProgress.set(0.8); // 模拟加载到 80% 卡住
//   // }

//   next(); // 放行路由
// });

// router.afterEach(() => {
//   done(); // 结束进度条
// });


router.beforeEach((to, from) => {
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
