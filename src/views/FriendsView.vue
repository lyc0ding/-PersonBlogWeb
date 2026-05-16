<template>
  <div class="blog-page">
    <div class="blog-inner">
      <header class="page-head">
        <h1 class="page-title">友链</h1>
        <p class="page-desc">欢迎互换友链，可通过留言板联系。</p>
      </header>
      <ul class="link-list">
        <li v-for="item in links" :key="item.name">
          <a :href="item.url" target="_blank" rel="noopener noreferrer">{{ item.name }}</a>
          <span class="hint">{{ item.hint }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
const links = [
  { name: 'GitHub', url: 'https://github.com/', hint: '代码与项目' },
  { name: '示例站点', url: 'https://liveout.cn/', hint: '参考样式来源' },
]
</script>

<style scoped>
.blog-page {
  max-width: var(--blog-content-max, 960px);
  margin: 0 auto;
  padding: 24px 16px 48px;
}

.page-head {
  margin-bottom: 28px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--blog-divider);
}

.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--app-text-primary);
  margin: 0 0 8px;
}

.page-desc {
  margin: 0;
  font-size: 14px;
  color: var(--app-text-muted);
}

.link-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.link-list li {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px dashed var(--blog-divider);
}

.link-list a {
  color: var(--blog-link);
  text-decoration: none;
  font-weight: 500;
}

.link-list a:hover {
  text-decoration: underline;
}

.hint {
  font-size: 13px;
  color: var(--app-text-muted);
}
</style>
