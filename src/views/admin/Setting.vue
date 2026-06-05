<template>
  <div class="setting-page">
    <header class="page-head">
      <div>
        <h2>系统设置</h2>
        <p>维护站点、首页、Live 页面、上传与评论配置，前台会实时读取这些内容。</p>
      </div>
      <div class="actions">
        <el-select v-model="group" clearable placeholder="全部分组" class="group-select" @change="loadConfigs">
          <el-option
            v-for="item in groupOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <el-button :loading="loading" @click="loadConfigs">刷新</el-button>
        <el-button @click="addConfig">新增配置</el-button>
        <el-button type="primary" :loading="saving" :disabled="!configs.length" @click="saveConfigs">
          保存
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

    <el-table v-loading="loading" :data="configs" border>
      <el-table-column prop="configName" label="名称" min-width="150">
        <template #default="{ row }">
          <el-input v-model="row.configName" maxlength="128" />
        </template>
      </el-table-column>

      <el-table-column prop="configKey" label="键" min-width="210">
        <template #default="{ row }">
          <el-input v-model="row.configKey" maxlength="128" />
        </template>
      </el-table-column>

      <el-table-column prop="configValue" label="值" min-width="340">
        <template #default="{ row }">
          <el-switch
            v-if="row.valueType === 'boolean'"
            v-model="row.configValue"
            active-value="true"
            inactive-value="false"
          />

          <el-input-number
            v-else-if="row.valueType === 'number'"
            :model-value="toNumber(row.configValue)"
            :controls="false"
            class="number-editor"
            @update:model-value="(value) => setNumberValue(row, value)"
          />

          <div v-else-if="row.valueType === 'image'" class="image-editor">
            <ImageUploader
              v-model="row.configValue"
              :biz-type="resolveImageBizType(row)"
              :max-size-m-b="8"
              hint="沿用照片管理上传逻辑，头像走 avatar，其余图片走 photo"
            />
            <el-input v-model="row.configValue" maxlength="500" placeholder="/img/bac2.jpg 或上传后的地址" />
          </div>

          <div v-else-if="isLongText(row)" class="long-editor">
            <el-input
              v-model="row.configValue"
              type="textarea"
              :autosize="{ minRows: row.valueType === 'json' ? 4 : 3, maxRows: 10 }"
              :placeholder="row.valueType === 'json' ? '请输入合法 JSON' : '请输入配置内容'"
            />
            <el-button v-if="row.valueType === 'json'" size="small" @click="formatJson(row)">格式化 JSON</el-button>
          </div>

          <el-input v-else v-model="row.configValue" maxlength="1000" />
        </template>
      </el-table-column>

      <el-table-column prop="configGroup" label="分组" width="130">
        <template #default="{ row }">
          <el-select v-model="row.configGroup">
            <el-option
              v-for="item in groupOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </template>
      </el-table-column>

      <el-table-column prop="valueType" label="类型" width="130">
        <template #default="{ row }">
          <el-select v-model="row.valueType">
            <el-option label="字符串" value="string" />
            <el-option label="长文本" value="textarea" />
            <el-option label="JSON" value="json" />
            <el-option label="HTML" value="html" />
            <el-option label="图片" value="image" />
            <el-option label="数字" value="number" />
            <el-option label="布尔" value="boolean" />
          </el-select>
        </template>
      </el-table-column>

      <el-table-column prop="sort" label="排序" width="100">
        <template #default="{ row }">
          <el-input-number
            v-model="row.sort"
            :controls="false"
            class="sort-editor"
          />
        </template>
      </el-table-column>

      <el-table-column prop="remark" label="备注" min-width="220">
        <template #default="{ row }">
          <el-input v-model="row.remark" maxlength="255" />
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { configBatchSaveService, configListService } from '@/api/admin/system'
import ImageUploader from '@/components/image/ImageUploader.vue'
import { DEFAULT_SITE_CONFIG, useSiteConfigStore } from '@/stores/siteConfigStore'

const loading = ref(false)
const saving = ref(false)
const error = ref('')
const group = ref('site')
const configs = ref([])
const siteConfigStore = useSiteConfigStore()

const groupOptions = [
  { label: '站点', value: 'site' },
  { label: '首页', value: 'home' },
  { label: 'Live', value: 'live' },
  { label: '上传', value: 'upload' },
  { label: '评论', value: 'comment' },
]

const configMeta = {
  'site.title': { configName: '站点标题', configGroup: 'site', valueType: 'string', sort: 1, remark: '浏览器标题和站点名称' },
  'site.owner': { configName: '站点作者', configGroup: 'site', valueType: 'string', sort: 2, remark: '首页和侧栏展示' },
  'site.description': { configName: '站点描述', configGroup: 'site', valueType: 'string', sort: 3, remark: 'SEO和首页简介' },
  'site.tagline': { configName: '站点标语', configGroup: 'site', valueType: 'string', sort: 4, remark: '顶部导航品牌副标题' },
  'site.avatarUrl': { configName: '默认头像', configGroup: 'site', valueType: 'image', sort: 5, remark: '首页、侧栏和 live 页默认头像' },
  'site.roleTitle': { configName: '身份标题', configGroup: 'site', valueType: 'string', sort: 6, remark: '首页和侧栏展示身份' },
  'site.buildYear': { configName: '建站年份', configGroup: 'site', valueType: 'string', sort: 7, remark: '首页和侧栏统计展示' },
  'site.profileBio': { configName: '个人简介', configGroup: 'site', valueType: 'textarea', sort: 8, remark: '首页侧栏和文章侧栏展示' },
  'site.profileStatus': { configName: '当前状态', configGroup: 'site', valueType: 'string', sort: 9, remark: '侧栏资料卡状态文案' },
  'site.profileTags': { configName: '关注方向', configGroup: 'site', valueType: 'json', sort: 10, remark: '侧栏标签 JSON 数组' },
  'site.profileLinks': { configName: '资料卡链接', configGroup: 'site', valueType: 'json', sort: 11, remark: '侧栏资料卡快捷入口 JSON 数组' },
  'site.navItems': { configName: '前台导航', configGroup: 'site', valueType: 'json', sort: 12, remark: '顶部导航 JSON 数组，可控制 label/path/visible' },
  'home.heroEyebrow': { configName: '首页 Hero 小标题', configGroup: 'home', valueType: 'string', sort: 1, remark: '首页首屏左上小标题' },
  'home.heroTitle': { configName: '首页 Hero 标题', configGroup: 'home', valueType: 'string', sort: 2, remark: '首页首屏主标题' },
  'home.heroSubtitle': { configName: '首页 Hero 副标题', configGroup: 'home', valueType: 'textarea', sort: 3, remark: '首页首屏说明文案' },
  'home.heroCoverUrl': { configName: '首页 Hero 背景', configGroup: 'home', valueType: 'image', sort: 4, remark: '首页首屏背景图地址' },
  'home.heroTags': { configName: '首页 Hero 标签', configGroup: 'home', valueType: 'json', sort: 5, remark: '首页首屏标签 JSON 数组' },
  'home.heroPrimaryText': { configName: '首页主按钮文案', configGroup: 'home', valueType: 'string', sort: 6, remark: '首页 Hero 主按钮文字' },
  'home.heroPrimaryPath': { configName: '首页主按钮链接', configGroup: 'home', valueType: 'string', sort: 7, remark: '首页 Hero 主按钮路由' },
  'home.heroSecondaryText': { configName: '首页次按钮文案', configGroup: 'home', valueType: 'string', sort: 8, remark: '首页 Hero 次按钮文字' },
  'home.heroSecondaryPath': { configName: '首页次按钮链接', configGroup: 'home', valueType: 'string', sort: 9, remark: '首页 Hero 次按钮路由' },
  'home.nowItems': { configName: '此刻在做', configGroup: 'home', valueType: 'json', sort: 10, remark: '首页 NOW 列表 JSON 数组' },
  'home.quickLinks': { configName: '首页快捷入口', configGroup: 'home', valueType: 'json', sort: 11, remark: '首页底部快捷入口 JSON 数组' },
  'home.buildTimeline': { configName: '建站时间线', configGroup: 'home', valueType: 'json', sort: 12, remark: '首页底部建站时间线 JSON 数组' },
  'live.title': { configName: 'Live 页面标题', configGroup: 'live', valueType: 'string', sort: 1, remark: 'live 页面标题' },
  'live.subtitle': { configName: 'Live 页面副标题', configGroup: 'live', valueType: 'string', sort: 2, remark: 'live 页面副标题' },
  'live.contentHtml': { configName: 'Live 页面正文', configGroup: 'live', valueType: 'html', sort: 3, remark: 'live 页面富文本内容' },
  'live.images': { configName: 'Live 轮播图片', configGroup: 'live', valueType: 'json', sort: 4, remark: 'live 页面轮播图片 JSON 数组' },
}

function normalizeConfig(item = {}) {
  const meta = configMeta[item.configKey] || {}
  return {
    id: item.id ?? null,
    configKey: item.configKey || '',
    configValue: item.configValue ?? '',
    configName: item.configName || meta.configName || '',
    configGroup: item.configGroup || meta.configGroup || group.value || 'site',
    valueType: item.valueType || meta.valueType || 'string',
    sort: Number(item.sort ?? meta.sort ?? 0),
    remark: item.remark || meta.remark || '',
    updateTime: item.updateTime || '',
  }
}

function mergeDefaultConfigs(list) {
  const rows = Array.isArray(list) ? list.map(normalizeConfig) : []
  const existingKeys = new Set(rows.map((row) => row.configKey))
  Object.entries(DEFAULT_SITE_CONFIG).forEach(([configKey, configValue]) => {
    const meta = configMeta[configKey] || { configGroup: 'site', valueType: 'string', sort: 0 }
    if (group.value && meta.configGroup !== group.value) return
    if (!existingKeys.has(configKey)) {
      rows.push(normalizeConfig({ configKey, configValue, ...meta }))
    }
  })
  return rows.sort((a, b) => {
    if (a.configGroup !== b.configGroup) return a.configGroup.localeCompare(b.configGroup)
    return Number(a.sort || 0) - Number(b.sort || 0)
  })
}

function isLongText(row) {
  return ['textarea', 'json', 'html'].includes(row.valueType)
}

function toNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

function setNumberValue(row, value) {
  row.configValue = value == null ? '' : String(value)
}

function resolveImageBizType(row) {
  return row.configKey.toLowerCase().includes('avatar') ? 'avatar' : 'photo'
}

function validateConfigs() {
  const errors = []
  configs.value.forEach((row) => {
    if (!row.configKey.trim()) {
      errors.push('存在空配置键')
    }
    if (row.valueType === 'json' && row.configValue.trim()) {
      try {
        JSON.parse(row.configValue)
      } catch {
        errors.push(`${row.configName || row.configKey} 的 JSON 格式不正确`)
      }
    }
  })
  return errors
}

function formatJson(row) {
  try {
    const parsed = JSON.parse(row.configValue || '[]')
    row.configValue = JSON.stringify(parsed, null, 2)
  } catch {
    ElMessage.warning('JSON 格式不正确，无法格式化')
  }
}

async function loadConfigs() {
  loading.value = true
  error.value = ''
  try {
    const res = await configListService(group.value)
    const list = res?.data ?? res ?? []
    configs.value = mergeDefaultConfigs(list)
  } catch (err) {
    configs.value = []
    error.value = err?.message || '配置列表加载失败，请确认后端 `/system/config/list` 可访问。'
  } finally {
    loading.value = false
  }
}

function addConfig() {
  configs.value.push(normalizeConfig({
    configGroup: group.value || 'site',
    valueType: 'string',
    sort: configs.value.length + 1,
  }))
}

async function saveConfigs() {
  const errors = validateConfigs()
  if (errors.length) {
    ElMessage.warning(errors[0])
    return
  }

  saving.value = true
  try {
    const payload = configs.value.map((row) => ({
      ...row,
      configKey: row.configKey.trim(),
      configName: row.configName.trim(),
      configGroup: row.configGroup.trim(),
      valueType: row.valueType.trim(),
      remark: row.remark.trim(),
      sort: Number(row.sort || 0),
    }))
    const res = await configBatchSaveService(payload)
    const list = res?.data ?? res ?? []
    configs.value = Array.isArray(list) ? mergeDefaultConfigs(list) : configs.value
    await siteConfigStore.loadConfigs(true)
    ElMessage.success('配置已保存')
  } catch (err) {
    ElMessage.error(err?.message || '保存配置失败')
  } finally {
    saving.value = false
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

.number-editor,
.sort-editor {
  width: 100%;
}

.image-editor,
.long-editor {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.image-editor,
.long-editor {
  flex-direction: column;
}

@media (max-width: 760px) {
  .page-head,
  .actions {
    align-items: stretch;
    flex-direction: column;
  }

  .group-select {
    width: 100%;
  }
}
</style>
