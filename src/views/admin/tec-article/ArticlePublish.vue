<template>
  <div v-loading="loading" class="article-editor-page">
    <div class="page-header">
      <div>
        <h2>{{ isEditMode ? '编辑文章' : '新建文章' }}</h2>
        <p class="sub">块式编辑器 · 支持段落 / 图片 / 代码 · 联调 Spring Boot 后自动走接口</p>
      </div>
      <el-segmented v-model="viewMode" :options="viewOptions" />
    </div>

    <div class="editor-layout">
      <section class="editor-main">
        <el-tabs v-model="activeTab" class="editor-tabs">
          <el-tab-pane label="正文编辑" name="edit">
            <ArticleBlockEditor v-model="form.contentBlocks" />
          </el-tab-pane>
          <el-tab-pane label="实时预览" name="preview">
            <ArticlePreview :form="form" />
          </el-tab-pane>
        </el-tabs>
      </section>

      <aside class="editor-side">
        <ArticleMetaPanel
          :form="form"
          :saving="saving"
          :word-count="wordCount"
          :last-saved-at="lastSavedAt"
          @save-draft="saveDraft"
          @publish="publish"
        />
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useArticleEditor } from '@/composables/useArticleEditor'
import ArticleBlockEditor from './components/ArticleBlockEditor.vue'
import ArticleMetaPanel from './components/ArticleMetaPanel.vue'
import ArticlePreview from './components/ArticlePreview.vue'

const route = useRoute()
const router = useRouter()

const articleId = computed(() => {
  const raw = route.params.id
  if (!raw || raw === 'add') return null
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
})

const activeTab = ref('edit')
const viewMode = ref('split')

const viewOptions = [
  { label: '分栏', value: 'split' },
  { label: '专注', value: 'focus' },
]

const { loading, saving, form, lastSavedAt, isEditMode, wordCount, saveDraft, publish } =
  useArticleEditor(() => articleId.value, {
    onSaved: (saved) => {
      if (!route.params.id && saved.id) {
        router.replace({ name: 'TecArticleEdit', params: { id: saved.id } })
      }
    },
  })
</script>

<style scoped>
.article-editor-page {
  min-height: calc(100vh - 180px);
}

.page-header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.page-header h2 {
  margin: 0 0 4px;
  font-size: 20px;
  color: var(--app-text-primary);
}

.sub {
  margin: 0;
  font-size: 13px;
  color: var(--app-text-muted);
}

.editor-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 16px;
  align-items: start;
}

.editor-main {
  min-width: 0;
}

.editor-side {
  position: sticky;
  top: 48px;
  max-height: calc(100vh - 140px);
}

.editor-tabs :deep(.el-tabs__content) {
  padding-top: 8px;
}

@media (max-width: 1100px) {
  .editor-layout {
    grid-template-columns: 1fr;
  }

  .editor-side {
    position: static;
    max-height: none;
  }
}
</style>
