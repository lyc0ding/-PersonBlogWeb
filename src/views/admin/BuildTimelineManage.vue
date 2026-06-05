<template>
  <div class="build-timeline-manage">
    <header class="page-head">
      <div>
        <h2>建站时间线</h2>
        <p>维护首页底部展示的站点迭代记录，保存后前台会读取服务端配置。</p>
      </div>
      <div class="actions">
        <el-button :loading="loading" @click="loadTimeline">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
        <el-button @click="resetToDefault">恢复默认</el-button>
        <el-button type="primary" @click="openCreate">
          <el-icon><Plus /></el-icon>
          新增节点
        </el-button>
      </div>
    </header>

    <el-alert
      v-if="error"
      :title="error"
      type="error"
      show-icon
      :closable="false"
    />

    <el-table v-loading="loading" :data="timelineItems" border stripe>
      <el-table-column label="时间" prop="time" width="130" />
      <el-table-column label="标题" prop="title" min-width="180" />
      <el-table-column label="内容" min-width="320">
        <template #default="{ row }">
          <span class="content-text">{{ row.content }}</span>
        </template>
      </el-table-column>
      <el-table-column label="标记" width="120">
        <template #default="{ row }">
          <el-tag v-if="row.badge" size="small" effect="plain">{{ row.badge }}</el-tag>
          <span v-else class="muted">无</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-switch
            v-model="row.visible"
            inline-prompt
            active-text="展示"
            inactive-text="隐藏"
          />
        </template>
      </el-table-column>
      <el-table-column label="排序" width="130" align="center">
        <template #default="{ $index }">
          <el-button-group>
            <el-button size="small" :disabled="$index === 0" @click="moveItem($index, -1)">
              <el-icon><Top /></el-icon>
            </el-button>
            <el-button size="small" :disabled="$index === timelineItems.length - 1" @click="moveItem($index, 1)">
              <el-icon><Bottom /></el-icon>
            </el-button>
          </el-button-group>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="170" align="center" fixed="right">
        <template #default="{ row, $index }">
          <el-button link type="primary" @click="openEdit(row, $index)">编辑</el-button>
          <el-button link type="danger" @click="removeItem($index)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="save-bar">
      <span>共 {{ timelineItems.length }} 个节点，{{ visibleCount }} 个展示中</span>
      <el-button type="primary" :loading="saving" @click="saveTimeline">保存到服务端</el-button>
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="editingIndex >= 0 ? '编辑时间线节点' : '新增时间线节点'"
      width="min(640px, 92vw)"
      destroy-on-close
    >
      <el-form :model="form" label-position="top">
        <el-form-item label="时间" required>
          <el-input v-model="form.time" maxlength="32" placeholder="例如：2026.06" />
        </el-form-item>
        <el-form-item label="标题" required>
          <el-input v-model="form.title" maxlength="80" show-word-limit placeholder="例如：首页体验重构" />
        </el-form-item>
        <el-form-item label="内容" required>
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="4"
            maxlength="300"
            show-word-limit
            placeholder="说明这次建站更新做了什么"
          />
        </el-form-item>
        <el-form-item label="标记">
          <el-input v-model="form.badge" maxlength="32" placeholder="例如：Update，可选" />
        </el-form-item>
        <el-form-item label="前台展示">
          <el-switch v-model="form.visible" active-text="展示" inactive-text="隐藏" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Bottom, Plus, Refresh, Top } from '@element-plus/icons-vue'
import { configListService, configSaveService } from '@/api/admin/system'
import { DEFAULT_BUILD_TIMELINE, useSiteConfigStore } from '@/stores/siteConfigStore'

const CONFIG_KEY = 'home.buildTimeline'
const siteConfigStore = useSiteConfigStore()

const loading = ref(false)
const saving = ref(false)
const error = ref('')
const dialogVisible = ref(false)
const editingIndex = ref(-1)
const configId = ref(null)
const timelineItems = ref([])

const form = reactive({
  time: '',
  title: '',
  content: '',
  badge: '',
  visible: true,
})

const visibleCount = computed(() => timelineItems.value.filter((item) => item.visible !== false).length)

function normalizeTimeline(value) {
  const list = Array.isArray(value) ? value : DEFAULT_BUILD_TIMELINE
  return list
    .filter((item) => item && (item.title || item.time || item.date || item.content))
    .map((item) => ({
      time: String(item.time || item.date || '').trim(),
      title: String(item.title || '').trim(),
      content: String(item.content || item.desc || '').trim(),
      badge: String(item.badge || '').trim(),
      visible: item.visible !== false,
    }))
}

function resetForm() {
  form.time = ''
  form.title = ''
  form.content = ''
  form.badge = ''
  form.visible = true
  editingIndex.value = -1
}

function openCreate() {
  resetForm()
  dialogVisible.value = true
}

function openEdit(row, index) {
  form.time = row.time
  form.title = row.title
  form.content = row.content
  form.badge = row.badge
  form.visible = row.visible !== false
  editingIndex.value = index
  dialogVisible.value = true
}

function submitForm() {
  const item = {
    time: form.time.trim(),
    title: form.title.trim(),
    content: form.content.trim(),
    badge: form.badge.trim(),
    visible: form.visible,
  }

  if (!item.time) {
    ElMessage.warning('请填写时间')
    return
  }
  if (!item.title) {
    ElMessage.warning('请填写标题')
    return
  }
  if (!item.content) {
    ElMessage.warning('请填写内容')
    return
  }

  if (editingIndex.value >= 0) {
    timelineItems.value.splice(editingIndex.value, 1, item)
  } else {
    timelineItems.value.push(item)
  }
  dialogVisible.value = false
}

function moveItem(index, direction) {
  const nextIndex = index + direction
  if (nextIndex < 0 || nextIndex >= timelineItems.value.length) return
  const next = [...timelineItems.value]
  const current = next[index]
  next.splice(index, 1)
  next.splice(nextIndex, 0, current)
  timelineItems.value = next
}

async function removeItem(index) {
  try {
    await ElMessageBox.confirm('删除后保存才会同步到前台，是否继续？', '删除节点', { type: 'warning' })
    timelineItems.value.splice(index, 1)
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error(err?.message || '删除失败')
    }
  }
}

function resetToDefault() {
  timelineItems.value = normalizeTimeline(DEFAULT_BUILD_TIMELINE)
}

async function loadTimeline() {
  loading.value = true
  error.value = ''
  try {
    const res = await configListService('home')
    const list = res?.data ?? res ?? []
    const config = Array.isArray(list) ? list.find((item) => item.configKey === CONFIG_KEY) : null
    configId.value = config?.id ?? null
    const parsed = config?.configValue ? JSON.parse(config.configValue) : DEFAULT_BUILD_TIMELINE
    const next = normalizeTimeline(parsed)
    timelineItems.value = next.length ? next : normalizeTimeline(DEFAULT_BUILD_TIMELINE)
  } catch (err) {
    timelineItems.value = normalizeTimeline(DEFAULT_BUILD_TIMELINE)
    error.value = err?.message || '建站时间线加载失败，请确认后端 `/system/config/list` 可访问。'
  } finally {
    loading.value = false
  }
}

async function saveTimeline() {
  const invalid = timelineItems.value.find((item) => !item.time || !item.title || !item.content)
  if (invalid) {
    ElMessage.warning('存在未填写完整的节点，请先编辑补齐')
    return
  }

  saving.value = true
  try {
    await configSaveService({
      id: configId.value,
      configKey: CONFIG_KEY,
      configValue: JSON.stringify(timelineItems.value, null, 2),
      configName: '建站时间线',
      configGroup: 'home',
      valueType: 'json',
      sort: 12,
      remark: '首页底部建站时间线 JSON 数组',
    })
    await siteConfigStore.loadConfigs(true)
    ElMessage.success('建站时间线已保存')
    await loadTimeline()
  } catch (err) {
    ElMessage.error(err?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(loadTimeline)
</script>

<style scoped>
.build-timeline-manage {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-head,
.save-bar {
  padding: 16px;
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: 8px;
}

.page-head,
.actions,
.save-bar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-head,
.save-bar {
  justify-content: space-between;
}

.page-head h2,
.page-head p {
  margin: 0;
}

.page-head p,
.muted,
.save-bar span {
  color: var(--app-text-muted);
}

.page-head p {
  margin-top: 4px;
}

.content-text {
  display: -webkit-box;
  overflow: hidden;
  color: var(--app-text-secondary);
  line-height: 1.55;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

@media (max-width: 760px) {
  .page-head,
  .actions,
  .save-bar {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
