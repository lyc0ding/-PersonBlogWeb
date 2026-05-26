<template>
  <div class="timeline-manage">
    <header class="page-head">
      <div>
        <h2>朋友圈管理</h2>
        <p>发布动态、维护图片和控制前台展示状态</p>
      </div>
      <el-button type="primary" @click="openCreate">
        <el-icon><Plus /></el-icon>
        新建动态
      </el-button>
    </header>

    <div class="toolbar">
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
      <el-table-column label="内容" min-width="300">
        <template #default="{ row }">
          <div class="timeline-cell">
            <strong>{{ row.title || '无标题动态' }}</strong>
            <span>{{ row.content }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="图片" width="210">
        <template #default="{ row }">
          <div v-if="row.images?.length" class="thumb-list">
            <el-image
              v-for="src in row.images.slice(0, 3)"
              :key="src"
              :src="src"
              :preview-src-list="row.images"
              fit="cover"
              class="thumb"
              preview-teleported
            />
            <span v-if="row.images.length > 3" class="more-count">+{{ row.images.length - 3 }}</span>
          </div>
          <span v-else class="muted">无图片</span>
        </template>
      </el-table-column>
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

    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑动态' : '新建动态'" width="min(720px, 92vw)" destroy-on-close>
      <el-form :model="form" label-position="top">
        <el-form-item label="标题">
          <el-input v-model="form.title" maxlength="120" show-word-limit placeholder="可选" />
        </el-form-item>
        <el-form-item label="内容" required>
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="5"
            maxlength="1000"
            show-word-limit
            placeholder="写点近期动态"
          />
        </el-form-item>
        <el-form-item label="图片">
          <ImageUploader
            v-model="imageDraft"
            biz-type="timeline"
            :max-size-m-b="8"
            hint="上传后点击添加，可连续添加多张"
            @uploaded="appendUploadedImage"
          />
          <div class="image-url-row">
            <el-input v-model="imageDraft" clearable placeholder="图片 URL" @keyup.enter="addImage" />
            <el-button @click="addImage">
              <el-icon><CirclePlus /></el-icon>
              添加
            </el-button>
          </div>
          <div v-if="form.images.length" class="image-list">
            <div v-for="(src, index) in form.images" :key="`${src}_${index}`" class="image-item">
              <img :src="src" alt="">
              <el-button circle size="small" type="danger" @click="removeImage(index)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
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
        <el-button type="primary" :loading="saving" @click="saveTimeline">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { CirclePlus, Delete, Plus, Refresh } from '@element-plus/icons-vue'
import ImageUploader from '@/components/image/ImageUploader.vue'
import {
  timelineAdminPageService,
  timelineCreateService,
  timelineDeleteService,
  timelineUpdateService,
  timelineUpdateStatusService,
} from '@/api/timeline'

const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const tableData = ref([])
const total = ref(0)
const imageDraft = ref('')

const query = reactive({
  pageNum: 1,
  pageSize: 10,
  status: undefined,
})

const form = reactive({
  id: null,
  title: '',
  content: '',
  images: [],
  status: 1,
})

async function loadList() {
  loading.value = true
  try {
    const res = await timelineAdminPageService({ ...query })
    const page = res?.data ?? res ?? {}
    tableData.value = page.records ?? page.list ?? []
    total.value = page.total ?? tableData.value.length
  } catch (err) {
    tableData.value = []
    total.value = 0
    ElMessage.error(err?.message || '朋友圈列表加载失败')
  } finally {
    loading.value = false
  }
}

function resetForm() {
  form.id = null
  form.title = ''
  form.content = ''
  form.images = []
  form.status = 1
  imageDraft.value = ''
}

function openCreate() {
  resetForm()
  dialogVisible.value = true
}

function openEdit(row) {
  form.id = row.id
  form.title = row.title ?? ''
  form.content = row.content ?? ''
  form.images = Array.isArray(row.images) ? [...row.images] : []
  form.status = row.status === 0 ? 0 : 1
  imageDraft.value = ''
  dialogVisible.value = true
}

function appendUploadedImage({ url }) {
  if (url && !form.images.includes(url)) {
    form.images.push(url)
  }
}

function addImage() {
  const url = imageDraft.value.trim()
  if (!url) return
  if (!form.images.includes(url)) {
    form.images.push(url)
  }
  imageDraft.value = ''
}

function removeImage(index) {
  form.images.splice(index, 1)
}

async function saveTimeline() {
  if (!form.content.trim()) {
    ElMessage.warning('请填写动态内容')
    return
  }
  saving.value = true
  const payload = {
    title: form.title.trim(),
    content: form.content.trim(),
    images: form.images,
    status: form.status,
  }
  try {
    if (form.id) {
      await timelineUpdateService(form.id, payload)
    } else {
      await timelineCreateService(payload)
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
    await timelineUpdateStatusService(row.id, next)
    row.status = next
    ElMessage.success(next === 1 ? '已展示' : '已隐藏')
  } catch (err) {
    ElMessage.error(err?.message || '状态更新失败')
  }
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm('删除后前台不再展示，是否继续？', '删除动态', { type: 'warning' })
    await timelineDeleteService(row.id)
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
.timeline-manage {
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

.status {
  width: 140px;
}

.timeline-cell {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.timeline-cell span {
  color: var(--app-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.thumb-list {
  display: flex;
  align-items: center;
  gap: 6px;
}

.thumb {
  width: 46px;
  height: 46px;
  border-radius: 6px;
  border: 1px solid var(--blog-card-border);
}

.more-count,
.muted {
  color: var(--app-text-muted);
  font-size: 13px;
}

.pager {
  display: flex;
  justify-content: flex-end;
}

.image-url-row {
  width: 100%;
  margin-top: 10px;
}

.image-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
  gap: 10px;
  width: 100%;
  margin-top: 12px;
}

.image-item {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  border: 1px solid var(--blog-card-border);
  border-radius: 6px;
  background: var(--app-surface-muted);
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.image-item .el-button {
  position: absolute;
  top: 6px;
  right: 6px;
}

@media (max-width: 720px) {
  .page-head,
  .toolbar,
  .image-url-row {
    align-items: stretch;
    flex-direction: column;
  }

  .status {
    width: 100%;
  }
}
</style>
