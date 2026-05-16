<template>
  <div class="article-preview">
    <header class="preview-header">
      <p class="preview-type">{{ form.type === 'shuoshuo' ? '说说' : '文章' }}</p>
      <h1>{{ form.title || '未命名文章' }}</h1>
      <ul v-if="form.summary" class="preview-summary">
        <li>{{ form.summary }}</li>
      </ul>
    </header>

    <div v-if="form.coverUrl" class="preview-cover">
      <img :src="form.coverUrl" alt="封面">
    </div>

    <article class="preview-body">
      <template v-for="block in form.contentBlocks" :key="block.id">
        <h2 v-if="block.type === 'heading' && (block.level === 2 || !block.level)" class="heading">
          {{ block.content }}
        </h2>
        <h3 v-else-if="block.type === 'heading' && block.level === 3" class="heading">
          {{ block.content }}
        </h3>
        <h4 v-else-if="block.type === 'heading'" class="heading">
          {{ block.content }}
        </h4>

        <p v-else-if="block.type === 'paragraph'" class="paragraph">
          {{ block.content }}
        </p>

        <blockquote v-else-if="block.type === 'quote'" class="quote">
          {{ block.content }}
        </blockquote>

        <figure v-else-if="block.type === 'image' && block.url" class="figure">
          <img :src="block.url" :alt="block.alt">
          <figcaption v-if="block.caption">{{ block.caption }}</figcaption>
        </figure>

        <div v-else-if="block.type === 'code'" class="code-preview">
          <div class="code-head">
            <span>{{ block.filename || block.language || 'code' }}</span>
          </div>
          <pre><code>{{ block.content }}</code></pre>
        </div>
      </template>
    </article>
  </div>
</template>

<script setup>
defineProps({
  form: { type: Object, required: true },
})
</script>

<style scoped>
.article-preview {
  padding: 20px;
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: 8px;
  min-height: 400px;
}

.preview-type {
  margin: 0 0 6px;
  font-size: 12px;
  color: var(--app-text-muted);
  letter-spacing: 0.08em;
}

.preview-header h1 {
  margin: 0 0 12px;
  font-size: 1.6rem;
  line-height: 1.4;
  color: var(--app-text-primary);
}

.preview-summary {
  list-style: none;
  padding: 0;
  margin: 0 0 16px;
  font-size: 14px;
  color: var(--app-text-secondary);
}

.preview-cover img {
  width: 100%;
  max-height: 280px;
  object-fit: cover;
  border-radius: 6px;
  margin-bottom: 20px;
}

.preview-body {
  font-size: 15px;
  line-height: 1.85;
  color: var(--app-text-secondary);
}

.heading {
  margin: 1.2em 0 0.6em;
  color: var(--app-text-primary);
}

.paragraph {
  margin: 0 0 1em;
  white-space: pre-wrap;
}

.quote {
  margin: 0 0 1em;
  padding: 10px 14px;
  border-left: 4px solid var(--el-color-primary);
  background: var(--app-surface-muted);
  color: var(--app-text-secondary);
}

.figure {
  margin: 0 0 1.2em;
}

.figure img {
  max-width: 100%;
  border-radius: 4px;
}

.figure figcaption {
  margin-top: 6px;
  font-size: 13px;
  color: var(--app-text-muted);
  text-align: center;
}

.code-preview {
  margin: 0 0 1.2em;
  border-radius: 6px;
  overflow: hidden;
  background: #282c34;
  color: #abb2bf;
}

.code-head {
  padding: 6px 12px;
  font-size: 12px;
  background: #21252b;
  border-bottom: 1px solid #3e4451;
}

.code-preview pre {
  margin: 0;
  padding: 12px;
  overflow: auto;
  font-family: Consolas, monospace;
  font-size: 13px;
  line-height: 1.5;
}
</style>
