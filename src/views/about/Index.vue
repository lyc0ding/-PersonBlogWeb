<template>
  <div class="blog-page">
    <div class="blog-inner">
      <header class="page-head">
        <h1 class="page-title">关于</h1>
        <p class="page-desc">这里是站长的自我介绍与联系方式占位，可按需修改文案。</p>
      </header>
      <article class="prose">
        <p>
          本站前端样式参考
          <a href="https://liveout.cn/" target="_blank" rel="noopener noreferrer">liveout.cn</a>
          的极简博客布局，便于阅读与浏览。
        </p>
        <p>更多「关于我」图文介绍可放在此区域，或继续使用原「关于我」独立页 <router-link to="/live">/live</router-link>。</p>
      </article>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.blog-page {
  width: var(--blog-content-width);
  margin: 0 auto;
  padding: 24px 16px 48px;
}

.page-head {
  margin-bottom: 24px;
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

.prose {
  font-size: 15px;
  line-height: 1.85;
  color: var(--app-text-secondary);
}

.prose p {
  margin: 0 0 1em;
}

.prose a {
  color: var(--blog-link);
  text-decoration: none;
}

.prose a:hover {
  text-decoration: underline;
}
</style>
