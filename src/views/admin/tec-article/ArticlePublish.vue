<template>
  <div v-loading="loading" class="article-publish">
    <header class="page-header">
      <div>
        <h2>{{ isEditMode ? '编辑文章' : '新建文章' }}</h2>
        <p>富文本博客编辑器，支持表情、图片、代码块、重点高亮、下划线和删除线。</p>
      </div>
      <el-segmented v-model="activeTab" :options="tabOptions" />
    </header>

    <div class="editor-layout">
      <section class="editor-main">
        <RichBlogEditor
          v-show="activeTab === 'edit'"
          v-model="form.contentHtml"
          @text-change="form.contentText = $event"
          @blocks-change="form.contentBlocks = $event"
        />
        <ArticlePreview v-show="activeTab === 'preview'" :form="form" />
      </section>

      <ArticleMetaPanel
        class="editor-side"
        :form="form"
        :saving="saving"
        :word-count="wordCount"
        :last-saved-at="lastSavedAt"
        @save-draft="saveDraft"
        @publish="publish"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useArticleEditor } from '@/composables/useArticleEditor'
import ArticleMetaPanel from './components/ArticleMetaPanel.vue'
import ArticlePreview from './components/ArticlePreview.vue'
import RichBlogEditor from './components/RichBlogEditor.vue'

const route = useRoute()
const router = useRouter()
const activeTab = ref('edit')

const tabOptions = [
  { label: '编辑', value: 'edit' },
  { label: '预览', value: 'preview' },
]

const articleId = computed(() => {
  const raw = route.params.id
  if (!raw) return null
  const id = Number(raw)
  return Number.isFinite(id) ? id : raw
})

const {
  loading,
  saving,
  form,
  lastSavedAt,
  isEditMode,
  wordCount,
  saveDraft,
  publish,
} = useArticleEditor(() => articleId.value, {
  onSaved: (saved) => {
    if (!route.params.id && saved.id) {
      router.replace({ name: 'TecArticleEdit', params: { id: saved.id } })
    }
  },
})
</script>

<style scoped>
.article-publish {
  min-height: calc(100vh - 130px);
}

.page-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 16px;
}

.page-header h2 {
  margin: 0 0 4px;
  color: var(--app-text-primary);
  font-size: 22px;
}

.page-header p {
  margin: 0;
  color: var(--app-text-muted);
  font-size: 13px;
}

.editor-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 16px;
  align-items: start;
}

.editor-main {
  min-width: 0;
}

.editor-side {
  position: sticky;
  top: 16px;
  max-height: calc(100vh - 120px);
}

@media (max-width: 1120px) {
  .editor-layout {
    grid-template-columns: 1fr;
  }

  .editor-side {
    position: static;
    max-height: none;
  }
}
</style>
