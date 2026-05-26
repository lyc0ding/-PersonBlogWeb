<template>
  <div class="blog-page">
    <div class="blog-inner">
      <header class="page-head">
        <h1 class="page-title">关于我</h1>
        <p class="page-sub">About Me</p>
      </header>
      <article class="prose">
        <p>这里是关于我的详细介绍内容，可替换为个人经历、项目与联系方式等。</p>
        <p>原先全屏走马灯与滚动覆盖效果已改为与全站一致的文档式阅读体验，更符合博客类站点交互。</p>
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
  text-align: center;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--app-text-primary);
  margin: 0 0 6px;
  letter-spacing: 0.12em;
}

.page-sub {
  margin: 0;
  font-size: 14px;
  color: var(--app-text-muted);
  letter-spacing: 0.2em;
}

.prose {
  font-size: 15px;
  line-height: 1.85;
  color: var(--app-text-secondary);
  max-width: 640px;
  margin: 0 auto;
}

.prose p {
  margin: 0 0 1em;
}
</style>
