<template>
  <div class="page-banner">
    <PageBanner
      variant="articles"
      eyebrow="ARTICLES"
      title="文章"
      subtitle="记录技术实践、问题复盘和长期折腾的笔记，让每次踩坑都变成可回看的经验。"
      :chips="['技术笔记', '项目复盘', '长期整理']"
      visual-label="article.archive"
      visual-value="认真沉淀"
    />
  </div>
</template>

<script setup>
import PageBanner from '@/components/layout/PageBanner.vue'
</script>

<style scoped>
.page-banner {
  width: var(--blog-content-width);
  margin: 0 auto;
  padding: 20px 16px 0;
}
</style>
