<template>
  <div class="article-feed">
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
      v-for="item in contentList"
      v-else
      :key="item.id"
      :ref="(el) => setArticleCardRef(el, item.id)"
      :data-article-id="item.id"
      class="post-card"
      role="link"
      tabindex="0"
      @click="openArticle(item)"
      @keydown.enter="openArticle(item)"
    >
      <!-- 封面背景层 + 文字内容层 -->
      <div class="post-cover" :style="getItemBgStyle(item)" aria-hidden="true" />
      <div class="post-content">
        <p class="post-kind">{{ item.type === 'shuoshuo' ? '朋友圈' : '文章' }}</p>
        <h2 class="post-title">
          <RouterLink
            :to="{ name: 'ArticleDetail', params: { id: item.id } }"
            @click.stop="rememberArticlePosition(item)"
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
            @click.stop="rememberArticlePosition(item)"
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
import { nextTick, onBeforeUpdate, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { publicArticlePageService } from '@/api/article'

const route = useRoute()
const router = useRouter()
const ARTICLE_SCROLL_TARGET_KEY = 'personblog_article_scroll_target'
const loading = ref(false)
const error = ref('')
const contentList = ref([])
const total = ref(0)
const articleCardRefs = new Map()

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
    await restoreArticlePosition()
  } catch (err) {
    contentList.value = []
    total.value = 0
    error.value = err?.message || '文章列表加载失败，请确认后端 `/article/public/page` 可访问。'
  } finally {
    loading.value = false
  }
}

function setArticleCardRef(el, id) {
  if (!id) return
  if (el) {
    articleCardRefs.set(String(id), el)
  }
}

function rememberArticlePosition(item) {
  if (!item?.id) return
  sessionStorage.setItem(ARTICLE_SCROLL_TARGET_KEY, JSON.stringify({
    id: String(item.id),
    pageNum: query.pageNum,
    pageSize: query.pageSize,
    keyword: query.keyword,
  }))
}

function openArticle(item) {
  if (!item?.id) return
  rememberArticlePosition(item)
  router.push({ name: 'ArticleDetail', params: { id: item.id } })
}

function readArticlePositionTarget() {
  const rawTarget = sessionStorage.getItem(ARTICLE_SCROLL_TARGET_KEY)
  if (!rawTarget) return null

  try {
    return JSON.parse(rawTarget)
  } catch {
    sessionStorage.removeItem(ARTICLE_SCROLL_TARGET_KEY)
    return null
  }
}

async function restoreArticlePosition() {
  const target = readArticlePositionTarget()
  if (!target) return

  if (
    Number(target.pageNum) !== query.pageNum ||
    Number(target.pageSize) !== query.pageSize ||
    (target.keyword || '') !== query.keyword
  ) {
    return
  }

  await nextTick()
  const targetElement = articleCardRefs.get(String(target.id))
  if (!targetElement) {
    sessionStorage.removeItem(ARTICLE_SCROLL_TARGET_KEY)
    return
  }

  sessionStorage.removeItem(ARTICLE_SCROLL_TARGET_KEY)
  targetElement.scrollIntoView({
    behavior: 'auto',
    block: 'start',
  })
}

function resolveCategory(post) {
  return post.tags?.[0]?.name != undefined ? '#'+post.tags?.[0]?.name : null
}

function formatDate(value) {
  if (!value) return '-'
  return String(value).replace(/-/g, '.').slice(0, 16)
}

onBeforeUpdate(() => {
  articleCardRefs.clear()
})

onMounted(() => {
  const target = readArticlePositionTarget()
  if (target) {
    query.pageNum = Number(target.pageNum) || query.pageNum
    query.pageSize = Number(target.pageSize) || query.pageSize
    query.keyword = typeof target.keyword === 'string' ? target.keyword : query.keyword
  } else if (typeof route.query.q === 'string') {
    query.keyword = route.query.q
  }
  loadArticles()
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
  scroll-margin-top: calc(var(--blog-header-height, 118px) + 16px);
  transition:
    background-color 0.24s ease,
    box-shadow 0.24s ease,
    transform 0.24s ease;
}

.post-card:hover,
.post-card:focus-within,
.post-card:focus-visible {
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
