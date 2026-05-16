<template>
  <div class="article-manage">
    <div class="toolbar">
      <el-input
        v-model="query.keyword"
        placeholder="搜索标题 / 摘要"
        clearable
        style="width: 240px"
        @keyup.enter="loadList"
      />
      <el-select v-model="query.status" placeholder="状态" clearable style="width: 120px" @change="loadList">
        <el-option label="草稿" :value="0" />
        <el-option label="已发布" :value="1" />
        <el-option label="已归档" :value="2" />
      </el-select>
      <el-button type="primary" @click="loadList">查询</el-button>
      <el-button type="success" @click="goCreate">
        <el-icon><Plus /></el-icon>
        新建文章
      </el-button>
    </div>

    <el-table v-loading="loading" :data="tableData" border stripe style="width: 100%">
      <el-table-column type="selection" width="48" />
      <el-table-column label="标题" prop="title" min-width="200" show-overflow-tooltip />
      <el-table-column label="摘要" prop="summary" min-width="180" show-overflow-tooltip />
      <el-table-column label="封面" width="100">
        <template #default="{ row }">
          <el-image
            v-if="row.coverUrl"
            :src="row.coverUrl"
            fit="cover"
            style="width: 56px; height: 36px; border-radius: 4px"
          />
          <span v-else class="text-muted">无</span>
        </template>
      </el-table-column>
      <el-table-column label="类型" width="90">
        <template #default="{ row }">
          {{ row.type === 'shuoshuo' ? '说说' : '文章' }}
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="statusTagType(row.status)" size="small">
            {{ ARTICLE_STATUS_LABEL[row.status] ?? '未知' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" prop="updateTime" width="170" />
      <el-table-column label="操作" align="center" width="220" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="goEdit(row.id)">编辑</el-button>
          <el-button
            link
            :type="row.status === 1 ? 'warning' : 'success'"
            size="small"
            @click="toggleStatus(row)"
          >
            {{ row.status === 1 ? '下线' : '发布' }}
          </el-button>
          <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
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
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import {
  articlePageService,
  articleDeleteService,
  articleUpdateStatusService,
} from '@/api/admin/article'
import { ARTICLE_STATUS, ARTICLE_STATUS_LABEL } from '@/constants/article'

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
  if (status === 1) return 'success'
  if (status === 0) return 'info'
  return 'warning'
}

function mockRows() {
  return Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    title: ['Codex 自制宠物', 'U-Boot 移植笔记', '2025 年终总结'][i % 3],
    summary: '示例摘要内容，联调后端后替换为接口数据。',
    coverUrl: i % 2 ? '/img/bac1.jpg' : '',
    type: i % 4 === 0 ? 'shuoshuo' : 'article',
    status: i % 3,
    updateTime: '2026-05-08 13:06:00',
  }))
}

async function loadList() {
  loading.value = true
  try {
    const res = await articlePageService({ ...query })
    const page = res?.data ?? res
    tableData.value = page?.records ?? page?.list ?? []
    total.value = page?.total ?? tableData.value.length
  } catch {
    tableData.value = mockRows()
    total.value = tableData.value.length
  } finally {
    loading.value = false
  }
}

function goCreate() {
  router.push({ name: 'TecArticleAdd' })
}

function goEdit(id) {
  router.push({ name: 'TecArticleEdit', params: { id } })
}

async function toggleStatus(row) {
  const next = row.status === ARTICLE_STATUS.PUBLISHED ? ARTICLE_STATUS.DRAFT : ARTICLE_STATUS.PUBLISHED
  const tip = next === ARTICLE_STATUS.PUBLISHED ? '发布' : '下线为草稿'
  try {
    await ElMessageBox.confirm(`确定${tip}该文章？`, '提示', { type: 'warning' })
    await articleUpdateStatusService(row.id, next)
    row.status = next
    ElMessage.success(`${tip}成功`)
  } catch (err) {
    if (err !== 'cancel') {
      row.status = next
      ElMessage.success(`后端未就绪，已在本地切换为${ARTICLE_STATUS_LABEL[next]}`)
    }
  }
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm('删除后不可恢复，是否继续？', '删除确认', { type: 'error' })
    await articleDeleteService(row.id)
    tableData.value = tableData.value.filter((item) => item.id !== row.id)
    ElMessage.success('删除成功')
  } catch (err) {
    if (err !== 'cancel') {
      tableData.value = tableData.value.filter((item) => item.id !== row.id)
      ElMessage.success('后端未就绪，已从列表移除（刷新后恢复）')
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
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.pager {
  display: flex;
  justify-content: flex-end;
}

.text-muted {
  color: var(--app-text-muted);
  font-size: 12px;
}
</style>
