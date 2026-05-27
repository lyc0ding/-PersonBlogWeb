<template>
  <article class="article-preview">
    <header class="preview-header">
      <p class="preview-type">{{ form.type === ARTICLE_TYPE.SHUOSHUO ? '朋友圈' : '文章' }}</p>
      <h1>{{ form.title || '未命名文章' }}</h1>
      <p v-if="form.summary" class="summary">{{ form.summary }}</p>
    </header>

    <img v-if="form.coverUrl" :src="form.coverUrl" alt="文章封面" class="cover">

    <section v-if="form.contentHtml" class="preview-body" v-html="form.contentHtml" />
    <el-empty v-else description="还没有正文内容" />
  </article>
</template>

<script setup>
import { ARTICLE_TYPE } from '@/constants/article'

defineProps({
  form: { type: Object, required: true },
})
</script>

<style scoped>
.article-preview {
  min-height: 560px;
  padding: 26px;
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: 8px;
}

.preview-header {
  margin-bottom: 18px;
  border-bottom: 1px solid var(--app-divider-subtle);
}

.preview-type {
  margin: 0 0 6px;
  color: var(--app-text-muted);
  font-size: 12px;
  letter-spacing: 0.08em;
}

.preview-header h1 {
  margin: 0 0 10px;
  color: var(--app-text-primary);
  font-size: 28px;
  line-height: 1.35;
}

.summary {
  margin: 0 0 18px;
  color: var(--app-text-secondary);
}

.cover {
  width: 100%;
  max-height: 340px;
  object-fit: cover;
  border-radius: 6px;
  margin-bottom: 20px;
}

.preview-body {
  color: var(--app-text-secondary);
  font-size: 16px;
  line-height: 1.85;
}

.preview-body :deep(p) {
  margin: 0 0 1em;
}

.preview-body :deep(h2),
.preview-body :deep(h3),
.preview-body :deep(h4) {
  margin: 1.4em 0 0.7em;
  color: var(--app-text-primary);
  line-height: 1.45;
}

.preview-body :deep(blockquote) {
  margin: 1em 0;
  padding: 10px 14px;
  border-left: 4px solid var(--blog-link);
  background: var(--app-surface-muted);
}

.preview-body :deep(figure.article-image) {
  margin: 18px 0;
}

.preview-body :deep(figure.article-image img) {
  max-width: 100%;
  border-radius: 6px;
}

.preview-body :deep(figcaption),
.preview-body :deep(.code-caption) {
  margin-top: 8px;
  color: var(--app-text-muted);
  font-size: 13px;
  text-align: center;
}

.preview-body :deep(pre.article-code) {
  margin: 16px 0 6px;
  padding: 14px;
  border-radius: 6px;
  overflow: auto;
  background: #282c34;
  color: #f8fafc;
  font-family: Consolas, "Courier New", monospace;
  font-size: 13px;
  line-height: 1.6;
}
</style>
