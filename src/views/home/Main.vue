<template>
  <div class="home-main">
    <section class="home-overview" aria-label="博客概览">
      <div v-for="item in stats" :key="item.label" class="stat-item">
        <strong>{{ item.value }}</strong>
        <span>{{ item.label }}</span>
      </div>
    </section>

    <section class="home-layout">
      <div class="home-column home-column--wide">
        <div class="section-heading">
          <p>RECENT WRITING</p>
          <h2>最近文章</h2>
        </div>

        <div class="post-list">
          <RouterLink
            v-for="post in recentPosts"
            :key="post.id || post.title"
            class="post-entry"
            :to="{ path: '/articles', query: post.title ? { q: post.title } : {} }"
          >
            <span class="post-date">{{ post.date }}</span>
            <div class="post-body">
              <h3>{{ post.title }}</h3>
              <p>{{ post.excerpt }}</p>
            </div>
            <span class="post-category">{{ post.category }}</span>
          </RouterLink>
        </div>
      </div>

      <aside class="home-column home-column--side" aria-label="个人博客信息">
        <div class="profile-block">
          <div class="profile-avatar">
            <img :src="avatarUrl" :alt="ownerName">
          </div>
          <div>
            <p class="profile-label">BLOG OWNER</p>
            <h2>{{ ownerName }}</h2>
            <p class="profile-text">
              {{ profileBio }}
            </p>
          </div>
        </div>

        <div class="now-block">
          <div class="section-heading section-heading--compact">
            <p>NOW</p>
            <h2>此刻在做</h2>
          </div>
          <ul>
            <li v-for="item in nowItems" :key="item">{{ item }}</li>
          </ul>
        </div>
      </aside>
    </section>

    <TimeLine :items="buildTimeline" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import TimeLine from '@/views/home/TimeLine.vue'
import { publicArticlePageService } from '@/api/article'
import { publicDashboardStatsService } from '@/api/site'
import { DEFAULT_BUILD_TIMELINE, useSiteConfigStore } from '@/stores/siteConfigStore'

const siteConfigStore = useSiteConfigStore()
const dashboardStats = ref(null)
const recentPosts = ref(defaultRecentPosts())

const ownerName = computed(() => siteConfigStore.value('site.owner', 'Lycoding'))
const avatarUrl = computed(() => siteConfigStore.value('site.avatarUrl', '/logo.png'))
const profileBio = computed(() => siteConfigStore.value('site.profileBio', '这里整理开发笔记、嵌入式实践和生活里的片段，保留一点长期主义的痕迹。'))

const stats = computed(() => [
  { label: '文章记录', value: formatCount(dashboardStats.value?.publishedCount ?? dashboardStats.value?.articleCount, '23+') },
  { label: '评论交流', value: formatCount(dashboardStats.value?.commentCount, '45+') },
  { label: '建站年份', value: siteConfigStore.value('site.buildYear', '2026') },
])

const nowItems = computed(() => {
  const items = siteConfigStore.json('home.nowItems', defaultNowItems())
  return Array.isArray(items) && items.length ? items.map(String) : defaultNowItems()
})

const buildTimeline = computed(() => normalizeBuildTimeline(
  siteConfigStore.json('home.buildTimeline', DEFAULT_BUILD_TIMELINE)
))

function defaultRecentPosts() {
  return [
    {
      title: 'Codex 自制宠物',
      excerpt: '把一个有趣的小工具接入博客，让页面多一点个人化的交互感。',
      date: '2026.05.08',
      category: '建站',
    },
    {
      title: 'U-Boot、内核移植与根文件系统构建',
      excerpt: '记录 BeagleBone Green Gateway 与 AM335X 的移植流程和关键问题。',
      date: '2026.04.25',
      category: '嵌入式',
    },
    {
      title: '你们搞大模型的就是？',
      excerpt: '关于近期大模型发展、开发体验和日常使用的一些观察。',
      date: '2026.04.11',
      category: '生活',
    },
  ]
}

function defaultNowItems() {
  return [
    '整理 Vue 博客前台的阅读体验',
    '补齐嵌入式开发过程中的问题记录',
    '把日常想法沉淀成可以回看的文字',
  ]
}

function normalizeBuildTimeline(value) {
  const list = Array.isArray(value) ? value : DEFAULT_BUILD_TIMELINE
  const normalized = list
    .filter((item) => item?.visible !== false && item?.title && (item?.time || item?.date))
    .map((item) => ({
      time: String(item.time || item.date),
      title: String(item.title),
      content: String(item.content || item.desc || ''),
      badge: item.badge ? String(item.badge) : '',
      visible: item.visible !== false,
    }))
  return normalized.length ? normalized : DEFAULT_BUILD_TIMELINE
}

function formatCount(value, fallback) {
  const number = Number(value)
  if (!Number.isFinite(number)) return fallback
  return number >= 1000 ? `${Math.floor(number / 100) / 10}k` : `${number}`
}

function formatDate(value) {
  if (!value) return '-'
  return String(value).replace(/-/g, '.').slice(0, 10)
}

function resolveCategory(post) {
  return post.categoryName || post.tags?.[0]?.name || post.type || '文章'
}

async function loadDashboardStats() {
  try {
    const res = await publicDashboardStatsService()
    dashboardStats.value = res?.data ?? res ?? null
  } catch {
    dashboardStats.value = null
  }
}

async function loadRecentPosts() {
  try {
    const res = await publicArticlePageService({ pageNum: 1, pageSize: 3, type: 'article' })
    const page = res?.data ?? res ?? {}
    const list = page.records ?? page.list ?? []
    if (!Array.isArray(list) || !list.length) return
    recentPosts.value = list.map((item) => ({
      id: item.id,
      title: item.title || '无标题文章',
      excerpt: item.summary || item.contentText || '暂无摘要',
      date: formatDate(item.publishTime || item.createTime),
      category: resolveCategory(item),
    }))
  } catch {
    recentPosts.value = defaultRecentPosts()
  }
}

onMounted(() => {
  siteConfigStore.loadConfigs()
  loadDashboardStats()
  loadRecentPosts()
})
</script>

<style scoped>
.home-main {
  width: var(--blog-content-width);
  margin: 0 auto;
  padding: 0 0 56px;
}

.home-overview {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  border-top: 1px solid var(--blog-divider);
  border-bottom: 1px solid var(--blog-divider);
  background: var(--app-surface);
}

.stat-item {
  min-height: 94px;
  padding: 20px 22px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-right: 1px solid var(--blog-divider);
}

.stat-item:last-child {
  border-right: 0;
}

.stat-item strong {
  color: var(--app-text-primary);
  font-size: 1.9rem;
  font-weight: 750;
  line-height: 1.1;
}

.stat-item span {
  margin-top: 8px;
  color: var(--blog-meta);
  font-size: 14px;
}

.home-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(280px, 0.8fr);
  gap: 34px;
  padding: 34px 0;
  border-bottom: 1px solid var(--blog-divider);
}

.home-column {
  min-width: 0;
}

.section-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.section-heading p {
  margin: 0;
  color: var(--blog-meta);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.14em;
}

.section-heading h2 {
  margin: 0;
  color: var(--app-text-primary);
  font-size: 1.35rem;
  font-weight: 700;
  line-height: 1.25;
}

.section-heading--compact {
  align-items: flex-start;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
}

.post-list {
  border-top: 1px solid var(--blog-divider);
}

.post-entry {
  display: grid;
  grid-template-columns: 102px minmax(0, 1fr) auto;
  gap: 18px;
  align-items: center;
  min-height: 116px;
  padding: 18px 0;
  border-bottom: 1px solid var(--blog-divider);
  color: inherit;
  text-decoration: none;
  transition:
    background-color 0.22s ease,
    padding 0.22s ease;
}

.post-entry:hover {
  padding-left: 14px;
  padding-right: 14px;
  background: color-mix(in srgb, var(--blog-link) 7%, var(--app-surface));
}

.post-date {
  color: var(--blog-meta);
  font-size: 13px;
  white-space: nowrap;
}

.post-body {
  min-width: 0;
}

.post-body h3 {
  margin: 0 0 8px;
  color: var(--app-text-primary);
  font-size: 1.05rem;
  font-weight: 650;
  line-height: 1.45;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.post-entry:hover .post-body h3 {
  color: var(--blog-link);
}

.post-body p {
  margin: 0;
  color: var(--app-text-secondary);
  font-size: 14px;
  line-height: 1.65;
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.post-category {
  padding: 5px 10px;
  border: 1px solid var(--blog-divider);
  border-radius: 999px;
  color: var(--blog-meta);
  font-size: 12px;
  white-space: nowrap;
}

.profile-block,
.now-block {
  border-bottom: 1px solid var(--blog-divider);
  padding-bottom: 24px;
}

.profile-block {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr);
  gap: 16px;
  align-items: start;
}

.profile-avatar {
  width: 64px;
  height: 64px;
  border: 1px solid var(--blog-divider);
  border-radius: 8px;
  overflow: hidden;
  background: var(--app-surface);
}

.profile-avatar img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.profile-label {
  margin: 0 0 4px;
  color: var(--blog-meta);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.14em;
}

.profile-block h2 {
  margin: 0;
  color: var(--app-text-primary);
  font-size: 1.25rem;
  font-weight: 700;
}

.profile-text {
  margin: 10px 0 0;
  color: var(--app-text-secondary);
  font-size: 14px;
  line-height: 1.75;
}

.now-block {
  margin-top: 24px;
}

.now-block ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 10px;
}

.now-block li {
  position: relative;
  padding-left: 16px;
  color: var(--app-text-secondary);
  font-size: 14px;
  line-height: 1.7;
}

.now-block li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.72em;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--blog-link);
}

@media (max-width: 820px) {
  .home-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 620px) {
  .home-main {
    width: var(--blog-content-width);
  }

  .home-overview {
    grid-template-columns: 1fr;
  }

  .stat-item {
    min-height: 78px;
    border-right: 0;
    border-bottom: 1px solid var(--blog-divider);
  }

  .stat-item:last-child {
    border-bottom: 0;
  }

  .home-layout {
    gap: 28px;
    padding: 28px 0;
  }

  .section-heading {
    align-items: flex-start;
    flex-direction: column;
    gap: 4px;
  }

  .post-entry {
    grid-template-columns: 1fr;
    gap: 8px;
    min-height: 0;
  }

  .post-entry:hover {
    padding-left: 0;
    padding-right: 0;
    background: transparent;
  }

  .post-body h3 {
    white-space: normal;
    display: -webkit-box;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .post-category {
    justify-self: start;
  }

}
</style>
