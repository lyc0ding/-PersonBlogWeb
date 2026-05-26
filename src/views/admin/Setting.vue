<template>
  <div class="setting-page">
    <header class="page-head">
      <div>
        <h2>系统设置</h2>
        <p>站点配置、上传策略、评论策略等系统参数</p>
      </div>
      <div class="actions">
        <el-select v-model="group" clearable placeholder="全部分组" class="group-select" @change="loadConfigs">
          <el-option label="站点" value="site" />
          <el-option label="上传" value="upload" />
          <el-option label="评论" value="comment" />
        </el-select>
        <el-button :loading="loading" @click="loadConfigs">刷新</el-button>
      </div>
    </header>

    <el-alert
      v-if="error"
      :title="error"
      type="error"
      show-icon
      :closable="false"
    />

    <el-table v-loading="loading" :data="configs" border stripe>
      <el-table-column prop="configName" label="名称" min-width="160" />
      <el-table-column prop="configKey" label="键" min-width="190" show-overflow-tooltip />
      <el-table-column prop="configValue" label="值" min-width="220" show-overflow-tooltip />
      <el-table-column prop="configGroup" label="分组" width="110">
        <template #default="{ row }">
          <el-tag>{{ groupLabel(row.configGroup) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="valueType" label="类型" width="110" />
      <el-table-column prop="remark" label="备注" min-width="220" show-overflow-tooltip />
      <el-table-column prop="updateTime" label="更新时间" min-width="180" />
    </el-table>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { configListService } from '@/api/admin/system'

const loading = ref(false)
const error = ref('')
const group = ref('')
const configs = ref([])

const labels = {
  site: '站点',
  upload: '上传',
  comment: '评论',
}

function groupLabel(value) {
  return labels[value] || value || '-'
}

async function loadConfigs() {
  loading.value = true
  error.value = ''
  try {
    const res = await configListService(group.value)
    const list = res?.data ?? res ?? []
    configs.value = Array.isArray(list) ? list : []
  } catch (err) {
    configs.value = []
    error.value = err?.message || '配置列表加载失败，请确认后端 `/system/config/list` 可访问。'
  } finally {
    loading.value = false
  }
}

onMounted(loadConfigs)
</script>

<style scoped>
.setting-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: 8px;
}

.page-head,
.actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-head {
  justify-content: space-between;
  flex-wrap: wrap;
}

.page-head h2 {
  margin: 0 0 4px;
  color: var(--app-text-primary);
}

.page-head p {
  margin: 0;
  color: var(--app-text-secondary);
}

.group-select {
  width: 150px;
}
</style>
