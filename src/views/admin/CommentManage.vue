<template>
  <div class="comment-manage">
    <header class="page-head">
      <div>
        <h2>留言评论管理</h2>
        <p>审核留言板和文章详情中的评论回复</p>
      </div>
      <el-button :loading="loading" @click="loadList">
        <el-icon><Refresh /></el-icon>
        刷新
      </el-button>
    </header>

    <div class="toolbar">
      <el-select v-model="query.scope" placeholder="范围" clearable class="select" @change="loadList">
        <el-option label="留言板" value="guestbook" />
        <el-option label="文章评论" value="article" />
      </el-select>
      <el-select v-model="query.status" placeholder="状态" clearable class="select" @change="loadList">
        <el-option label="待审" :value="0" />
        <el-option label="通过" :value="1" />
        <el-option label="拒绝" :value="2" />
      </el-select>
      <el-input
        v-model="articleIdInput"
        clearable
        placeholder="文章 ID"
        class="article-id"
        @keyup.enter="applyArticleId"
        @clear="clearArticleId"
      />
      <el-button type="primary" @click="applyArticleId">查询</el-button>
    </div>

    <el-table v-loading="loading" :data="tableData" border stripe>
      <el-table-column label="留言内容" min-width="320">
        <template #default="{ row }">
          <div class="comment-cell">
            <strong>{{ row.nickname }}</strong>
            <span>{{ row.content }}</span>
            <small v-if="row.replyToNickname">回复 {{ row.replyToNickname }}</small>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="来源" width="120">
        <template #default="{ row }">
          {{ row.articleId ? '文章评论' : '留言板' }}
        </template>
      </el-table-column>
      <el-table-column label="文章ID" prop="articleId" width="180" show-overflow-tooltip />
      <el-table-column label="邮箱" prop="email" min-width="170" show-overflow-tooltip />
      <el-table-column label="IP属地" width="120">
        <template #default="{ row }">
          {{ row.ipLocation || row.ip || '未知' }}
        </template>
      </el-table-column>
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="statusTagType(row.status)" size="small">
            {{ statusLabel(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="时间" prop="createTime" width="170" />
      <el-table-column label="操作" width="210" align="center" fixed="right">
        <template #default="{ row }">
          <el-button link type="success" :disabled="row.status === 1" @click="updateStatus(row, 1)">通过</el-button>
          <el-button link type="warning" :disabled="row.status === 2" @click="updateStatus(row, 2)">拒绝</el-button>
          <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pager">
      <el-pagination
        v-model:current-page="query.pageNum"
        v-model:page-size="query.pageSize"
        :page-sizes="[10, 20, 50]"
        :total="total"
        layout="total, sizes, prev, pager, next"
        @current-change="loadList"
        @size-change="loadList"
      />
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import {
  commentAdminPageService,
  commentDeleteService,
  commentUpdateStatusService,
} from '@/api/comment'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const articleIdInput = ref('')

const query = reactive({
  pageNum: 1,
  pageSize: 10,
  scope: undefined,
  status: undefined,
  articleId: undefined,
})

function statusLabel(status) {
  if (status === 1) return '通过'
  if (status === 2) return '拒绝'
  return '待审'
}

function statusTagType(status) {
  if (status === 1) return 'success'
  if (status === 2) return 'danger'
  return 'warning'
}

function applyArticleId() {
  const value = articleIdInput.value.trim()
  if (value && !/^\d+$/.test(value)) {
    ElMessage.warning('文章 ID 只能是数字')
    return
  }
  query.articleId = value ? value : undefined
  query.pageNum = 1
  loadList()
}

function clearArticleId() {
  query.articleId = undefined
  query.pageNum = 1
  loadList()
}

async function loadList() {
  loading.value = true
  try {
    const res = await commentAdminPageService({ ...query })
    const page = res?.data ?? res ?? {}
    tableData.value = page.records ?? page.list ?? []
    total.value = page.total ?? tableData.value.length
  } catch (err) {
    tableData.value = []
    total.value = 0
    ElMessage.error(err?.message || '留言评论列表加载失败')
  } finally {
    loading.value = false
  }
}

async function updateStatus(row, status) {
  try {
    await commentUpdateStatusService(row.id, status)
    row.status = status
    ElMessage.success('状态已更新')
  } catch (err) {
    ElMessage.error(err?.message || '状态更新失败')
  }
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm('删除该留言及其子回复，是否继续？', '删除留言', { type: 'warning' })
    await commentDeleteService(row.id)
    ElMessage.success('删除成功')
    await loadList()
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error(err?.message || '删除失败')
    }
  }
}

onMounted(loadList)
</script>

<style scoped>
.comment-manage {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-head,
.toolbar {
  padding: 16px;
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: 8px;
}

.page-head,
.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-head {
  justify-content: space-between;
}

.page-head h2,
.page-head p {
  margin: 0;
}

.page-head p {
  margin-top: 4px;
  color: var(--app-text-muted);
}

.select {
  width: 140px;
}

.article-id {
  width: 220px;
}

.comment-cell {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.comment-cell span {
  color: var(--app-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.comment-cell small {
  color: var(--app-text-muted);
}

.pager {
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 720px) {
  .page-head,
  .toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .select,
  .article-id {
    width: 100%;
  }
}
</style>
