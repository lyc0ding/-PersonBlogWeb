<template>
  <div class="admin-layout">
    <el-header class="admin-header">
      <div class="header-left">
        <el-button class="collapse-btn" text @click="isCollapse = !isCollapse">
          <el-icon>
            <Expand v-if="isCollapse" />
            <Fold v-else />
          </el-icon>
        </el-button>
        <div>
          <h1>博客管理后台</h1>
          <p>文章、标签与站点内容管理</p>
        </div>
      </div>

      <div class="header-actions">
        <el-button text @click="router.push('/')">
          <el-icon><House /></el-icon>
          返回站点
        </el-button>
        <el-avatar :size="32" :src="avatarUrl" />
      </div>
    </el-header>

    <div class="admin-body">
      <el-aside class="admin-sidebar" :class="{ collapsed: isCollapse }">
        <el-scrollbar>
          <el-menu
            :collapse="isCollapse"
            :default-active="activeMenu"
            :collapse-transition="false"
            router
            unique-opened
            background-color="var(--admin-sidebar-bg)"
            text-color="var(--admin-sidebar-text)"
            active-text-color="var(--admin-sidebar-active)"
          >
            <el-menu-item index="/admin/dashboard">
              <el-icon><DataLine /></el-icon>
              <template #title>仪表盘</template>
            </el-menu-item>

            <el-sub-menu index="article">
              <template #title>
                <el-icon><Document /></el-icon>
                <span>文章管理</span>
              </template>
              <el-menu-item index="/admin/tec/article">文章列表</el-menu-item>
              <el-menu-item index="/admin/tec/article/add">写文章</el-menu-item>
              <el-menu-item index="/admin/tec/article/tag">标签管理</el-menu-item>
            </el-sub-menu>

            <el-menu-item index="/admin/timeline">
              <el-icon><Picture /></el-icon>
              <template #title>朋友圈管理</template>
            </el-menu-item>

            <el-menu-item index="/admin/comment">
              <el-icon><ChatDotRound /></el-icon>
              <template #title>留言评论</template>
            </el-menu-item>

            <el-menu-item index="/admin/user">
              <el-icon><User /></el-icon>
              <template #title>用户管理</template>
            </el-menu-item>

            <el-menu-item index="/admin/setting">
              <el-icon><Setting /></el-icon>
              <template #title>系统设置</template>
            </el-menu-item>
          </el-menu>
        </el-scrollbar>
      </el-aside>

      <main class="admin-main">
        <TagsView class="tags-bar" />
        <div class="page-content">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TagsView from '@/components/TagsView.vue'
import {
  DataLine,
  Document,
  Expand,
  Fold,
  House,
  ChatDotRound,
  Picture,
  Setting,
  User,
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const isCollapse = ref(false)
const avatarUrl = '/static/images/nickname.png'

const activeMenu = computed(() => route.path)
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--admin-layout-bg);
  color: var(--app-text-primary);
}

.admin-header {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background: var(--admin-header-bg);
  color: var(--admin-header-text);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.header-left,
.header-actions {
  display: flex;
  align-items: center;
  gap: 14px;
}

.collapse-btn {
  color: var(--admin-header-text);
}

.header-left h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.2;
}

.header-left p {
  margin: 4px 0 0;
  color: rgba(248, 250, 252, 0.68);
  font-size: 12px;
}

.header-actions :deep(.el-button) {
  color: var(--admin-header-text);
}

.admin-body {
  min-height: 0;
  flex: 1;
  display: flex;
}

.admin-sidebar {
  width: 220px;
  flex: 0 0 220px;
  background: var(--admin-sidebar-bg);
  border-right: 1px solid var(--admin-sidebar-border);
  transition: width 0.2s ease, flex-basis 0.2s ease;
}

.admin-sidebar.collapsed {
  width: 64px;
  flex-basis: 64px;
}

.admin-sidebar :deep(.el-menu) {
  border-right: 0;
}

.admin-main {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.tags-bar {
  flex: 0 0 34px;
}

.page-content {
  min-height: 0;
  flex: 1;
  padding: 16px;
  overflow: auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 760px) {
  .admin-sidebar {
    width: 64px;
    flex-basis: 64px;
  }

  .header-left p,
  .header-actions :deep(.el-button span) {
    display: none;
  }
}
</style>
