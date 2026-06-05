<template>
  <section class="home-hero" :style="heroStyle" aria-label="personal blog hero">
    <div class="hero-content">
      <p class="hero-eyebrow">{{ heroEyebrow }}</p>
      <h1>{{ heroTitle }}</h1>
      <p class="hero-subtitle">
        {{ heroSubtitle }}
      </p>

      <div class="hero-actions" aria-label="首页快捷入口">
        <RouterLink class="hero-link hero-link--primary" :to="primaryPath">{{ primaryText }}</RouterLink>
        <RouterLink class="hero-link" :to="secondaryPath">{{ secondaryText }}</RouterLink>
      </div>

      <ul class="hero-tags" aria-label="博客方向">
        <li v-for="tag in heroTags" :key="tag">{{ tag }}</li>
      </ul>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useSiteConfigStore } from '@/stores/siteConfigStore'

const siteConfigStore = useSiteConfigStore()
const fallbackTags = ['Java / Vue', '嵌入式', '生活记录']

const heroEyebrow = computed(() => siteConfigStore.value('home.heroEyebrow', 'PERSONAL BLOG'))
const heroTitle = computed(() => siteConfigStore.value('home.heroTitle', 'Lycoding'))
const heroSubtitle = computed(() => siteConfigStore.value('home.heroSubtitle', '记录代码、生活和持续折腾的个人博客。把问题写清楚，把经验留下来。'))
const primaryText = computed(() => siteConfigStore.value('home.heroPrimaryText', '阅读文章'))
const primaryPath = computed(() => siteConfigStore.value('home.heroPrimaryPath', '/articles'))
const secondaryText = computed(() => siteConfigStore.value('home.heroSecondaryText', '看看朋友圈'))
const secondaryPath = computed(() => siteConfigStore.value('home.heroSecondaryPath', '/space'))
const heroTags = computed(() => {
  const tags = siteConfigStore.json('home.heroTags', fallbackTags)
  return Array.isArray(tags) && tags.length ? tags.map(String) : fallbackTags
})
const heroStyle = computed(() => ({
  '--hero-cover-url': `url('${cssUrl(siteConfigStore.value('home.heroCoverUrl', '/img/bac2.jpg'))}')`,
}))

function cssUrl(value) {
  return String(value || '').replace(/'/g, "\\'")
}

onMounted(() => {
  siteConfigStore.loadConfigs()
})
</script>

<style scoped>
.home-hero {
  position: relative;
  width: var(--blog-content-width);
  min-height: clamp(300px, 42vh, 420px);
  margin: 0 auto 18px;
  overflow: hidden;
  border-radius: 8px;
  background:
    linear-gradient(90deg, rgba(8, 18, 32, 0.78), rgba(8, 18, 32, 0.32) 58%, rgba(8, 18, 32, 0.18)),
    var(--hero-cover-url, url('/img/bac2.jpg')) center / cover no-repeat;
  box-shadow: 0 18px 46px rgba(15, 23, 42, 0.12);
}

.home-hero::after {
  content: '';
  position: absolute;
  inset: auto 0 0;
  height: 1px;
  background: rgba(255, 255, 255, 0.28);
}

.hero-content {
  position: relative;
  z-index: 1;
  width: min(620px, 100%);
  min-height: inherit;
  padding: clamp(30px, 5vw, 54px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: #ffffff;
}

.hero-eyebrow {
  margin: 0 0 10px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.16em;
  color: rgba(255, 255, 255, 0.76);
}

.hero-content h1 {
  margin: 0;
  font-size: clamp(2.4rem, 6vw, 4.6rem);
  font-weight: 750;
  line-height: 1;
  letter-spacing: 0;
}

.hero-subtitle {
  width: min(100%, 540px);
  margin: 18px 0 0;
  font-size: clamp(1rem, 2vw, 1.15rem);
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.88);
}

.hero-actions {
  margin-top: 28px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.hero-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 0 18px;
  border: 1px solid rgba(255, 255, 255, 0.46);
  border-radius: 8px;
  color: #ffffff;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  transition:
    transform 0.22s ease,
    background-color 0.22s ease,
    border-color 0.22s ease;
}

.hero-link:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.14);
  border-color: rgba(255, 255, 255, 0.82);
  transform: translateY(-1px);
}

.hero-link--primary {
  border-color: #ffffff;
  background: #ffffff;
  color: #1f4e79;
}

.hero-link--primary:hover {
  color: #163c60;
  background: rgba(255, 255, 255, 0.92);
}

.hero-tags {
  list-style: none;
  margin: 26px 0 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.hero-tags li {
  padding: 5px 10px;
  border: 1px solid rgba(255, 255, 255, 0.24);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.84);
  font-size: 13px;
  backdrop-filter: blur(4px);
}

@media (max-width: 720px) {
  .home-hero {
    width: var(--blog-content-width);
    min-height: 360px;
    margin-bottom: 12px;
    background:
      linear-gradient(180deg, rgba(8, 18, 32, 0.82), rgba(8, 18, 32, 0.42)),
      var(--hero-cover-url, url('/img/bac2.jpg')) center / cover no-repeat;
  }

  .hero-content {
    padding: 28px 22px;
  }

  .hero-link {
    flex: 1 1 132px;
  }
}
</style>
