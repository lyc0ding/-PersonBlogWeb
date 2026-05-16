<template>
  <div class="meta-panel">
    <el-scrollbar>
      <el-form :model="form" label-position="top" size="default">
        <el-form-item label="文章标题" required>
          <el-input v-model="form.title" placeholder="请输入标题" maxlength="120" show-word-limit />
        </el-form-item>

        <el-form-item label="文章类型">
          <el-radio-group v-model="form.type">
            <el-radio :value="ARTICLE_TYPE.ARTICLE">文章</el-radio>
            <el-radio :value="ARTICLE_TYPE.SHUOSHUO">说说</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="文章标签">
          <el-select
            v-model="form.tagIds"
            multiple
            filterable
            collapse-tags
            collapse-tags-tooltip
            placeholder="选择标签"
            style="width: 100%"
            :loading="tagLoading"
          >
            <el-option
              v-for="tag in tagOptions"
              :key="tag.id"
              :label="tag.name"
              :value="tag.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="封面图">
          <ImageUploader
            v-model="form.coverUrl"
            biz-type="cover"
            hint="建议 16:9，最大 5MB；留空则使用正文首图"
          />
        </el-form-item>

        <el-form-item label="摘要">
          <el-input
            v-model="form.summary"
            type="textarea"
            :rows="4"
            maxlength="300"
            show-word-limit
            placeholder="列表页展示的简短介绍"
          />
        </el-form-item>

        <el-form-item label="可见范围">
          <el-radio-group v-model="form.visibility">
            <el-radio
              v-for="(label, key) in ARTICLE_VISIBILITY_LABEL"
              :key="key"
              :value="Number(key)"
            >
              {{ label }}
            </el-radio>
          </el-radio-group>
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  ARTICLE_TYPE,
  ARTICLE_VISIBILITY_LABEL,
} from '@/constants/article'
import { tagListService } from '@/api/admin/tag'
import ImageUploader from '@/components/Image/ImageUploader.vue'

defineProps({
  form: { type: Object, required: true },
  saving: { type: Boolean, default: false },
  wordCount: { type: Number, default: 0 },
  lastSavedAt: { type: String, default: '' },
})

defineEmits(['save-draft', 'publish'])

const tagLoading = ref(false)
const tagOptions = ref([])

function formatTime(iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleString('zh-CN', { hour12: false })
  } catch {
    return iso
  }
}

async function loadTags() {
  tagLoading.value = true
  try {
    const res = await tagListService()
    const list = res?.data ?? res ?? []
    tagOptions.value = flattenTags(Array.isArray(list) ? list : [])
  } catch {
    tagOptions.value = [
      { id: 1, name: '建站' },
      { id: 2, name: '生活' },
      { id: 3, name: '嵌入式' },
      { id: 4, name: '项目' },
    ]
  } finally {
    tagLoading.value = false
  }
}

function flattenTags(list, acc = []) {
  list.forEach((item) => {
    acc.push({ id: item.id, name: item.name })
    if (item.children?.length) flattenTags(item.children, acc)
  })
  return acc
}

onMounted(loadTags)
</script>

<style scoped>
.meta-panel {
  height: 100%;
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: 8px;
  padding: 16px;
}

.stats {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
  color: var(--app-text-muted);
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 8px;
  margin-top: 8px;
  border-top: 1px solid var(--app-divider-subtle);
}
</style>
