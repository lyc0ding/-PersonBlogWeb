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
      v-for="(item, index) in contentList"
      v-else
      :key="item.id"
      class="post-card"
      @click="openArticle(item.id)"
    >
      <!-- 封面背景层 + 文字内容层 -->
      <div class="post-cover" :style="getItemBgStyle(item)" aria-hidden="true" />
      <div class="post-content">
        <p class="post-kind">{{ item.type === 'shuoshuo' ? '朋友圈' : '文章' }}</p>
        <h2 class="post-title">
          <a href="javascript:void(0)" @click.prevent>{{ item.title }}</a>
        </h2>
        <p class="post-excerpt">{{ item.summary || item.contentText || '暂无摘要' }}</p>
        <ul class="post-meta">
          <li>作者: Lycoding</li>
          <li>{{ formatDate(item.publishTime || item.createTime) }}</li>
          <li>{{ item.categoryName || resolveCategory(item) }}</li>
          <li>{{ item.commentCount ?? 0 }} 评论</li>
        </ul>
        <p class="post-more">
          <a href="javascript:void(0)" @click.prevent="openArticle(item.id)">阅读全文</a>
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

    <el-dialog v-model="detailVisible" width="min(920px, 92vw)" class="article-dialog" destroy-on-close>
      <template #header>
        <div class="detail-head">
          <p>{{ detail.categoryName || resolveCategory(detail) }}</p>
          <h2>{{ detail.title }}</h2>
          <span>{{ formatDate(detail.publishTime || detail.createTime) }}</span>
        </div>
      </template>
      <img v-if="detail.coverUrl" class="detail-cover" :src="detail.coverUrl" :alt="detail.title">
      <p v-if="detail.summary" class="detail-summary">{{ detail.summary }}</p>
      <article class="detail-body" v-html="detail.contentHtml || textToHtml(detail.contentText)" />

      <section class="detail-comments">
        <div class="detail-comments-head">
          <h3>评论（{{ detailCommentTotal }}）</h3>
          <el-button link :loading="detailCommentLoading" @click="loadArticleComments()">刷新</el-button>
        </div>

        <div class="comment-form">
          <el-input
            v-model="detailCommentForm.content"
            type="textarea"
            :rows="3"
            maxlength="800"
            show-word-limit
            :placeholder="articleReplyTarget ? `回复 ${articleReplyTarget.nickname}` : '写下你的评论'"
          />
          <div class="comment-fields">
            <el-input v-model="detailCommentForm.nickname" placeholder="昵称" />
            <el-input v-model="detailCommentForm.email" placeholder="邮箱" />
            <el-input v-model="detailCommentForm.website" placeholder="网站（选填）" />
          </div>
          <div class="comment-actions">
            <el-button v-if="articleReplyTarget" @click="cancelArticleReply">取消回复</el-button>
            <el-button type="primary" :loading="detailCommentSubmitting" @click="submitArticleComment">提交评论</el-button>
          </div>
        </div>

        <el-skeleton v-if="detailCommentLoading && !detailComments.length" :rows="3" animated />
        <el-empty v-else-if="!detailComments.length" description="暂无评论" />
        <div v-else class="comment-list">
          <div v-for="comment in detailComments" :key="comment.id" class="comment-item">
            <div class="comment-main">
              <el-avatar :size="36">{{ displayAvatarText(comment.nickname) }}</el-avatar>
              <div class="comment-content">
                <div class="comment-meta">
                  <strong>{{ comment.nickname }}</strong>
                  <span>{{ formatDate(comment.createTime) }}</span>
                </div>
                <p>{{ comment.content }}</p>
                <button type="button" @click="startArticleReply(comment, comment)">回复</button>
              </div>
            </div>
            <div v-if="comment.replyList?.length" class="reply-list">
              <div v-for="reply in comment.replyList" :key="reply.id" class="comment-main reply-main">
                <el-avatar :size="30">{{ displayAvatarText(reply.nickname) }}</el-avatar>
                <div class="comment-content">
                  <div class="comment-meta">
                    <strong>{{ reply.nickname }}</strong>
                    <span>回复 {{ reply.replyToNickname || comment.nickname }} · {{ formatDate(reply.createTime) }}</span>
                  </div>
                  <p>{{ reply.content }}</p>
                  <button type="button" @click="startArticleReply(comment, reply)">回复</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="comment-pager">
          <el-pagination
            v-model:current-page="detailCommentQuery.pageNum"
            v-model:page-size="detailCommentQuery.pageSize"
            background
            small
            layout="prev, pager, next"
            :total="detailCommentTotal"
            @current-change="loadArticleComments()"
          />
        </div>
      </section>
    </el-dialog>
  </div>
</template>
<script setup>
import { onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { publicArticleDetailService, publicArticlePageService } from '@/api/article'
import { commentPageService, commentSubmitService } from '@/api/comment'

const route = useRoute()
const loading = ref(false)
const error = ref('')
const contentList = ref([])
const total = ref(0)
const detailVisible = ref(false)
const detail = ref({})
const detailComments = ref([])
const detailCommentTotal = ref(0)
const detailCommentLoading = ref(false)
const detailCommentSubmitting = ref(false)
const articleReplyTarget = ref(null)
const articleReplyRoot = ref(null)

const query = reactive({
  pageNum: 1,
  pageSize: 8,
  keyword: '',
  type: 'article',
})

const detailCommentQuery = reactive({
  pageNum: 1,
  pageSize: 5,
})

const detailCommentForm = reactive({
  content: '',
  nickname: localStorage.getItem('personblog_comment_nickname') || '',
  email: localStorage.getItem('personblog_comment_email') || '',
  website: localStorage.getItem('personblog_comment_website') || '',
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
  } catch (err) {
    contentList.value = []
    total.value = 0
    error.value = err?.message || '文章列表加载失败，请确认后端 `/article/public/page` 可访问。'
  } finally {
    loading.value = false
  }
}

async function openArticle(id) {
  if (!id) return
  try {
    const res = await publicArticleDetailService(id)
    detail.value = res?.data ?? res ?? {}
    detailVisible.value = true
    detailCommentQuery.pageNum = 1
    cancelArticleReply()
    loadArticleComments(id)
  } catch (err) {
    error.value = err?.message || '文章详情加载失败。'
  }
}

async function loadArticleComments(articleId = detail.value?.id) {
  if (!articleId) return
  detailCommentLoading.value = true
  try {
    const res = await commentPageService({ articleId, ...detailCommentQuery })
    const page = res?.data ?? res ?? {}
    detailComments.value = (page.records ?? page.list ?? []).map((item) => ({
      ...item,
      replyList: item.replyList ?? [],
    }))
    detailCommentTotal.value = page.total ?? detailComments.value.length
  } catch (err) {
    detailComments.value = []
    detailCommentTotal.value = 0
    ElMessage.error(err?.message || '文章评论加载失败')
  } finally {
    detailCommentLoading.value = false
  }
}

async function submitArticleComment() {
  if (!detail.value?.id) return
  if (!detailCommentForm.content.trim()) {
    ElMessage.warning('请填写评论内容')
    return
  }
  if (!detailCommentForm.nickname.trim()) {
    ElMessage.warning('请填写昵称')
    return
  }
  if (!detailCommentForm.email.trim()) {
    ElMessage.warning('请填写邮箱')
    return
  }

  detailCommentSubmitting.value = true
  try {
    await commentSubmitService({
      articleId: detail.value.id,
      content: detailCommentForm.content.trim(),
      nickname: detailCommentForm.nickname.trim(),
      email: detailCommentForm.email.trim(),
      website: detailCommentForm.website.trim(),
      parentId: articleReplyRoot.value?.id ?? 0,
      replyToId: articleReplyTarget.value?.id ?? null,
    })
    localStorage.setItem('personblog_comment_nickname', detailCommentForm.nickname.trim())
    localStorage.setItem('personblog_comment_email', detailCommentForm.email.trim())
    localStorage.setItem('personblog_comment_website', detailCommentForm.website.trim())
    detailCommentForm.content = ''
    cancelArticleReply()
    ElMessage.success('评论提交成功')
    await loadArticleComments()
  } catch (err) {
    ElMessage.error(err?.message || '评论提交失败')
  } finally {
    detailCommentSubmitting.value = false
  }
}

function startArticleReply(root, target) {
  articleReplyRoot.value = root
  articleReplyTarget.value = target
}

function cancelArticleReply() {
  articleReplyRoot.value = null
  articleReplyTarget.value = null
}

function resolveCoverUrl(post) {
  return post.coverUrl || post.coverPage || post.thumbnail || '/img/bac2.jpg'
}

function resolveCategory(post) {
  return post.tags?.[0]?.name || '未分类'
}

function formatDate(value) {
  if (!value) return '-'
  return String(value).replace(/-/g, '.').slice(0, 16)
}

function displayAvatarText(name = '') {
  return name.trim().slice(0, 1) || '访'
}

function textToHtml(text = '') {
  return String(text)
    .split(/\n+/)
    .filter(Boolean)
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join('')
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

onMounted(() => {
  if (typeof route.query.q === 'string') {
    query.keyword = route.query.q
  }
  loadArticles()
})

watch(
  () => route.query.q,
  (value) => {
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
.post-card:focus-within {
  box-shadow:
    inset 3px 0 0 var(--blog-link),
    var(--app-shadow-card, 0 10px 24px rgba(15, 23, 42, 0.06));
  transform: translateY(-1px);
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

.detail-head p,
.detail-head span {
  margin: 0;
  color: var(--app-text-muted);
  font-size: 13px;
}

.detail-head h2 {
  margin: 4px 0;
  color: var(--app-text-primary);
  line-height: 1.4;
}

.detail-cover {
  width: 100%;
  max-height: 360px;
  object-fit: cover;
  border-radius: 6px;
  margin-bottom: 14px;
}

.detail-summary {
  margin: 0 0 16px;
  padding: 10px 12px;
  color: var(--app-text-secondary);
  background: var(--app-surface-muted);
  border-left: 3px solid var(--blog-link);
}

.detail-body {
  color: var(--app-text-secondary);
  font-size: 16px;
  line-height: 1.85;
}

.detail-body :deep(img) {
  max-width: 100%;
  border-radius: 6px;
}

.detail-body :deep(pre) {
  padding: 14px;
  overflow: auto;
  color: #f8fafc;
  background: #282c34;
  border-radius: 6px;
}

.detail-comments {
  margin-top: 26px;
  padding-top: 18px;
  border-top: 1px solid var(--blog-divider);
}

.detail-comments-head,
.comment-actions,
.comment-meta,
.comment-pager {
  display: flex;
  align-items: center;
}

.detail-comments-head {
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.detail-comments-head h3 {
  margin: 0;
  color: var(--app-text-primary);
  font-size: 18px;
}

.comment-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}

.comment-fields {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.comment-actions {
  justify-content: flex-end;
  gap: 10px;
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.comment-item {
  padding: 12px 0;
  border-bottom: 1px solid var(--blog-divider);
}

.comment-main {
  display: grid;
  thead-template-columns: 42px minmax(0, 1fr);
  gap: 10px;
}

.reply-list {
  margin: 10px 0 0 52px;
  padding: 8px 0 0 12px;
  border-left: 2px solid var(--blog-divider);
}

.reply-main {
  grid-template-columns: 34px minmax(0, 1fr);
  padding: 8px 0;
}

.comment-content {
  min-width: 0;
}

.comment-meta {
  flex-wrap: wrap;
  gap: 6px 10px;
  color: var(--app-text-muted);
  font-size: 13px;
}

.comment-meta strong {
  color: var(--app-text-primary);
}

.comment-content p {
  margin: 6px 0;
  color: var(--app-text-secondary);
  line-height: 1.7;
  word-break: break-word;
}

.comment-content button {
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--blog-link);
  cursor: pointer;
}

.comment-pager {
  justify-content: flex-end;
  padding-top: 12px;
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

  .comment-fields {
    grid-template-columns: 1fr;
  }

  .reply-list {
    margin-left: 18px;
  }
}
</style>