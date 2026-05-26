<template>
  <div class="guestbook-page">
    <section class="guestbook-hero" aria-label="留言板概览">
      <div class="hero-copy">
        <p class="eyebrow">GUESTBOOK</p>
        <h1>留言板</h1>
        <p>
          写下想法、问题或一句问候。这里会按时间展示公开留言，也可以直接回复某一条消息。
        </p>
      </div>
      <div class="hero-stats" aria-label="留言统计">
        <div>
          <strong>{{ displayNumber(stats.messageCount, total) }}</strong>
          <span>公开留言</span>
        </div>
        <div>
          <strong>{{ displayNumber(stats.replyCount, localReplyCount) }}</strong>
          <span>回复讨论</span>
        </div>
        <div>
          <strong>{{ displayNumber(stats.participantCount, '-') }}</strong>
          <span>参与访客</span>
        </div>
      </div>
    </section>

    <div class="guestbook-layout">
      <main class="guestbook-main">
        <section class="message-composer" aria-label="发布留言">
          <div class="section-heading">
            <div>
              <p>LEAVE A MESSAGE</p>
              <h2>{{ replyTarget ? `回复 ${replyTarget.nickname}` : '留下你的留言' }}</h2>
            </div>
            <el-button v-if="replyTarget" text @click="cancelReply">
              <el-icon><Close /></el-icon>
              取消回复
            </el-button>
          </div>

          <div v-if="replyTarget" class="reply-banner">
            <el-icon><ChatDotRound /></el-icon>
            <span>正在回复 @{{ replyTarget.nickname }}</span>
          </div>

          <textarea
            ref="contentInput"
            v-model="form.content"
            class="message-textarea"
            maxlength="2000"
            :placeholder="replyTarget ? `回复 @${replyTarget.nickname}，写下你的想法` : '分享一个问题、建议或最近想聊的话题'"
          />

          <div class="composer-fields">
            <label class="field-item">
              <span><el-icon><User /></el-icon>昵称</span>
              <input v-model="form.nickname" type="text" maxlength="64" autocomplete="nickname" placeholder="你的称呼">
            </label>
            <label class="field-item">
              <span><el-icon><Message /></el-icon>邮箱</span>
              <input v-model="form.email" type="email" maxlength="128" autocomplete="email" placeholder="仅用于必要联系">
            </label>
            <label class="field-item">
              <span><el-icon><Link /></el-icon>网站</span>
              <input v-model="form.website" type="url" maxlength="255" placeholder="https://example.com">
            </label>
          </div>

          <div class="composer-actions">
            <span>{{ form.content.length }}/2000</span>
            <el-button type="primary" :loading="submitting" @click="submitComment">
              <el-icon><Promotion /></el-icon>
              {{ replyTarget ? '发布回复' : '发布留言' }}
            </el-button>
          </div>
        </section>

        <section class="message-stream" aria-label="最新留言">
          <div class="section-heading stream-heading">
            <div>
              <p>RECENT MESSAGES</p>
              <h2>最新留言</h2>
            </div>
            <el-button text :loading="loading" @click="refreshGuestbook">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>

          <el-alert
            v-if="error"
            :title="error"
            type="error"
            show-icon
            :closable="false"
            class="message-error"
          />

          <el-skeleton v-if="loading && !messageContents.length" :rows="6" animated />
          <el-empty v-else-if="!messageContents.length" description="暂无留言，先坐下写第一条吧" />

          <div v-else class="message-list">
            <article v-for="message in messageContents" :key="message.id" class="message-card">
              <div class="avatar" :title="message.nickname">{{ displayAvatarText(message.nickname) }}</div>

              <div class="message-content">
                <div class="message-meta">
                  <div>
                    <strong>{{ message.nickname }}</strong>
                    <a v-if="message.website" :href="normalizeWebsite(message.website)" target="_blank" rel="noopener noreferrer">
                      主页
                    </a>
                  </div>
                  <time>{{ formatDate(message.createTime) }}</time>
                </div>

                <p class="message-body">{{ message.content }}</p>

                <div class="message-tools">
                  <span><el-icon><Location /></el-icon>{{ displayLocation(message) }}</span>
                  <button type="button" @click="startReply(message, message)">回复</button>
                </div>

                <div v-if="message.replyList?.length" class="reply-list">
                  <article
                    v-for="reply in visibleReplies(message)"
                    :key="reply.id"
                    class="reply-item"
                  >
                    <div class="avatar avatar--small" :title="reply.nickname">
                      {{ displayAvatarText(reply.nickname) }}
                    </div>
                    <div class="reply-content">
                      <div class="reply-meta">
                        <strong>{{ reply.nickname }}</strong>
                        <span>回复 @{{ reply.replyToNickname || message.nickname }}</span>
                        <time>{{ formatDate(reply.createTime) }}</time>
                      </div>
                      <p>{{ reply.content }}</p>
                      <div class="message-tools">
                        <span><el-icon><Location /></el-icon>{{ displayLocation(reply) }}</span>
                        <button type="button" @click="startReply(message, reply)">回复</button>
                      </div>
                    </div>
                  </article>

                  <button
                    v-if="message.replyList.length > replyPreviewLimit"
                    class="reply-toggle"
                    type="button"
                    @click="toggleReply(message.id)"
                  >
                    {{ message.isExpanded ? '收起回复' : `展开全部 ${message.replyList.length} 条回复` }}
                  </button>
                </div>
              </div>
            </article>
          </div>

          <div class="pager-wrap" v-if="total > query.pageSize">
            <el-pagination
              v-model:current-page="query.pageNum"
              v-model:page-size="query.pageSize"
              background
              layout="total, prev, pager, next"
              :total="total"
              @current-change="loadComments"
            />
          </div>
        </section>
      </main>

      <aside class="guestbook-aside" aria-label="留言板信息">
        <section class="side-panel profile-panel">
          <img src="/logo.png" alt="Lycoding" class="profile-logo">
          <div>
            <p class="eyebrow">ABOUT</p>
            <h2>Lycoding</h2>
            <p>欢迎在这里交流技术、博客内容和生活片段。</p>
          </div>
        </section>

        <section class="side-panel">
          <h3>留言规则</h3>
          <ul class="rule-list">
            <li>昵称、邮箱和内容为必填项。</li>
            <li>请保持话题清晰，避免重复提交。</li>
            <li>网站地址会作为个人主页链接展示。</li>
          </ul>
        </section>

        <section class="side-panel">
          <h3>更新状态</h3>
          <dl class="state-list">
            <div>
              <dt>最新留言</dt>
              <dd>{{ formatDate(stats.latestTime) }}</dd>
            </div>
            <div>
              <dt>每页展示</dt>
              <dd>{{ query.pageSize }} 条</dd>
            </div>
          </dl>
        </section>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  ChatDotRound,
  Close,
  Link,
  Location,
  Message,
  Promotion,
  Refresh,
  User,
} from '@element-plus/icons-vue'
import {
  commentGuestbookStatsService,
  commentPageService,
  commentSubmitService,
} from '@/api/comment'

const replyPreviewLimit = 2
const loading = ref(false)
const submitting = ref(false)
const error = ref('')
const total = ref(0)
const messageContents = ref([])
const replyTarget = ref(null)
const replyRoot = ref(null)
const contentInput = ref(null)

const query = reactive({
  pageNum: 1,
  pageSize: 8,
})

const stats = reactive({
  messageCount: null,
  replyCount: null,
  participantCount: null,
  latestTime: '',
})

const form = reactive({
  content: '',
  nickname: localStorage.getItem('personblog_comment_nickname') || '',
  email: localStorage.getItem('personblog_comment_email') || '',
  website: localStorage.getItem('personblog_comment_website') || '',
})

const localReplyCount = computed(() => {
  return messageContents.value.reduce((count, item) => count + (item.replyList?.length || 0), 0)
})

async function refreshGuestbook() {
  await Promise.all([loadComments(), loadStats()])
}

async function loadComments() {
  loading.value = true
  error.value = ''
  try {
    const res = await commentPageService({ ...query })
    const page = res?.data ?? res ?? {}
    const list = page.records ?? page.list ?? []
    messageContents.value = list.map((item) => {
      const replyList = item.replyList ?? []
      return {
        ...item,
        isExpanded: replyList.length <= replyPreviewLimit,
        replyList,
      }
    })
    total.value = page.total ?? messageContents.value.length
  } catch (err) {
    messageContents.value = []
    total.value = 0
    error.value = readErrorMessage(err, '留言加载失败，请确认后端 `/comment/page` 可访问。')
  } finally {
    loading.value = false
  }
}

async function loadStats() {
  try {
    const res = await commentGuestbookStatsService()
    const data = res?.data ?? res ?? {}
    stats.messageCount = data.messageCount ?? null
    stats.replyCount = data.replyCount ?? null
    stats.participantCount = data.participantCount ?? null
    stats.latestTime = data.latestTime || ''
  } catch (err) {
    stats.messageCount = null
    stats.replyCount = null
    stats.participantCount = null
    stats.latestTime = ''
  }
}

async function submitComment() {
  const content = form.content.trim()
  const nickname = form.nickname.trim()
  const email = form.email.trim()
  const website = normalizeWebsite(form.website)

  if (!content) {
    ElMessage.warning('请填写留言内容')
    return
  }
  if (!nickname) {
    ElMessage.warning('请填写昵称')
    return
  }
  if (!email) {
    ElMessage.warning('请填写邮箱')
    return
  }
  if (!isEmail(email)) {
    ElMessage.warning('请填写有效邮箱')
    return
  }

  const isReplying = Boolean(replyTarget.value)
  submitting.value = true
  try {
    await commentSubmitService({
      content,
      nickname,
      email,
      website,
      parentId: replyRoot.value?.id ?? 0,
      replyToId: replyTarget.value?.id ?? null,
    })
    localStorage.setItem('personblog_comment_nickname', nickname)
    localStorage.setItem('personblog_comment_email', email)
    localStorage.setItem('personblog_comment_website', website)
    form.content = ''
    form.website = website
    cancelReply()
    if (!isReplying) {
      query.pageNum = 1
    }
    ElMessage.success(isReplying ? '回复发布成功' : '留言发布成功')
    await refreshGuestbook()
  } catch (err) {
    ElMessage.error(readErrorMessage(err, '留言提交失败，请检查后端接口'))
  } finally {
    submitting.value = false
  }
}

function startReply(root, target) {
  replyRoot.value = root
  replyTarget.value = target
  nextTick(() => {
    contentInput.value?.focus()
    contentInput.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })
}

function cancelReply() {
  replyRoot.value = null
  replyTarget.value = null
}

function toggleReply(messageId) {
  const message = messageContents.value.find((item) => item.id === messageId)
  if (message) {
    message.isExpanded = !message.isExpanded
  }
}

function visibleReplies(message) {
  if (message.isExpanded) {
    return message.replyList
  }
  return message.replyList.slice(0, replyPreviewLimit)
}

function displayAvatarText(name = '') {
  return name.trim().slice(0, 1).toUpperCase() || '访'
}

function displayLocation(item) {
  return item.ipLocation || item.ip || '未知位置'
}

function displayNumber(primary, fallback) {
  return primary === null || primary === undefined || primary === '' ? fallback : primary
}

function formatDate(value) {
  if (!value) return '-'
  return String(value).replace(/-/g, '.').slice(0, 16)
}

function normalizeWebsite(value = '') {
  const website = value.trim()
  if (!website) return ''
  if (/^https?:\/\//i.test(website)) return website
  return `https://${website}`
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function readErrorMessage(err, fallback) {
  return err?.message || err?.response?.data?.message || fallback
}

onMounted(refreshGuestbook)
</script>

<style scoped>
.guestbook-page {
  width: var(--blog-content-width);
  margin: 0 auto;
  padding: 0 0 56px;
}

.guestbook-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 0.55fr);
  gap: 28px;
  align-items: stretch;
  padding: 12px 0 28px;
  border-bottom: 1px solid var(--blog-divider);
}

.hero-copy {
  min-width: 0;
}

.eyebrow,
.section-heading p {
  margin: 0;
  color: var(--blog-meta);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.14em;
}

.hero-copy h1 {
  margin: 8px 0 12px;
  color: var(--app-text-primary);
  font-size: clamp(2.1rem, 5vw, 4.2rem);
  font-weight: 780;
  line-height: 1.05;
}

.hero-copy > p:last-child {
  max-width: 620px;
  margin: 0;
  color: var(--app-text-secondary);
  font-size: 16px;
  line-height: 1.9;
}

.hero-stats {
  display: grid;
  grid-template-columns: 1fr;
  border: 1px solid var(--blog-divider);
  background: var(--app-surface);
}

.hero-stats > div {
  min-height: 94px;
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-bottom: 1px solid var(--blog-divider);
}

.hero-stats > div:last-child {
  border-bottom: 0;
}

.hero-stats strong {
  color: var(--app-text-primary);
  font-size: 2rem;
  font-weight: 760;
  line-height: 1.1;
}

.hero-stats span {
  margin-top: 8px;
  color: var(--app-text-muted);
  font-size: 14px;
}

.guestbook-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: 32px;
  padding-top: 30px;
}

.guestbook-main {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.message-composer,
.message-stream,
.side-panel {
  background: var(--app-surface);
  border: 1px solid var(--blog-divider);
}

.message-composer,
.message-stream {
  padding: 22px;
}

.section-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 16px;
}

.section-heading h2 {
  margin: 4px 0 0;
  color: var(--app-text-primary);
  font-size: 1.3rem;
  font-weight: 700;
  line-height: 1.35;
}

.stream-heading {
  padding-bottom: 14px;
  border-bottom: 1px solid var(--blog-divider);
}

.reply-banner {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  max-width: 100%;
  margin-bottom: 12px;
  padding: 8px 10px;
  color: var(--blog-link);
  background: color-mix(in srgb, var(--blog-link) 9%, transparent);
  border: 1px solid color-mix(in srgb, var(--blog-link) 18%, transparent);
  font-size: 14px;
}

.message-textarea {
  width: 100%;
  min-height: 168px;
  display: block;
  padding: 14px 16px;
  resize: vertical;
  border: 1px solid var(--blog-input-border);
  background: var(--app-surface-muted);
  color: var(--app-text-primary);
  font: inherit;
  line-height: 1.75;
  box-sizing: border-box;
}

.message-textarea:focus,
.field-item input:focus {
  outline: none;
  border-color: var(--blog-link);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--blog-link) 14%, transparent);
}

.composer-fields {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 14px;
}

.field-item {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.field-item span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--app-text-muted);
  font-size: 13px;
}

.field-item input {
  width: 100%;
  height: 42px;
  padding: 0 12px;
  border: 1px solid var(--blog-input-border);
  background: var(--app-surface);
  color: var(--app-text-primary);
  font: inherit;
  box-sizing: border-box;
}

.composer-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 16px;
}

.composer-actions > span {
  color: var(--app-text-muted);
  font-size: 13px;
}

.message-error {
  margin-bottom: 14px;
}

.message-list {
  display: flex;
  flex-direction: column;
}

.message-card {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr);
  gap: 14px;
  padding: 20px 0;
  border-bottom: 1px solid var(--blog-divider);
}

.message-card:first-child {
  padding-top: 2px;
}

.message-card:last-child {
  border-bottom: 0;
  padding-bottom: 4px;
}

.avatar {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--blog-link) 24%, var(--blog-divider));
  border-radius: 50%;
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--blog-link) 16%, var(--app-surface)), var(--app-surface));
  color: var(--blog-link);
  font-size: 18px;
  font-weight: 700;
  user-select: none;
}

.avatar--small {
  width: 34px;
  height: 34px;
  font-size: 14px;
}

.message-content,
.reply-content {
  min-width: 0;
}

.message-meta,
.reply-meta,
.message-tools {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px 12px;
}

.message-meta {
  justify-content: space-between;
}

.message-meta > div {
  min-width: 0;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.message-meta strong,
.reply-meta strong {
  color: var(--app-text-primary);
  font-size: 15px;
}

.message-meta a {
  color: var(--blog-link);
  font-size: 13px;
  text-decoration: none;
}

.message-meta time,
.reply-meta time,
.reply-meta span {
  color: var(--app-text-muted);
  font-size: 13px;
}

.message-body,
.reply-content p {
  margin: 8px 0 10px;
  color: var(--app-text-secondary);
  font-size: 15px;
  line-height: 1.8;
  white-space: pre-wrap;
  word-break: break-word;
}

.message-tools {
  color: var(--app-text-muted);
  font-size: 13px;
}

.message-tools span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.message-tools button,
.reply-toggle {
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--blog-link);
  font: inherit;
  font-size: 13px;
  cursor: pointer;
}

.message-tools button:hover,
.reply-toggle:hover {
  color: var(--blog-link-hover);
}

.reply-list {
  margin-top: 14px;
  padding-left: 16px;
  border-left: 2px solid var(--blog-divider);
}

.reply-item {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr);
  gap: 10px;
  padding: 12px 0;
}

.reply-item + .reply-item {
  border-top: 1px solid var(--app-divider-subtle);
}

.reply-toggle {
  margin-top: 4px;
}

.pager-wrap {
  display: flex;
  justify-content: flex-end;
  padding-top: 18px;
  border-top: 1px solid var(--blog-divider);
}

.guestbook-aside {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.side-panel {
  padding: 18px;
}

.profile-panel {
  display: grid;
  grid-template-columns: 58px minmax(0, 1fr);
  gap: 14px;
  align-items: start;
}

.profile-logo {
  width: 58px;
  height: 58px;
  display: block;
  border: 1px solid var(--blog-divider);
  border-radius: 8px;
  object-fit: cover;
  background: var(--app-surface-muted);
}

.side-panel h2,
.side-panel h3 {
  margin: 0;
  color: var(--app-text-primary);
  line-height: 1.35;
}

.side-panel h2 {
  margin-top: 4px;
  font-size: 1.1rem;
}

.side-panel h3 {
  font-size: 1rem;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--blog-divider);
}

.side-panel p {
  margin: 8px 0 0;
  color: var(--app-text-secondary);
  font-size: 14px;
  line-height: 1.75;
}

.rule-list {
  margin: 12px 0 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 10px;
}

.rule-list li {
  position: relative;
  padding-left: 14px;
  color: var(--app-text-secondary);
  font-size: 14px;
  line-height: 1.65;
}

.rule-list li::before {
  content: '';
  position: absolute;
  top: 0.75em;
  left: 0;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--blog-link);
}

.state-list {
  margin: 12px 0 0;
}

.state-list div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 9px 0;
  border-bottom: 1px solid var(--app-divider-subtle);
}

.state-list div:last-child {
  border-bottom: 0;
}

.state-list dt,
.state-list dd {
  margin: 0;
  font-size: 14px;
}

.state-list dt {
  color: var(--app-text-muted);
}

.state-list dd {
  color: var(--app-text-primary);
  text-align: right;
}

@media (max-width: 1020px) {
  .guestbook-hero,
  .guestbook-layout {
    grid-template-columns: 1fr;
  }

  .hero-stats {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .hero-stats > div {
    border-right: 1px solid var(--blog-divider);
    border-bottom: 0;
  }

  .hero-stats > div:last-child {
    border-right: 0;
  }
}

@media (max-width: 720px) {
  .guestbook-page {
    padding-bottom: 42px;
  }

  .guestbook-hero {
    gap: 20px;
    padding-bottom: 22px;
  }

  .hero-stats,
  .composer-fields {
    grid-template-columns: 1fr;
  }

  .hero-stats > div {
    min-height: 76px;
    border-right: 0;
    border-bottom: 1px solid var(--blog-divider);
  }

  .hero-stats > div:last-child {
    border-bottom: 0;
  }

  .message-composer,
  .message-stream,
  .side-panel {
    padding: 16px;
  }

  .section-heading,
  .composer-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .message-card {
    grid-template-columns: 40px minmax(0, 1fr);
    gap: 10px;
  }

  .avatar {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }

  .avatar--small {
    width: 30px;
    height: 30px;
    font-size: 13px;
  }

  .message-meta {
    align-items: flex-start;
    flex-direction: column;
    gap: 4px;
  }

  .reply-list {
    padding-left: 12px;
  }

  .reply-item {
    grid-template-columns: 30px minmax(0, 1fr);
  }

  .pager-wrap {
    justify-content: center;
    overflow-x: auto;
  }
}
</style>
