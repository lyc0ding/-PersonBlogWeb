<!-- components/TagsView.vue -->
<template>
  <div class="tags-view-container">
    <div class="tags-view-wrapper">
      <el-scrollbar class="tags-scrollbar">
        <div class="tags-list">
          <router-link
            v-for="tag in visitedTags"
            :key="tag.path"
            :to="{ path: tag.path }"
            class="tags-view-item"
            :class="isActive(tag) ? 'active' : ''"
          >
            {{ tag.title }}
            <span
              v-if="!tag.affix"
              class="el-icon-close"
              @click.prevent.stop="closeSelectedTag(tag)"
            ><i class="iconfont icon-close"></i></span>
          </router-link>
        </div>
      </el-scrollbar>
      
      <div class="right-menu">
        <el-dropdown @command="handleCommand" trigger="click">
          <span class="dropdown-trigger">
            <el-icon><MoreFilled /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="refresh">
                <el-icon><Refresh /></el-icon>
                刷新当前页
              </el-dropdown-item>
              <el-dropdown-item command="closeCurrent">
                <el-icon><Close /></el-icon>
                关闭当前
              </el-dropdown-item>
              <el-dropdown-item command="closeOther">
                <el-icon><CircleClose /></el-icon>
                关闭其他
              </el-dropdown-item>
              <el-dropdown-item command="closeAll">
                <el-icon><FolderDelete /></el-icon>
                关闭所有
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTagStore } from '@/stores/tagStore'
import { MoreFilled, Refresh, Close, CircleClose, FolderDelete } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const tagStore = useTagStore()

const visitedTags = computed(() => tagStore.visitedTags)

// 检查标签是否激活
const isActive = (tag) => {
  return tag.path === route.path
}

// 关闭标签
const closeSelectedTag = async (tag) => {
  // 固定标签不能关闭
  if (tag.affix) return
  
  await tagStore.deleteTag(tag)
  
  // 如果关闭的是当前激活的标签
  if (isActive(tag)) {
    const latestTag = visitedTags.value.slice(-1)[0]
    if (latestTag) {
      router.push(latestTag.path)
    } else {
      // 如果没有其他标签，跳转到首页
      router.push('/')
    }
  }
}

// 刷新当前页面
const refreshCurrentPage = () => {
  const { fullPath } = route
  router.replace({
    path: '/redirect' + fullPath
  })
}

// 处理下拉菜单命令
const handleCommand = (command) => {
  const currentTag = visitedTags.value.find(tag => tag.path === route.path)
  
  switch (command) {
    case 'refresh':
      refreshCurrentPage()
      break
    case 'closeCurrent':
      if (currentTag) closeSelectedTag(currentTag)
      break
    case 'closeOther':
      if (currentTag) {
        tagStore.deleteOtherTags(currentTag)
        // 如果当前标签不在标签列表中，跳转到当前标签
        if (!visitedTags.value.some(tag => tag.path === currentTag.path)) {
          router.push(currentTag.path)
        }
      }
      break
    case 'closeAll':
      tagStore.deleteAllTags()
      router.push('/')
      break
  }
}
</script>

<style scoped>
.tags-view-container {
  height: 34px;
  width: 100%;
  background: var(--app-tags-bg);
  border-bottom: 1px solid var(--app-tags-border);
  box-shadow: 0 1px 3px 0 var(--app-shadow-soft), 0 0 3px 0 var(--app-shadow-soft);
}

.tags-view-wrapper {
  display: flex;
  align-items: center;
  height: 100%;
}

.tags-scrollbar {
  flex: 1;
  height: 100%;
}

.tags-list {
  display: inline-flex;
  height: 100%;
  white-space: nowrap;
}

.tags-view-item {
  display: inline-flex;
  align-items: center;
  position: relative;
  cursor: pointer;
  height: 26px;
  line-height: 26px;
  border: 1px solid var(--app-tags-border);
  color: var(--app-tags-item-text);
  background: var(--app-tags-bg);
  padding: 0 8px;
  font-size: 12px;
  margin-left: 5px;
  margin-top: 4px;
  text-decoration: none;
}

.tags-view-item:first-of-type {
  margin-left: 15px;
}

.tags-view-item:last-of-type {
  margin-right: 15px;
}

.tags-view-item.active {
  background-color: var(--app-tags-active-bg);
  color: var(--app-tags-active-text);
  border-color: var(--app-tags-active-bg);
}

.tags-view-item.active::before {
  content: '';
  background: var(--app-tags-active-dot);
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  position: relative;
  margin-right: 2px;
}

.tags-view-item .el-icon-close {
  width: 16px;
  height: 16px;
  line-height: 16px;
  vertical-align: middle;
  border-radius: 50%;
  text-align: center;
  transition: all .3s cubic-bezier(.645, .045, .355, 1);
  transform-origin: 100% 50%;
  margin-left: 4px;

  & > .iconfont{
    font-size: 10px;
  }
}

.tags-view-item .el-icon-close:hover {
  color: var(--app-tags-close-hover);
}

.right-menu {
  padding: 0 10px;
  height: 100%;
  display: flex;
  align-items: center;
  border-left: 1px solid var(--app-tags-border);
}

.dropdown-trigger {
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
}
</style>
