<template>
  <div class="article-detail-page">
    <div class="detail-shell">
      <el-button class="back-link" link @click="goBack">
        <i class="iconfont icon-zuojiantou" aria-hidden="true"></i>
        返回文章列表
      </el-button>

      <el-alert
        v-if="error"
        :title="error"
        type="error"
        show-icon
        :closable="false"
      />

      <el-skeleton v-if="loading" :rows="10" animated />

      <template v-else-if="detail.id">
        <article class="article-detail">
          <header class="detail-hero">
            <div class="hero-copy">
              <p class="detail-kind">{{ detail.type === 'shuoshuo' ? '朋友圈文章' : 'BLOG ARTICLE' }}</p>
              <h1>{{ detail.title || '无标题文章' }}</h1>
              <p v-if="detail.summary" class="detail-summary">{{ detail.summary }}</p>

              <ul class="detail-meta" aria-label="文章信息">
                <li>
                  <i class="iconfont icon-shuohuaren" aria-hidden="true"></i>
                  Lycoding
                </li>
                <li>
                  <i class="iconfont icon-rili" aria-hidden="true"></i>
                  {{ formatDate(detail.publishTime || detail.createTime) }}
                </li>
                <li v-if="detail.categoryName || resolveCategory(detail)">
                  <i class="iconfont icon-biaoqian" aria-hidden="true"></i>
                  {{ detail.categoryName || resolveCategory(detail) }}
                </li>
                <li>
                  <i class="iconfont icon-comments" aria-hidden="true"></i>
                  {{ detailCommentTotal }} 评论
                </li>
              </ul>
            </div>

            <figure class="hero-cover">
              <img :src="resolveCoverUrl(detail)" :alt="detail.title || '文章封面'">
            </figure>
          </header>

          <section class="content-panel">
            <article class="detail-body" v-html="detail.contentHtml || textToHtml(detail.contentText || detail.summary)" />
          </section>
        </article>

        <section class="detail-comments" aria-label="文章评论">
          <div class="detail-comments-head">
            <div>
              <p>COMMENTS</p>
              <h2>评论 {{ detailCommentTotal }}</h2>
            </div>
            <el-button link :loading="detailCommentLoading" @click="loadArticleComments()">刷新</el-button>
          </div>

          <div class="comment-form">
            <el-input
              v-model="detailCommentForm.content"
              type="textarea"
              :rows="4"
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
                <el-avatar :size="38">{{ displayAvatarText(comment.nickname) }}</el-avatar>
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
      </template>

      <el-empty v-else description="文章不存在或已下线" />
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { publicArticleDetailService } from '@/api/article'
import { commentPageService, commentSubmitService } from '@/api/comment'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const error = ref('')
const detail = ref({})
const detailComments = ref([])
const detailCommentTotal = ref(0)
const detailCommentLoading = ref(false)
const detailCommentSubmitting = ref(false)
const articleReplyTarget = ref(null)
const articleReplyRoot = ref(null)

const detailCommentQuery = reactive({
  pageNum: 1,
  pageSize: 6,
})

const detailCommentForm = reactive({
  content: '',
  nickname: localStorage.getItem('personblog_comment_nickname') || '',
  email: localStorage.getItem('personblog_comment_email') || '',
  website: localStorage.getItem('personblog_comment_website') || '',
})

async function loadArticleDetail() {
  const id = route.params.id
  if (!id) return

  loading.value = true
  error.value = ''
  detail.value = {}
  try {
    const res = await publicArticleDetailService(id)
    detail.value = res?.data ?? res ?? {}
    detailCommentQuery.pageNum = 1
    cancelArticleReply()
    await loadArticleComments(detail.value.id || id)
  } catch (err) {
    detail.value = {}
    error.value = err?.message || '文章详情加载失败。'
  } finally {
    loading.value = false
  }
}

async function loadArticleComments(articleId = detail.value?.id || route.params.id) {
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
  const articleId = detail.value?.id || route.params.id
  if (!articleId) return
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
      articleId,
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
    await loadArticleComments(articleId)
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

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push({ name: 'Articles' })
  }
}

function resolveCoverUrl(post) {
  return post.coverUrl || post.coverPage || post.thumbnail || '/img/bac2.jpg'
}

function resolveCategory(post) {
  const tagName = post.tags?.[0]?.name
  return tagName != null ? `#${tagName}` : ''
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

onMounted(loadArticleDetail)

watch(
  () => route.params.id,
  () => loadArticleDetail()
)
</script>

<style scoped>
.article-detail-page {
  width: 100%;
  padding: 22px 16px 46px;
}

.detail-shell {
  width: min(980px, 100%);
  margin: 0 auto;
}

.back-link {
  margin-bottom: 14px;
  padding-left: 0;
  color: var(--app-text-secondary);
}

.back-link .iconfont {
  margin-right: 5px;
  font-size: 13px;
}

.article-detail,
.detail-comments {
  background: var(--app-surface);
  border: 1px solid var(--blog-card-border);
  border-radius: 8px;
  box-shadow: var(--app-shadow-card, 0 10px 28px rgba(15, 23, 42, 0.05));
}

.article-detail {
  overflow: hidden;
}

.detail-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(250px, 36%);
  gap: 24px;
  align-items: stretch;
  min-height: 310px;
  padding: 28px;
  border-bottom: 1px solid var(--blog-divider);
  background:
    linear-gradient(115deg, color-mix(in srgb, var(--blog-link) 8%, transparent), transparent 52%),
    var(--app-surface);
}

.hero-copy {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
}

.detail-kind {
  margin: 0 0 10px;
  color: var(--blog-link);
  font-size: 13px;
  font-weight: 750;
  letter-spacing: 0;
}

.detail-hero h1 {
  margin: 0;
  color: var(--app-text-primary);
  font-size: 2.15rem;
  font-weight: 780;
  line-height: 1.28;
  letter-spacing: 0;
  word-break: break-word;
}

.detail-summary {
  margin: 16px 0 0;
  color: var(--app-text-secondary);
  font-size: 15px;
  line-height: 1.85;
}

.detail-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 18px;
  padding: 0;
  margin: 24px 0 0;
  list-style: none;
  color: var(--blog-meta);
  font-size: 13px;
}

.detail-meta li {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.detail-meta .iconfont {
  color: var(--blog-link);
  font-size: 14px;
}

.hero-cover {
  min-width: 0;
  margin: 0;
  overflow: hidden;
  background: var(--app-surface-muted);
  border: 1px solid var(--blog-card-border);
  border-radius: 8px;
}

.hero-cover img {
  display: block;
  width: 100%;
  height: 100%;
  min-height: 250px;
  object-fit: cover;
}

.content-panel {
  padding: 32px;
}

.detail-body {
  max-width: 780px;
  margin: 0 auto;
  color: var(--app-text-secondary);
  font-size: 16px;
  line-height: 1.9;
  word-break: break-word;
}

.detail-body :deep(p) {
  margin: 0 0 1.05em;
}

.detail-body :deep(h1),
.detail-body :deep(h2),
.detail-body :deep(h3) {
  color: var(--app-text-primary);
  line-height: 1.45;
}

.detail-body :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
}

.detail-body :deep(pre) {
  padding: 14px;
  overflow: auto;
  color: #f8fafc;
  background: var(--app-code-header-bg);
  border-radius: 8px;
}

.detail-comments {
  margin-top: 18px;
  padding: 22px;
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
  margin-bottom: 16px;
}

.detail-comments-head p {
  margin: 0 0 4px;
  color: var(--blog-link);
  font-size: 12px;
  font-weight: 750;
  letter-spacing: 0;
}

.detail-comments-head h2 {
  margin: 0;
  color: var(--app-text-primary);
  font-size: 20px;
}

.comment-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-bottom: 18px;
  border-bottom: 1px solid var(--blog-divider);
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
  margin-top: 18px;
}

.comment-item {
  padding-bottom: 14px;
  border-bottom: 1px solid var(--blog-divider);
}

.comment-main {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);
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
  padding-top: 14px;
}

@media (max-width: 760px) {
  .article-detail-page {
    padding: 16px 14px 38px;
  }

  .detail-hero {
    grid-template-columns: 1fr;
    padding: 20px;
  }

  .detail-hero h1 {
    font-size: 1.68rem;
  }

  .content-panel {
    padding: 22px 18px;
  }

  .comment-fields {
    grid-template-columns: 1fr;
  }

  .detail-comments {
    padding: 18px;
  }

  .reply-list {
    margin-left: 18px;
  }
}
</style>
