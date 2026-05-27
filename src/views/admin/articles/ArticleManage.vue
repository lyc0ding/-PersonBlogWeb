<template>
  <div class="article-manage">
    <div class="toolbar">
      <el-input
        v-model="query.keyword"
        placeholder="搜索标题 / 摘要"
        clearable
        class="keyword"
        @keyup.enter="loadList"
      />
      <el-select v-model="query.status" placeholder="状态" clearable class="status" @change="loadList">
        <el-option label="草稿" :value="ARTICLE_STATUS.DRAFT" />
        <el-option label="已发布" :value="ARTICLE_STATUS.PUBLISHED" />
        <el-option label="已归档" :value="ARTICLE_STATUS.ARCHIVED" />
      </el-select>
      <el-button type="primary" @click="loadList">查询</el-button>
      <el-button type="success" @click="goCreate">
        <el-icon><Plus /></el-icon>
        新建文章
      </el-button>
    </div>

    <el-table v-loading="loading" :data="tableData" border stripe>
      <el-table-column label="标题" prop="title" min-width="220" show-overflow-tooltip />
      <el-table-column label="摘要" prop="summary" min-width="220" show-overflow-tooltip />
      <el-table-column label="类型" width="90">
        <template #default="{ row }">
          {{ row.type === ARTICLE_TYPE.SHUOSHUO ? '朋友圈' : '文章' }}
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="statusTagType(row.status)" size="small">
            {{ ARTICLE_STATUS_LABEL[row.status] ?? '未知' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" prop="updateTime" width="180" />
      <el-table-column label="操作" width="190" align="center" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="goEdit(row.id)">编辑</el-button>
          <el-button link :type="row.status === ARTICLE_STATUS.PUBLISHED ? 'warning' : 'success'" @click="toggleStatus(row)">
            {{ row.status === ARTICLE_STATUS.PUBLISHED ? '下线' : '发布' }}
          </el-button>
          <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pager">
      <el-pagination
        v-model:current-page="query.pageNum"
        v-model:page-size="query.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @current-change="loadList"
        @size-change="loadList"
      />
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import {
  articleDeleteService,
  articlePageService,
  articleUpdateStatusService,
} from '@/api/admin/article'
import { ARTICLE_STATUS, ARTICLE_STATUS_LABEL, ARTICLE_TYPE } from '@/constants/article'

const router = useRouter()
const loading = ref(false)
const tableData = ref([])
const total = ref(0)

const query = reactive({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  status: undefined,
})

function statusTagType(status) {
  if (status === ARTICLE_STATUS.PUBLISHED) return 'success'
  if (status === ARTICLE_STATUS.DRAFT) return 'info'
  return 'warning'
}

function fallbackRows() {
  return [
    {
      id: 1,
      title: '博客编辑器联调示例',
      summary: '后端未启动时展示的本地示例数据。',
      type: ARTICLE_TYPE.ARTICLE,
      status: ARTICLE_STATUS.DRAFT,
      updateTime: new Date().toLocaleString('zh-CN', { hour12: false }),
    },
  ]
}

async function loadList() {
  loading.value = true
  try {
    const res = await articlePageService({ ...query })
    const page = res?.data ?? res
    tableData.value = page?.records ?? page?.list ?? []
    total.value = page?.total ?? tableData.value.length
  } catch {
    tableData.value = fallbackRows()
    total.value = tableData.value.length
  } finally {
    loading.value = false
  }
}

function goCreate() {
  router.push({ name: 'AdminArticleCreate' })
}

function goEdit(id) {
  router.push({ name: 'AdminArticleEdit', params: { id } })
}

async function toggleStatus(row) {
  const next = row.status === ARTICLE_STATUS.PUBLISHED ? ARTICLE_STATUS.DRAFT : ARTICLE_STATUS.PUBLISHED
  const action = next === ARTICLE_STATUS.PUBLISHED ? '发布' : '下线'
  try {
    await ElMessageBox.confirm(`确定${action}这篇文章？`, '提示', { type: 'warning' })
    await articleUpdateStatusService(row.id, next)
    row.status = next
    ElMessage.success(`${action}成功`)
  } catch (err) {
    if (err !== 'cancel') {
      row.status = next
      ElMessage.warning(`后端未就绪，已在本地切换为${ARTICLE_STATUS_LABEL[next]}`)
    }
  }
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm('删除后不可恢复，是否继续？', '删除确认', { type: 'error' })
    await articleDeleteService(row.id)
    tableData.value = tableData.value.filter((item) => item.id !== row.id)
    total.value = tableData.value.length
    ElMessage.success('删除成功')
  } catch (err) {
    if (err !== 'cancel') {
      tableData.value = tableData.value.filter((item) => item.id !== row.id)
      total.value = tableData.value.length
      ElMessage.warning('后端未就绪，已从本地列表移除')
    }
  }
}

onMounted(loadList)
</script>

<style scoped>
.article-manage {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: 8px;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.keyword {
  width: min(280px, 100%);
}

.status {
  width: 130px;
}

.pager {
  display: flex;
  justify-content: flex-end;
}
</style>
