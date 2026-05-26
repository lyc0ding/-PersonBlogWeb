<template>
  <div class="dashboard">
    <header class="page-head">
      <div>
        <h2>仪表盘</h2>
        <p>站点内容与后台数据概览</p>
      </div>
      <el-button :loading="loading" @click="loadStats">刷新</el-button>
    </header>

    <el-row :gutter="14">
      <el-col v-for="item in statCards" :key="item.key" :xs="12" :sm="8" :lg="4">
        <section class="stat-card">
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
        </section>
      </el-col>
    </el-row>

    <section class="panel">
      <div class="panel-title">
        <h3>联调状态</h3>
        <el-tag :type="error ? 'danger' : 'success'">
          {{ error ? '接口异常' : '接口正常' }}
        </el-tag>
      </div>
      <p v-if="error" class="error-text">{{ error }}</p>
      <p v-else>已连接 `/system/dashboard`，文章、标签、评论、用户统计来自 MySQL。</p>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { dashboardStatsService } from '@/api/admin/system'

const loading = ref(false)
const error = ref('')
const stats = ref({
  articleCount: 0,
  publishedCount: 0,
  draftCount: 0,
  tagCount: 0,
  commentCount: 0,
  userCount: 0,
})

const statCards = computed(() => [
  { key: 'articleCount', label: '文章总数', value: stats.value.articleCount ?? 0 },
  { key: 'publishedCount', label: '已发布', value: stats.value.publishedCount ?? 0 },
  { key: 'draftCount', label: '草稿', value: stats.value.draftCount ?? 0 },
  { key: 'tagCount', label: '标签', value: stats.value.tagCount ?? 0 },
  { key: 'commentCount', label: '评论', value: stats.value.commentCount ?? 0 },
  { key: 'userCount', label: '用户', value: stats.value.userCount ?? 0 },
])

async function loadStats() {
  loading.value = true
  error.value = ''
  try {
    const res = await dashboardStatsService()
    stats.value = res?.data ?? res ?? stats.value
  } catch (err) {
    error.value = err?.message || '无法连接后台，请确认 Spring Boot 服务和 MySQL 已启动。'
  } finally {
    loading.value = false
  }
}

onMounted(loadStats)
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-head,
.panel {
  padding: 16px;
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: 8px;
}

.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.page-head h2,
.panel-title h3 {
  margin: 0;
  color: var(--app-text-primary);
}

.page-head p,
.panel p {
  margin: 4px 0 0;
  color: var(--app-text-secondary);
}

.stat-card {
  min-height: 112px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: 8px;
}

.stat-card span {
  color: var(--app-text-muted);
  font-size: 13px;
}

.stat-card strong {
  color: var(--app-text-primary);
  font-size: 30px;
  line-height: 1;
}

.panel-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.error-text {
  color: var(--el-color-danger);
}
</style>
