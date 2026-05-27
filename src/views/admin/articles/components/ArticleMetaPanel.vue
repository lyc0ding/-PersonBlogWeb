<template>
  <aside class="meta-panel">
    <el-scrollbar>
      <el-form :model="form" label-position="top">
        <el-form-item label="文章标题" required>
          <el-input v-model="form.title" maxlength="120" show-word-limit placeholder="请输入文章标题" />
        </el-form-item>

        <el-form-item label="文章类型">
          <el-segmented v-model="form.type" :options="typeOptions" />
        </el-form-item>

        <el-form-item label="文章标签">
          <el-select
            v-model="form.tagIds"
            multiple
            filterable
            collapse-tags
            collapse-tags-tooltip
            placeholder="选择标签"
            :loading="tagLoading"
            class="full-width"
          >
            <el-option v-for="tag in tagOptions" :key="tag.id" :label="tag.name" :value="tag.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="封面图">
          <ImageUploader
            v-model="form.coverUrl"
            biz-type="cover"
            :max-size-m-b="5"
            hint="建议 16:9；后端接口未就绪时会使用本地预览"
          />
        </el-form-item>

        <el-form-item label="摘要">
          <el-input
            v-model="form.summary"
            type="textarea"
            :rows="4"
            maxlength="300"
            show-word-limit
            placeholder="列表页展示的摘要；留空时后端可从 contentText 截取"
          />
        </el-form-item>

        <el-form-item label="可见范围">
          <el-radio-group v-model="form.visibility">
            <el-radio v-for="option in visibilityOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="缓存与入库建议">
          <div class="cache-note">
            <span>MySQL: `content_html` + `content_blocks` JSON</span>
            <span>Redis: 文章详情缓存 key 可使用 `article:{id}`</span>
          </div>
        </el-form-item>

        <el-form-item label="统计">
          <div class="stats">
            <span>字数约 {{ wordCount }}</span>
            <span v-if="lastSavedAt">本地草稿 {{ formatTime(lastSavedAt) }}</span>
          </div>
        </el-form-item>
      </el-form>

      <div class="actions">
        <el-button :loading="saving" @click="$emit('save-draft')">存草稿</el-button>
        <el-button type="primary" :loading="saving" @click="$emit('publish')">发布文章</el-button>
      </div>
    </el-scrollbar>
  </aside>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import {
  ARTICLE_TYPE,
  ARTICLE_VISIBILITY_LABEL,
} from '@/constants/article'
import { tagListService } from '@/api/admin/tag'
import ImageUploader from '@/components/image/ImageUploader.vue'

defineProps({
  form: { type: Object, required: true },
  saving: { type: Boolean, default: false },
  wordCount: { type: Number, default: 0 },
  lastSavedAt: { type: String, default: '' },
})

defineEmits(['save-draft', 'publish'])

const tagLoading = ref(false)
const tagOptions = ref([])

const typeOptions = [
  { label: '文章', value: ARTICLE_TYPE.ARTICLE },
  { label: '朋友圈', value: ARTICLE_TYPE.SHUOSHUO },
]

const visibilityOptions = computed(() =>
  Object.entries(ARTICLE_VISIBILITY_LABEL).map(([value, label]) => ({
    value: Number(value),
    label,
  }))
)

function formatTime(iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleString('zh-CN', { hour12: false })
  } catch {
    return iso
  }
}

function flattenTags(list, acc = []) {
  list.forEach((item) => {
    acc.push({ id: item.id, name: item.name })
    if (Array.isArray(item.children) && item.children.length) flattenTags(item.children, acc)
  })
  return acc
}

async function loadTags() {
  tagLoading.value = true
  try {
    const res = await tagListService()
    const list = res?.data ?? res ?? []
    tagOptions.value = flattenTags(Array.isArray(list) ? list : [])
  } catch {
    tagOptions.value = [
      { id: 1, name: 'Java' },
      { id: 2, name: 'Spring Boot' },
      { id: 3, name: 'MySQL' },
      { id: 4, name: '生活' },
    ]
  } finally {
    tagLoading.value = false
  }
}

onMounted(loadTags)
</script>

<style scoped>
.meta-panel {
  height: 100%;
  padding: 16px;
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: 8px;
}

.full-width {
  width: 100%;
}

.cache-note,
.stats {
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: var(--app-text-muted);
  font-size: 12px;
  line-height: 1.6;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 12px;
  margin-top: 6px;
  border-top: 1px solid var(--app-divider-subtle);
}
</style>
