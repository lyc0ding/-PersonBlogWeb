<template>
  <div class="page-banner">
    <div class="page-banner-inner">
      <h1 class="page-title">文章</h1>
      <p class="page-sub">记录技术、生活与折腾笔记</p>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.page-banner {
  width: 100%;
  max-width: var(--blog-content-max, 960px);
  margin: 0 auto;
  padding: 20px 16px 0;
}

.page-banner-inner {
  text-align: center;
  padding: 20px 16px;
  border-bottom: 1px solid var(--blog-divider);
}

.page-title {
  margin: 0 0 8px;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--app-text-primary);
}

.page-sub {
  margin: 0;
  font-size: 14px;
  color: var(--app-text-muted);
}
</style>
