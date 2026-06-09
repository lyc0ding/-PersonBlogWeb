<template>
  <div ref="feedRef" class="article-feed">
    <div class="feed-toolbar">
      <el-input
        v-model="query.keyword"
        clearable
        placeholder="搜索文章标题 / 摘要"
        class="search-input"
        @keyup.enter="loadArticles"
        @clear="loadArticles"
      />
      <el-button type="primary" :loading="loading" @click="loadArticles">搜索</el-button>
    </div>

    <el-alert
      v-if="error"
      :title="error"
      type="error"
      show-icon
      :closable="false"
    />

    <el-skeleton v-if="loading && !contentList.length" :rows="5" animated />

    <el-empty v-else-if="!contentList.length" description="暂无文章" />

    <article
      v-for="(item, index) in contentList"
      v-else
      :key="item.id"
      class="post-card"
      :class="{ 'is-current': String(item.id) === String(currentArticleId) }"
      :data-current-id="item.id"
      :ref="(el) => setArticleCardRef(item.id, el)"
      role="link"
      tabindex="0"
      @click="openArticle(item.id)"
      @keydown.enter="openArticle(item.id)"
    >
      <!-- 封面背景层 + 文字内容层 -->
      <div class="post-cover" :style="getItemBgStyle(item)" aria-hidden="true" />
      <div class="post-content">
        <p class="post-kind">{{ item.type === 'shuoshuo' ? '朋友圈' : '文章' }}</p>
        <h2 class="post-title">
          <RouterLink
            :to="{ name: 'ArticleDetail', params: { id: item.id } }"
            @click.stop="rememberArticleScroll"
          >
            {{ item.title }}
          </RouterLink>
        </h2>
        <p class="post-excerpt">{{ item.summary || item.contentText || '暂无摘要' }}</p>
        <ul class="post-meta">
          <li>作者: Lycoding</li>
          <li>{{ formatDate(item.publishTime || item.createTime) }}</li>
          <li>{{ item.categoryName || resolveCategory(item) }}</li>
          <li>{{ item.commentCount ?? 0 }} 评论</li>
        </ul>
        <p class="post-more">
          <RouterLink
            :to="{ name: 'ArticleDetail', params: { id: item.id } }"
            @click.stop="rememberArticleScroll"
          >
            阅读全文
          </RouterLink>
        </p>
      </div>
    </article>

    <div class="pager-wrap">
      <el-pagination
        v-model:current-page="query.pageNum"
        v-model:page-size="query.pageSize"
        background
        layout="total, prev, pager, next"
        :total="total"
        @current-change="loadArticles"
      />
    </div>
  </div>
</template>
<script setup>
import { nextTick, onActivated, onBeforeUpdate, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'
import { publicArticlePageService } from '@/api/article'
import {
  hasWindowScrollRestoreMark,
  readPageSnapshotForReturn,
  rememberPageSnapshotForReturn,
  restoreWindowScrollIfMarked,
} from '@/utils/scrollMemory'

const route = useRoute()
const router = useRouter()
const emit = defineEmits(['current-location-change', 'toc-items-change'])
const feedRef = ref(null)
const loading = ref(false)
const error = ref('')
const contentList = ref([])
const total = ref(0)
const currentArticleId = ref(null)
const articleCardRefs = new Map()
const visibleArticleIds = new Map()
let articleObserver = null

const query = reactive({
  pageNum: 1,
  pageSize: 8,
  keyword: '',
  type: 'article',
})

// 获取文章封面背景
function getItemBgStyle(item) {
  const url = item.coverUrl || item.coverPage || item.thumbnail || '/img/bac2.jpg'
  return {
    backgroundImage: `url('${url}')`,
  }
}

async function loadArticles() {
  loading.value = true
  error.value = ''
  try {
    const res = await publicArticlePageService({ ...query })
    const page = res?.data ?? res ?? {}
    contentList.value = page.records ?? page.list ?? []
    total.value = page.total ?? contentList.value.length
    emitTocItems()
    await nextTick()
    syncArticleObserver()
    emitCurrentArticle(contentList.value[0])
  } catch (err) {
    contentList.value = []
    total.value = 0
    emitTocItems()
    emitCurrentArticle(null)
    error.value = err?.message || '文章列表加载失败，请确认后端 `/article/public/page` 可访问。'
  } finally {
    loading.value = false
  }
}

function openArticle(id) {
  if (!id) return
  rememberArticleScroll()
  router.push({ name: 'ArticleDetail', params: { id } })
}

function rememberArticleScroll() {
  let scrollTop = feedRef.value ? feedRef.value.scrollTop : window.scrollY || document.documentElement.scrollTop
  rememberPageSnapshotForReturn('articles', {
    query: { ...query },
    contentList: contentList.value,
    total: total.value,
    currentArticleId: currentArticleId.value,
    scrollTop: scrollTop,
    useFeedScroll: !!feedRef.value,
  })
}

async function restoreArticleSnapshot() {
  const snapshot = readPageSnapshotForReturn('articles')
  if (!snapshot?.contentList) return false

  Object.assign(query, snapshot.query || {})
  contentList.value = Array.isArray(snapshot.contentList) ? snapshot.contentList : []
  total.value = Number.isFinite(snapshot.total) ? snapshot.total : contentList.value.length
  currentArticleId.value = snapshot.currentArticleId ?? null
  emitTocItems()

  await nextTick()
  syncArticleObserver()
  const currentItem = contentList.value.find((item) => String(item.id) === String(currentArticleId.value))
  emitCurrentArticle(currentItem || contentList.value[0])
  
  if (snapshot.scrollTop != null) {
    await nextTick()
    setTimeout(() => {
      if(snapshot.useFeedScroll && feedRef.value){
        feedRef.value.scrollTop = snapshot.scrollTop
      }else{
        window.scrollTo(0, snapshot.scrollTop)
      }
    }, 80)
  }
  
  return true
}

function resolveCategory(post) {
  return post.tags?.[0]?.name != undefined ? '#'+post.tags?.[0]?.name : null
}

function formatDate(value) {
  if (!value) return '-'
  return String(value).replace(/-/g, '.').slice(0, 16)
}

function buildCurrentArticleLocation(item) {
  if (!item) return null
  const title = String(item.title || '无标题文章').trim()
  return {
    id: item.id,
    title: title || '无标题文章',
    icon: 'icon-wenjian',
    type: 'article',
  }
}

function emitTocItems() {
  emit('toc-items-change', contentList.value.map(buildCurrentArticleLocation).filter(Boolean))
}

function emitCurrentArticle(item) {
  const location = buildCurrentArticleLocation(item)
  currentArticleId.value = location?.id ?? null
  emit('current-location-change', location)
}

function setArticleCardRef(id, el) {
  if (el && id != null) {
    articleCardRefs.set(String(id), el)
  }
}

function syncArticleObserver() {
  articleObserver?.disconnect()
  visibleArticleIds.clear()

  if (!articleCardRefs.size) return

  if (typeof IntersectionObserver === 'undefined') {
    emitCurrentArticle(contentList.value[0])
    return
  }

  articleObserver = new IntersectionObserver(handleArticleIntersections, {
    root: null,
    rootMargin: '-130px 0px -45% 0px',
    threshold: [0, 0.12, 0.35, 0.65],
  })

  articleCardRefs.forEach((el) => articleObserver.observe(el))
}

function handleArticleIntersections(entries) {
  entries.forEach((entry) => {
    const id = String(entry.target.dataset.currentId || '')
    if (!id) return

    if (entry.isIntersecting) {
      visibleArticleIds.set(id, entry.intersectionRatio)
    } else {
      visibleArticleIds.delete(id)
    }
  })

  const currentId = Array.from(visibleArticleIds.entries())
    .sort((a, b) => b[1] - a[1])[0]?.[0]

  if (!currentId || currentId === String(currentArticleId.value)) return

  const currentItem = contentList.value.find((item) => String(item.id) === currentId)
  emitCurrentArticle(currentItem)
}

function scrollToLocation(location = null) {
  const id = typeof location === 'object' ? location?.id : (location ?? currentArticleId.value)
  const target = id != null ? articleCardRefs.get(String(id)) : null
  if (id != null) {
    const currentItem = contentList.value.find((item) => String(item.id) === String(id))
    emitCurrentArticle(currentItem)
  }
  target?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

defineExpose({
  scrollToLocation,
})

onBeforeUpdate(() => {
  articleCardRefs.clear()
})

onMounted(() => {
  if (typeof route.query.q === 'string') {
    query.keyword = route.query.q
  }
  if (hasWindowScrollRestoreMark('articles')) {
    restoreArticleSnapshot().then((restored) => {
      if (!restored) loadArticles()
    })
  } else {
    loadArticles()
  }
})

onActivated(() => {
//   restoreWindowScrollIfMarked('articles')
})

onBeforeRouteLeave((to) => {
  if (to.name === 'ArticleDetail') {
    rememberArticleScroll()
  }
})

onBeforeRouteLeave((to, from, next) => {
  rememberArticleScroll()
  next()
})

onUnmounted(() => {
  articleObserver?.disconnect()
})

watch(
  () => route.query.q,
  (value) => {
    if (route.name !== 'Articles') return
    query.keyword = typeof value === 'string' ? value : ''
    query.pageNum = 1
    loadArticles()
  }
)
</script>

<style scoped>
.article-feed {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.feed-toolbar {
  display: flex;
  gap: 10px;
  align-items: center;
  padding-bottom: 6px;
}

.search-input {
  max-width: 360px;
}

.post-card {
  position: relative;
  display: block;
  height: 234px;
  padding: 0;
  overflow: hidden;
  border-bottom: 1px solid var(--blog-divider);
  cursor: pointer;
  transition:
    background-color 0.24s ease,
    box-shadow 0.24s ease,
    transform 0.24s ease;
}

.post-card:hover,
.post-card:focus-within,
.post-card:focus-visible,
.post-card.is-current {
  box-shadow:
    inset 3px 0 0 var(--blog-link),
    var(--app-shadow-card, 0 10px 24px rgba(15, 23, 42, 0.06));
  transform: translateY(-1px);
}

.post-card:focus-visible {
  outline: 2px solid var(--blog-link);
  outline-offset: 3px;
}

.post-cover {
  position: absolute;
  inset: 0;
  z-index: 0;
  background-size: cover;
  background-position: center right;
  background-repeat: no-repeat;
}

.post-cover::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    var(--post-overlay-start) 0%,
    var(--post-overlay-start) 48%,
    var(--post-overlay-mid) 66%,
    var(--post-overlay-end) 84%,
    transparent 100%
  );
  pointer-events: none;
}

.post-content {
  position: relative;
  z-index: 1;
  height: 100%;
  padding: 18px 32px;
  min-width: 0;
  overflow: hidden;
  box-sizing: border-box;
}

.post-kind {
  margin: 0 0 6px;
  font-size: 13px;
  color: var(--blog-meta);
  letter-spacing: 0.08em;
}

.post-title {
  margin: 0 0 8px;
  font-size: 1.28rem;
  font-weight: 600;
  line-height: 1.4;
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.post-title a {
  color: var(--app-text-primary);
  text-decoration: none;
}

.post-title a:hover {
  color: var(--blog-link);
}

.post-excerpt {
  margin: 0 0 10px;
  font-size: 14px;
  line-height: 1.65;
  color: var(--app-text-secondary);
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.post-meta {
  list-style: none;
  padding: 0;
  margin: 0 0 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px 18px;
  font-size: 13px;
  color: var(--blog-meta);
  max-height: 22px;
  overflow: hidden;
}

.post-meta li {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.post-more {
  margin: 0;
  font-size: 14px;
}

.post-more a {
  color: var(--blog-link);
  text-decoration: none;
}

.pager-wrap {
  display: flex;
  justify-content: flex-end;
  padding: 10px 0 8px;
}

@media (max-width: 720px) {
  .feed-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .search-input {
    max-width: none;
  }

  .post-card {
    height: auto;
    min-height: 200px;
    padding: 0;
    overflow: hidden;
  }

  .post-content {
    padding: 18px 20px;
  }
}
</style>
