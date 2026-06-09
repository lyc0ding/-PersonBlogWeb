<template>
  <article class="article-preview">
    <header class="preview-header">
      <p class="preview-type">{{ form.type === ARTICLE_TYPE.SHUOSHUO ? '朋友圈' : '文章' }}</p>
      <h1>{{ form.title || '未命名文章' }}</h1>
      <p v-if="form.summary" class="summary">{{ form.summary }}</p>
    </header>

    <img v-if="form.coverUrl" :src="form.coverUrl" alt="文章封面" class="cover">

    <section v-if="renderedContentHtml" class="preview-body" v-html="renderedContentHtml" />
    <el-empty v-else description="还没有正文内容" />
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { ARTICLE_TYPE } from '@/constants/article'
import { blocksToHtml, normalizeArticleHtml, textToHtml } from '@/utils/articleContent'

const props = defineProps({
  form: { type: Object, required: true },
})

const renderedContentHtml = computed(() => {
  return normalizeArticleHtml(props.form.contentHtml) ||
    blocksToHtml(props.form.contentBlocks) ||
    textToHtml(props.form.contentText)
})
</script>

<style scoped>
.article-preview {
  min-height: 560px;
  padding: 28px clamp(18px, 4vw, 42px);
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: 8px;
  box-shadow: var(--app-shadow-card, 0 10px 28px rgba(15, 23, 42, 0.05));
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
  word-break: break-word;
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
  margin: 1.2em 0;
  padding: 12px 16px;
  border-left: 4px solid var(--blog-link);
  border-radius: 0 6px 6px 0;
  background: var(--app-surface-muted);
}

.preview-body :deep(figure.article-image) {
  margin: 22px 0;
  padding: 10px;
  background: var(--app-surface-muted);
  border: 1px solid var(--app-border);
  border-radius: 8px;
}

.preview-body :deep(figure.article-image img) {
  display: block;
  max-width: 100%;
  height: auto;
  margin: 0 auto;
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
  position: relative;
  margin: 22px 0;
  padding: 44px 16px 16px;
  border: 1px solid #263244;
  border-radius: 8px;
  overflow: auto;
  background: #111827;
  color: #f8fafc;
  font-family: Consolas, "Courier New", monospace;
  font-size: 13px;
  line-height: 1.6;
  white-space: pre;
  tab-size: 2;
}

.preview-body :deep(pre.article-code::before) {
  content: attr(data-title);
  position: absolute;
  inset: 0 0 auto;
  height: 30px;
  padding: 7px 12px;
  background: #1f2937;
  color: #cbd5e1;
  font-family: Arial, "Microsoft YaHei", sans-serif;
  font-size: 12px;
  line-height: 16px;
}

.preview-body :deep(pre.article-code code) {
  display: block;
  min-width: max-content;
}

@media (max-width: 720px) {
  .article-preview {
    padding: 22px 18px;
  }
}
</style>
