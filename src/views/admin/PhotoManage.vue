<template>
  <div class="photo-manage">
    <header class="page-head">
      <div>
        <h2>照片管理</h2>
        <p>维护前台照片墙图片和留言头像库</p>
      </div>
      <el-button type="primary" @click="openCreate">
        <el-icon><Plus /></el-icon>
        {{ activeType === 'avatar' ? '新增头像' : '新增照片' }}
      </el-button>
    </header>

    <div class="toolbar">
      <el-tabs v-model="activeType" class="type-tabs" @tab-change="handleTypeChange">
        <el-tab-pane label="照片墙" name="photo" />
        <el-tab-pane label="头像库" name="avatar" />
      </el-tabs>
      <el-select v-model="query.status" placeholder="展示状态" clearable class="status" @change="loadList">
        <el-option label="展示中" :value="1" />
        <el-option label="已隐藏" :value="0" />
      </el-select>
      <el-button :loading="loading" @click="loadList">
        <el-icon><Refresh /></el-icon>
        刷新
      </el-button>
    </div>

    <el-table v-loading="loading" :data="tableData" border stripe>
      <el-table-column label="图片" width="110" align="center">
        <template #default="{ row }">
          <el-image
            v-if="row.imageUrl"
            :src="row.imageUrl"
            :preview-src-list="[row.imageUrl]"
            fit="cover"
            class="preview"
            preview-teleported
          />
        </template>
      </el-table-column>
      <el-table-column label="信息" min-width="280">
        <template #default="{ row }">
          <div class="photo-cell">
            <strong>{{ row.title || defaultTitle }}</strong>
            <span>{{ row.description || '无描述' }}</span>
            <small>{{ row.imageUrl }}</small>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="类型" width="100">
        <template #default="{ row }">
          {{ row.photoType === 'avatar' ? '头像' : '照片' }}
        </template>
      </el-table-column>
      <el-table-column label="排序" prop="sort" width="90" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
            {{ row.status === 1 ? '展示中' : '已隐藏' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" prop="updateTime" width="170" />
      <el-table-column label="操作" width="210" align="center" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button link :type="row.status === 1 ? 'warning' : 'success'" @click="toggleStatus(row)">
            {{ row.status === 1 ? '隐藏' : '展示' }}
          </el-button>
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

    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑内容' : dialogTitle" width="min(720px, 92vw)" destroy-on-close>
      <el-form :model="form" label-position="top">
        <el-form-item :label="activeType === 'avatar' ? '头像' : '照片'" required>
          <ImageUploader
            v-model="form.imageUrl"
            :biz-type="activeType"
            :max-size-m-b="8"
            :hint="uploadHint"
          />
          <div class="image-url-row">
            <el-input v-model="form.imageUrl" clearable placeholder="图片 URL" />
          </div>
        </el-form-item>
        <el-form-item label="标题">
          <el-input v-model="form.title" maxlength="120" show-word-limit :placeholder="defaultTitle" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            maxlength="500"
            show-word-limit
            placeholder="可选"
          />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="0" :max="9999" controls-position="right" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">展示中</el-radio>
            <el-radio :value="0">隐藏</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="savePhoto">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh } from '@element-plus/icons-vue'
import ImageUploader from '@/components/image/ImageUploader.vue'
import {
  photoAdminPageService,
  photoCreateService,
  photoDeleteService,
  photoUpdateService,
  photoUpdateStatusService,
} from '@/api/photo'

const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const activeType = ref('photo')
const tableData = ref([])
const total = ref(0)

const query = reactive({
  pageNum: 1,
  pageSize: 10,
  status: undefined,
})

const form = reactive({
  id: null,
  title: '',
  description: '',
  imageUrl: '',
  sort: 0,
  status: 1,
})

const defaultTitle = computed(() => (activeType.value === 'avatar' ? '头像' : '照片'))
const dialogTitle = computed(() => (activeType.value === 'avatar' ? '新增头像' : '新增照片'))
const uploadHint = computed(() => (
  activeType.value === 'avatar'
    ? '支持 JPG / PNG / GIF / WebP，建议 1:1'
    : '支持 JPG / PNG / GIF / WebP'
))

async function loadList() {
  loading.value = true
  try {
    const res = await photoAdminPageService({
      ...query,
      photoType: activeType.value,
    })
    const page = res?.data ?? res ?? {}
    tableData.value = page.records ?? page.list ?? []
    total.value = page.total ?? tableData.value.length
  } catch (err) {
    tableData.value = []
    total.value = 0
    ElMessage.error(err?.message || '照片列表加载失败')
  } finally {
    loading.value = false
  }
}

function handleTypeChange() {
  query.pageNum = 1
  loadList()
}

function resetForm() {
  form.id = null
  form.title = ''
  form.description = ''
  form.imageUrl = ''
  form.sort = 0
  form.status = 1
}

function openCreate() {
  resetForm()
  dialogVisible.value = true
}

function openEdit(row) {
  form.id = row.id
  form.title = row.title ?? ''
  form.description = row.description ?? ''
  form.imageUrl = row.imageUrl ?? ''
  form.sort = row.sort ?? 0
  form.status = row.status === 0 ? 0 : 1
  activeType.value = row.photoType === 'avatar' ? 'avatar' : 'photo'
  dialogVisible.value = true
}

async function savePhoto() {
  const imageUrl = form.imageUrl.trim()
  if (!imageUrl) {
    ElMessage.warning('请上传或填写图片地址')
    return
  }

  saving.value = true
  const payload = {
    title: form.title.trim(),
    description: form.description.trim(),
    imageUrl,
    photoType: activeType.value,
    sort: form.sort ?? 0,
    status: form.status,
  }
  try {
    if (form.id) {
      await photoUpdateService(form.id, payload)
    } else {
      await photoCreateService(payload)
    }
    ElMessage.success('保存成功')
    dialogVisible.value = false
    await loadList()
  } catch (err) {
    ElMessage.error(err?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

async function toggleStatus(row) {
  const next = row.status === 1 ? 0 : 1
  try {
    await photoUpdateStatusService(row.id, next)
    row.status = next
    ElMessage.success(next === 1 ? '已展示' : '已隐藏')
  } catch (err) {
    ElMessage.error(err?.message || '状态更新失败')
  }
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm('删除后前台不再展示，是否继续？', '删除内容', { type: 'warning' })
    await photoDeleteService(row.id)
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
.photo-manage {
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
.toolbar,
.image-url-row {
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

.type-tabs {
  flex: 1;
  min-width: 220px;
}

.type-tabs :deep(.el-tabs__header) {
  margin-bottom: 0;
}

.status {
  width: 140px;
}

.preview {
  width: 64px;
  height: 64px;
  border-radius: 6px;
  border: 1px solid var(--blog-card-border);
  background: var(--app-surface-muted);
}

.photo-cell {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.photo-cell span {
  color: var(--app-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.photo-cell small {
  color: var(--app-text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pager {
  display: flex;
  justify-content: flex-end;
}

.image-url-row {
  width: 100%;
  margin-top: 10px;
}

@media (max-width: 720px) {
  .page-head,
  .toolbar,
  .image-url-row {
    align-items: stretch;
    flex-direction: column;
  }

  .type-tabs,
  .status {
    width: 100%;
  }
}
</style>
