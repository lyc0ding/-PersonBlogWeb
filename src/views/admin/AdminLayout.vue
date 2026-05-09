<template>
  <div class="admin-layout">
    <!-- 顶部导航栏 -->
    <el-header class="header">
      <div class="header-left">
        <div class="collapse-btn" @click="collapseMenu">
          <el-icon v-if="isCollapse"><Expand /></el-icon>
          <el-icon v-else><Fold /></el-icon>
        </div>
        <h1 class="system-title">管理系统</h1>
      </div>
      <div class="header-right">
        <el-tooltip content="消息通知" placement="bottom">
          <el-badge :value="12" class="notification-badge">
            <el-icon><Bell /></el-icon>
          </el-badge>
        </el-tooltip>
        <el-tooltip content="全屏切换" placement="bottom">
          <el-icon @click="toggleFullScreen"><FullScreen /></el-icon>
        </el-tooltip>
        <el-dropdown>
          <span class="user-info">
            <el-avatar :size="32" :src="userAvatar" />
            <span class="user-name">管理员</span>
            <el-icon><arrow-down /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>
                <el-icon><User /></el-icon>
                个人中心
              </el-dropdown-item>
              <el-dropdown-item>
                <el-icon><Setting /></el-icon>
                系统设置
              </el-dropdown-item>
              <el-dropdown-item divided @click="handleLogout">
                <el-icon><SwitchButton /></el-icon>
                退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>

    <!-- 主体区域 -->
    <div class="main-container">
      <!-- 侧边栏 -->
      <el-aside :class="['sidebar', { 'sidebar-collapse': isCollapse }]">
        <el-scrollbar>
          <el-menu
            :default-active="activeMenu"
            :collapse="isCollapse"
            :collapse-transition="false"
            router
            unique-opened
            background-color="var(--admin-sidebar-bg)"
            text-color="var(--admin-sidebar-text)"
            active-text-color="var(--admin-sidebar-active)"
          >
            <!-- 仪表盘 -->
            <el-menu-item index="/admin/dashboard">
              <el-icon><DataLine /></el-icon>
              <template #title>仪表盘</template>
            </el-menu-item>

            <!-- 用户管理 -->
            <el-sub-menu index="user-management">
              <template #title>
                <el-icon><User /></el-icon>
                <span>用户管理</span>
              </template>
              <el-menu-item index="/admin/user">用户列表</el-menu-item>
              <el-menu-item index="/user/add">添加用户</el-menu-item>
              <el-menu-item index="/user/roles">角色管理</el-menu-item>
            </el-sub-menu>

            <!-- 内容管理 -->
            <el-sub-menu index="content-management">
              <template #title>
                <el-icon><Document /></el-icon>
                <span>内容管理</span>
              </template>
              <el-menu-item index="/admin/tec/article">文章管理</el-menu-item>
              <el-menu-item index="/admin/tec/article/add">新增文章</el-menu-item>
              <el-menu-item index="/admin/tec/article/tag">标签管理</el-menu-item>
            </el-sub-menu>

            <!-- 数据分析 -->
            <el-sub-menu index="data-analysis">
              <template #title>
                <el-icon><DataAnalysis /></el-icon>
                <span>数据分析</span>
              </template>
              <el-menu-item index="/data/overview">数据概览</el-menu-item>
              <el-menu-item index="/data/reports">报表分析</el-menu-item>
              <el-menu-item index="/data/statistics">统计信息</el-menu-item>
            </el-sub-menu>

            <!-- 系统设置 -->
            <el-menu-item index="/admin/setting">
              <el-icon><Setting /></el-icon>
              <template #title>系统设置</template>
            </el-menu-item>
          </el-menu>
        </el-scrollbar>
      </el-aside>

      <!-- 主内容区域 -->
      <main class="main-content">
        <div class="content-wrapper">
          <!-- 面包屑导航 -->
          <div class="breadcrumb">
            <TagsView />
          </div>

          <!-- 页面内容 -->
          <div class="content">
            <router-view v-slot="{ Component }">
              <transition name="fade" mode="out-in">
                <component :is="Component" />
              </transition>
            </router-view>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TagsView from '@/components/TagsView.vue'
import {
  Fold,
  Expand,
  User,
  Document,
  DataAnalysis,
  Setting,
  ArrowDown,
  Bell,
  FullScreen,
  SwitchButton,
  DataLine
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

// 响应式状态
const isCollapse = ref(false)
const userAvatar = ref('https://via.placeholder.com/150')

// 计算当前激活的菜单项
const activeMenu = computed(() => route.path)

// 计算面包屑导航列表（简化版，实际应根据路由匹配生成）
const breadcrumbList = computed(() => {
  const path = route.path
  if (path === '/admin/dashboard') return ['仪表盘']
  if (path.startsWith('/admin/user')) return ['用户管理', path.split('/').pop()]
  if (path.startsWith('/admin/content')) return ['内容管理', path.split('/').pop()]
  if (path.startsWith('/data')) return ['数据分析', path.split('/').pop()]
  if (path === '/admin/settings') return ['系统设置']
  return []
})

// 折叠菜单
const collapseMenu = () => {
  isCollapse.value = !isCollapse.value
}

// 全屏切换
const toggleFullScreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => {
      console.error('全屏请求失败:', err)
    })
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    }
  }
}

// 退出登录
const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 这里处理退出登录逻辑
    router.push('/login')
    ElMessage.success('退出成功')
  }).catch(() => {
    // 取消退出
  })
}

// 监听路由变化
onMounted(() => {
  console.log('管理系统布局已加载')
})
</script>

<style scoped>
.admin-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--admin-layout-bg);
  color: var(--app-text-primary);
}

/* 头部样式 */
.header {
  display: flex;
  height: 100px;
  justify-content: space-between;
  align-items: center;
  background-color: var(--admin-header-bg);
  color: var(--admin-header-text);
  padding: 0 20px;
  box-shadow: 0 2px 4px var(--app-shadow-soft);
  z-index: 1000;
}

.header-left {
  display: flex;
  align-items: center;
}

.collapse-btn {
  cursor: pointer;
  margin-right: 15px;
  font-size: 18px;
  transition: all 0.3s;
}

.collapse-btn:hover {
  color: var(--admin-collapse-hover);
}

.system-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.notification-badge {
  cursor: pointer;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: var(--admin-header-text);
  gap: 8px;
}

.user-name {
  font-size: 14px;
}

/* 主体容器 */
.main-container {
  display: flex;
  flex: 1;
  overflow: hidden;

  .el-menu{
    border: none!important;
  }
}

/* 侧边栏样式 */
.sidebar {
  width: 220px;
  background-color: var(--admin-sidebar-bg);
  transition: width 0.3s;
  overflow-y: auto;
  border-right: 1px solid var(--admin-sidebar-border);
}

.sidebar-collapse {
  width: 64px;
}

/* 主内容区域 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.content-wrapper {
  overflow-y: auto;
  height: 100%;
}

.breadcrumb {
  position: absolute;
  top: 0px;
  padding: 15px 0px;
  width: 100%;
  height: 34px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  background-color: var(--admin-breadcrumb-bg);
  box-shadow: 0 1px 4px var(--app-shadow-soft);
  z-index: 999;
}

.content {
  margin-top: 34px;
  display: flex;
  flex-direction: column; /* 子元素垂直排列 */
  min-height: calc(100% - 80px);
  border-radius: 4px;
  padding: 15px;
  box-shadow: 0 1px 4px var(--app-shadow-soft);
}

.content > div {
  flex: 1;
}

/* 页脚样式 */
.footer {
  background-color: var(--admin-footer-bg);
  color: var(--admin-footer-text);
  text-align: center;
  padding: 12px;
  font-size: 12px;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    width: 0;
  }
  
  .sidebar-collapse {
    width: 0;
  }
  
  .system-title {
    font-size: 16px;
  }
  
  .user-name {
    display: none;
  }
  
  .header-right {
    gap: 12px;
  }
}

/* 滚动条样式 */
:deep(.el-scrollbar__bar.is-vertical) {
  width: 6px;
}

:deep(.el-scrollbar__thumb) {
  background-color: var(--app-scrollbar-thumb);
}

:deep(.el-scrollbar__thumb:hover) {
  background-color: var(--app-scrollbar-thumb-hover);
}
</style>