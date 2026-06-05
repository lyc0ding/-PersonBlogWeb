<template>
  <div class="blog-page">
    <div class="blog-inner">
      <header class="page-head">
        <h1 class="page-title">{{ title }}</h1>
        <p class="page-sub">{{ subtitle }}</p>
      </header>

      <el-carousel
        v-if="images.length"
        class="live-carousel"
        height="320px"
        indicator-position="outside"
      >
        <el-carousel-item v-for="item in images" :key="item.url">
          <img :src="item.url" :alt="item.alt || title" class="carousel-image">
        </el-carousel-item>
      </el-carousel>

      <article class="prose" v-html="contentHtml" />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useSiteConfigStore } from '@/stores/siteConfigStore'

const siteConfigStore = useSiteConfigStore()

const fallbackImages = [
  { url: '/img/bac1.jpg', alt: '生活照片 1' },
  { url: '/img/bac2.jpg', alt: '生活照片 2' },
]

const title = computed(() => siteConfigStore.value('live.title', '关于我'))
const subtitle = computed(() => siteConfigStore.value('live.subtitle', 'About Me'))
const contentHtml = computed(() => siteConfigStore.value(
  'live.contentHtml',
  '<p>这里是关于我的详细介绍内容，可在后台系统设置中维护。</p><p>你可以补充个人经历、项目、联系方式和近期状态。</p>'
))
const images = computed(() => {
  const list = siteConfigStore.json('live.images', fallbackImages)
  if (!Array.isArray(list)) return fallbackImages
  const normalized = list
    .filter((item) => item?.url)
    .map((item) => ({
      url: String(item.url),
      alt: String(item.alt || ''),
    }))
  return normalized.length ? normalized : fallbackImages
})

onMounted(() => {
  siteConfigStore.loadConfigs()
})
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

.live-carousel {
  margin: 0 auto 28px;
  max-width: 780px;
  overflow: hidden;
  border: 1px solid var(--blog-card-border);
  border-radius: 8px;
  background: var(--app-media-letterbox);
}

.carousel-image {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.prose {
  font-size: 15px;
  line-height: 1.85;
  color: var(--app-text-secondary);
  max-width: 720px;
  margin: 0 auto;
}

.prose :deep(p) {
  margin: 0 0 1em;
}

.prose :deep(img) {
  max-width: 100%;
  border-radius: 6px;
}

.prose :deep(a) {
  color: var(--blog-link);
}

@media (max-width: 640px) {
  .blog-page {
    padding: 16px 12px 40px;
  }

  .live-carousel {
    margin-bottom: 22px;
  }
}
</style>
