import { createRouter, createWebHistory } from 'vue-router'
import { useTagStore } from '@/stores/tagStore'
const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            component: () => import('@/views/Index.vue'),
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
                    path: '/space',
                    name: 'Space',
                    component: () => import('@/views/space/Index.vue'),
                    meta: {
                        keepAlive: true, // 启用缓存
                        title: '朋友圈'
                    }
                },
                {
                    path: '/technolyge',
                    name: 'Technolyge',
                    component: () => import('@/views/community/Index.vue'),
                    meta: {
                        keepAlive: true, // 启用缓存
                        title: '文章'
                    }
                },
                {
                    path: '/comments',
                    name: 'Comments',
                    component: () => import('@/views/comments/Index.vue'),
                    meta: {
                        keepAlive: true, // 启用缓存
                        title: '留言板'
                    }
                },
                {
                    path: '/links',
                    redirect: '/photos'
                },
                {
                    path: '/photos',
                    name: 'Photos',
                    component: () => import('@/views/FriendsView.vue'),
                    meta: {
                        keepAlive: true,
                        title: '照片'
                    }
                },
                {
                    path: '/about',
                    name: 'about',
                    component: () => import('@/views/AboutView.vue'),
                    meta: {
                        keepAlive: true,
                        title: '关于'
                    }
                },
                {
                    path: '/live',
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
            component: () => import('@/views/admin/AdminLayout.vue'),
            redirect: '/admin/dashboard',
            meta: {
                keepAlive: true, // 启用缓存
                title: '仪表盘'
            },
            children: [
                {
                    path: '/redirect/:path(.*)',
                    name: 'Redirect',
                    component: () => import('@/components/Redirect.vue')
                },
                {
                    path: '/admin/dashboard',
                    name: 'DashBoard',
                    component: () => import('@/views/admin/DashBoard.vue'),
                    meta: {
                        keepAlive: true, // 启用缓存
                        title: '首页'
                    },
                },
                {
                    path: '/admin/user',
                    name: 'User',
                    component: () => import('@/views/admin/User.vue'),
                    meta: {
                        keepAlive: true, // 启用缓存
                        title: '用户管理'
                    },
                },
                {
                    path: '/admin/setting',
                    name: 'setting',
                    component: () => import('@/views/admin/Setting.vue'),
                    meta: {
                        keepAlive: true, // 启用缓存
                        title: '系统设置'
                    },
                },
                {
                    path: '/admin/tec/article',
                    name: 'TecArticle',
                    component: () => import('@/views/admin/tec-article/ArticleManage.vue'),
                    meta: {
                        keepAlive: true, // 启用缓存
                        title: '文章管理'
                    },
                },
                {
                    path: '/admin/tec/article/add',
                    name: 'TecArticleAdd',
                    component: () => import('@/views/admin/tec-article/ArticlePublish.vue'),
                    meta: {
                        keepAlive: false,
                        title: '新增文章'
                    },
                },
                {
                    path: '/admin/tec/article/edit/:id',
                    name: 'TecArticleEdit',
                    component: () => import('@/views/admin/tec-article/ArticlePublish.vue'),
                    meta: {
                        keepAlive: false,
                        title: '编辑文章'
                    },
                },
                {
                    path: '/admin/tec/article/tag',
                    name: 'Tag',
                    component: () => import('@/views/admin/tec-article/TagManage.vue'),
                    meta: {
                        keepAlive: true, // 启用缓存  
                        title: '标签管理'
                    },
                },
                {
                    path: '/admin/timeline',
                    name: 'TimelineManage',
                    component: () => import('@/views/admin/TimelineManage.vue'),
                    meta: {
                        keepAlive: true,
                        title: '朋友圈管理'
                    },
                },
                {
                    path: '/admin/comment',
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
            path: '/test',
            name: '测试',
            component: () => import('@/views/test/ArticleEditor.vue'),
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
