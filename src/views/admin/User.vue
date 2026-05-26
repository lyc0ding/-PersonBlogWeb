<template>
  <div class="user-page">
    <header class="page-head">
      <div>
        <h2>用户管理</h2>
        <p>系统用户与后台权限账号</p>
      </div>
      <el-button :loading="loading" @click="loadUsers">刷新</el-button>
    </header>

    <el-alert
      v-if="error"
      :title="error"
      type="error"
      show-icon
      :closable="false"
    />

    <el-table v-loading="loading" :data="users" border stripe>
      <el-table-column label="头像" width="86" align="center">
        <template #default="{ row }">
          <el-avatar :src="row.avatar || '/logo.png'" :size="36">
            {{ row.nickname || row.username }}
          </el-avatar>
        </template>
      </el-table-column>
      <el-table-column prop="username" label="账号" min-width="140" />
      <el-table-column prop="nickname" label="昵称" min-width="140" />
      <el-table-column prop="email" label="邮箱" min-width="180" show-overflow-tooltip />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'">
            {{ row.status === 1 ? '正常' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" min-width="180" />
      <el-table-column prop="updateTime" label="更新时间" min-width="180" />
    </el-table>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { userListService } from '@/api/admin/system'

const loading = ref(false)
const error = ref('')
const users = ref([])

async function loadUsers() {
  loading.value = true
  error.value = ''
  try {
    const res = await userListService()
    const list = res?.data ?? res ?? []
    users.value = Array.isArray(list) ? list : []
  } catch (err) {
    users.value = []
    error.value = err?.message || '用户列表加载失败，请确认后端 `/system/user/list` 可访问。'
  } finally {
    loading.value = false
  }
}

onMounted(loadUsers)
</script>

<style scoped>
.user-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
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

.page-head h2 {
  margin: 0 0 4px;
  color: var(--app-text-primary);
}

.page-head p {
  margin: 0;
  color: var(--app-text-secondary);
}
</style>
