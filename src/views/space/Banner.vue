<template>
  <div class="page-banner">
    <PageBanner
      variant="space"
      eyebrow="MOMENTS"
      title="朋友圈"
      subtitle="把近期动态、照片和一点碎碎念放在这里，像给生活做一份轻量备忘。"
      :chips="['日常片段', '照片记录', '近期状态']"
      visual-label="moment.feed"
      visual-value="随手更新"
    />
  </div>
</template>

<script setup>
import PageBanner from '@/components/layout/PageBanner.vue'
</script>

<style scoped>
.page-banner {
  width: 100%;
  margin: 0 auto;
  padding: 20px 16px 0;
}
</style>
