import { createRouter, createWebHistory } from 'vue-router'
import AboutView from '@/views/AboutView.vue'
import { start, done } from "@/utils/nprogress";
import { useTagStore } from '@/stores/tagStore'
import nProgress from 'nprogress';
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: ()=>import('@/views/Index.vue'),
      children:[
        {
          path: '',
          name: 'Home',
          component:()=>import('@/views/home/Index.vue'),
          meta:{
            keepAlive: true, // 启用缓存
            title: '首页'
          }
        },
        {
          path: '/chatty',
          name: 'Chatty',
          component:()=>import('@/views/chatty/Index.vue'),
          meta:{
            keepAlive: true, // 启用缓存
            title: '碎碎念'
          }
        },
        {
          path: '/technolyge',
          name: 'Technolyge',
          component:()=>import('@/views/community/Index.vue'),
          meta:{
            keepAlive: true, // 启用缓存
            title: '技术社区'
          }
        },
        {
          path: '/comments',
          name: 'Comments',
          component:()=>import('@/views/comments/Index.vue'),
          meta:{
            keepAlive: true, // 启用缓存
            title: '访客留言'
          }
        },
      ]
    },
    {
      path: '/about',
      name: 'about',
      component: AboutView,
    },
    {
      path: '/live',
      name: 'Live',
      component:()=>import('@/views/live/Index.vue'),
      meta:{
        keepAlive: true, // 启用缓存
        title: '作者生活'
      }
    },
    {
      path: '/admin',
      name: 'Admin',
      component: () => import('@/views/admin/AdminLayout.vue'),
      redirect:'/admin/dashboard',
      meta:{
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
          meta:{
            keepAlive: true, // 启用缓存
            title: '首页'
          },
        },
        {
          path: '/admin/user',
          name: 'User',
          component: () => import('@/views/admin/User.vue'),
          meta:{
            keepAlive: true, // 启用缓存
            title: '用户管理'
          },
        },
        {
          path: '/admin/setting',
          name: 'setting',
          component: () => import('@/views/admin/Setting.vue'),
          meta:{
            keepAlive: true, // 启用缓存
            title: '系统设置'
          },
        },
        {
          path: '/admin/tec/article',
          name: 'TecArticle',
          component: () => import('@/views/admin/tec-article/ArticleManage.vue'),
          meta:{
            keepAlive: true, // 启用缓存
            title: '文章管理'
          },
        },
        {
          path: '/admin/tec/article/add',
          name: 'TecArticleAdd',
          component: () => import('@/views/admin/tec-article/ArticlePublish.vue'),
          meta:{
            keepAlive: true, // 启用缓存
            title: '新增文章'
          },
        },
        {
          path: '/admin/tec/article/tag',
          name: 'Tag',
          component: () => import('@/views/admin/tec-article/ArticelTagManage.vue'),
          meta:{
            keepAlive: true, // 启用缓存
            title: '标签管理'
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
    if (to.name === from.name && to.path !== from.path) {
      tagStore.updateTagPath(from.path, to.path, to.fullPath)
    }
  })

export default router
