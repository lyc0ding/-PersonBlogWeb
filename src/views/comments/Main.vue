<template>
  <div class="guestbook-page">

    <div class="guestbook-layout">
      <main class="guestbook-main">
        <section class="message-composer" aria-label="发布留言">
          <div class="section-heading">
            <div>
              <p>LEAVE A MESSAGE</p>
              <h2>留下你的留言</h2>
            </div>
          </div>

          <div class="composer-toolbar">
            <CommentEmojiPicker @select="insertEmoji" />
            <span class="composer-toolbar__hint">支持在正文中插入表情，也可以给留言点赞式回应</span>
          </div>

          <textarea
            ref="contentInput"
            v-model="form.content"
            class="message-textarea"
            maxlength="2000"
            placeholder="分享一个问题、建议或最近想聊的话题"
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
            <label class="field-item field-item--avatar">
              <span><el-icon><Picture /></el-icon>头像</span>
              <div class="avatar-field">
                <CommentAvatar :src="composerAvatarSrc" :name="form.nickname" size="sm" />
                <div class="avatar-picker">
                  <div class="avatar-picker__controls">
                    <input
                      v-model="form.avatar"
                      type="text"
                      maxlength="255"
                      readonly
                      placeholder="请选择本地头像图片，可留空"
                    >
                    <input
                      ref="avatarInput"
                      class="avatar-picker__file"
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      @change="handleAvatarChange"
                    >
                    <el-button plain @click="chooseAvatar">
                      选择
                    </el-button>
                    <el-button v-if="form.avatar" text @click="clearAvatar">
                      清除
                    </el-button>
                  </div>
                </div>
              </div>
            </label>
          </div>

          <div class="composer-actions">
            <span>{{ form.content.length }}/2000</span>
            <el-button type="primary" :loading="submitting" @click="submitComment">
              <el-icon><Promotion /></el-icon>
              发布留言
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
              <CommentAvatar
                :src="resolveAvatar(message)"
                :name="message.nickname"
                size="md"
                @click="previewAvatar()"
              />

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

                <CommentReactionBar :comment-id="message.id" />

                <div class="message-tools">
                  <span><el-icon><Location /></el-icon>{{ displayLocation(message) }}</span>
                  <button type="button" @click="openInlineReply(message, null)">回复</button>
                </div>

                <!-- 内嵌回复框 -->
                <div v-if="inlineReplyTarget && inlineReplyRoot.id === message.id" class="inline-reply-box">
                  <div class="inline-reply-header">
                    <el-icon><ChatDotRound /></el-icon>
                    <span>回复 @{{ inlineReplyTarget.nickname }}</span>
                  </div>
                  <textarea
                    v-model="inlineForm.content"
                    class="inline-textarea"
                    maxlength="2000"
                    placeholder="写下你的回复"
                  />
                  <div class="inline-reply-actions">
                    <span>{{ inlineForm.content.length }}/2000</span>
                    <div>
                      <el-button text @click="closeInlineReply">取消</el-button>
                      <el-button type="primary" :loading="inlineSubmitting" @click="submitInlineReply">
                        发布回复
                      </el-button>
                    </div>
                  </div>
                </div>

                <div v-if="message.replyList?.length" class="reply-list">
                  <article
                    v-for="reply in visibleReplies(message)"
                    :key="reply.id"
                    class="reply-item"
                  >
                    <CommentAvatar
                      :src="resolveAvatar(reply)"
                      :name="reply.nickname"
                      size="sm"
                    />
                    <div class="reply-content">
                      <div class="reply-meta">
                        <strong>{{ reply.nickname }}</strong>
                        <span>回复 @{{ reply.replyToNickname || message.nickname }}</span>
                        <time>{{ formatDate(reply.createTime) }}</time>
                      </div>
                      <p>{{ reply.content }}</p>
                      <CommentReactionBar :comment-id="reply.id" />
                      <div class="message-tools">
                        <span><el-icon><Location /></el-icon>{{ displayLocation(reply) }}</span>
                        <button type="button" @click="openInlineReply(message, reply)">回复</button>
                      </div>
                    </div>
                  </article>

                  <button
                    v-if="message.replyList.length > replyPreviewLimit"
                    class="reply-toggle"
                    type="button"
                    @click="toggleReply(message.id)"
                  >
                    {{ message.isExpanded ? '收起回复' : `展开其余 ${message.replyList.length - replyPreviewLimit} 条回复` }}
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
            <p>写下想法、问题或一句问候。这里会按时间展示公开留言，也可以直接回复某一条消息。</p>
          </div>
        </section>

        <section class="side-panel">
          <h3>留言规则</h3>
          <ul class="rule-list">
            <li>昵称、邮箱和内容为必填项。</li>
            <li>请保持话题清晰，避免重复提交。</li>
            <li>网站地址会作为个人主页链接展示。</li>
            <li>头像可选择本地图片，发布时上传并保存在本机资料中。</li>
            <li>可对留言添加表情反应，同一设备仅保留一个反应。</li>
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
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  ChatDotRound,
  Close,
  Link,
  Location,
  Message,
  Picture,
  Promotion,
  Refresh,
  User,
} from '@element-plus/icons-vue'
import { uploadImageService, resolveUploadUrl } from '@/api/admin/upload'
import {
  commentGuestbookStatsService,
  commentPageService,
  commentSubmitService,
} from '@/api/comment'
import CommentAvatar from '@/components/comment/CommentAvatar.vue'
import CommentEmojiPicker from '@/components/comment/CommentEmojiPicker.vue'
import CommentReactionBar from '@/components/comment/CommentReactionBar.vue'
import {
  loadCommentProfile,
  resolveCommentAvatar,
  saveCommentProfile,
} from '@/utils/commentProfile'
import ImagePreviewer from '@/components/image/ImagePreviewer.vue'

const replyPreviewLimit = 1
const loading = ref(false)
const submitting = ref(false)
const inlineSubmitting = ref(false)
const error = ref('')
const total = ref(0)
const messageContents = ref([])
const contentInput = ref(null)
const avatarInput = ref(null)
const selectedAvatarFile = ref(null)
const avatarPreviewUrl = ref('')
const showBigAvatar = ref(false)

// 内嵌回复状态
const inlineReplyRoot = ref(null)
const inlineReplyTarget = ref(null)
const inlineForm = reactive({
  content: ''
})

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

const savedProfile = loadCommentProfile()

const form = reactive({
  content: '',
  nickname: savedProfile.nickname,
  email: savedProfile.email,
  website: savedProfile.website,
  avatar: savedProfile.avatar,
})

const composerAvatarSrc = computed(() => avatarPreviewUrl.value || form.avatar)

const localReplyCount = computed(() => {
  return messageContents.value.reduce((count, item) => count + (item.replyList?.length || 0), 0)
})

// 打开内嵌回复
function openInlineReply(root, target) {
  inlineReplyRoot.value = root
  inlineReplyTarget.value = target || root
  inlineForm.content = ''
}

// 关闭内嵌回复
function closeInlineReply() {
  inlineReplyRoot.value = null
  inlineReplyTarget.value = null
  inlineForm.content = ''
}

// 提交内嵌回复
async function submitInlineReply() {
  const content = inlineForm.content.trim()
  const nickname = form.nickname?.trim()
  const email = form.email?.trim()

  if (!content) {
    ElMessage.warning('请填写回复内容')
    return
  }
  if (!nickname) {
    ElMessage.warning('请先在顶部填写昵称')
    return
  }

  inlineSubmitting.value = true
  try {
    await commentSubmitService({
      content,
      nickname,
      email,
      website: normalizeWebsite(form.website),
      avatar: form.avatar,
      parentId: inlineReplyRoot.value.id,
      replyToId: inlineReplyTarget.value.id,
    })
    saveCommentProfile({ nickname, email, website: form.website, avatar: form.avatar })
    ElMessage.success('回复发布成功')
    closeInlineReply()
    await refreshGuestbook()
  } catch (err) {
    ElMessage.error(readErrorMessage(err, '回复提交失败'))
  } finally {
    inlineSubmitting.value = false
  }
}

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

// 顶部发布留言（原逻辑不变）
async function submitComment() {
  const content = form.content.trim()
  const nickname = form.nickname.trim()
  const email = form.email.trim()
  const website = normalizeWebsite(form.website)
  let avatar = form.avatar.trim()

  if (!content) {
    ElMessage.warning('请填写留言内容')
    return
  }
  if (!nickname) {
    ElMessage.warning('请填写昵称')
    return
  }

  submitting.value = true
  try {
    if (selectedAvatarFile.value) {
      avatar = await uploadAvatar(selectedAvatarFile.value)
      form.avatar = avatar
      selectedAvatarFile.value = null
      revokeAvatarPreview()
      if (avatarInput.value) {
        avatarInput.value.value = ''
      }
    }
    await commentSubmitService({
      content,
      nickname,
      email,
      website,
      avatar,
      parentId: 0,
      replyToId: null,
    })
    saveCommentProfile({ nickname, email, website, avatar })
    form.content = ''
    form.website = website
    form.avatar = avatar
    ElMessage.success('留言发布成功')
    await refreshGuestbook()
  } catch (err) {
    ElMessage.error(readErrorMessage(err, '留言提交失败，请检查后端接口'))
  } finally {
    submitting.value = false
  }
}

async function uploadAvatar(file) {
  const res = await uploadImageService(file, 'avatar')
  const url = resolveUploadUrl(res)
  if (!url) {
    throw new Error('头像上传失败，服务端未返回图片路径')
  }
  return normalizeUploadPath(url)
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

function insertEmoji(emoji) {
  const el = contentInput.value
  if (!el) {
    form.content += emoji
    return
  }
  const start = el.selectionStart ?? form.content.length
  const end = el.selectionEnd ?? form.content.length
  form.content = `${form.content.slice(0, start)}${emoji}${form.content.slice(end)}`
  nextTick(() => {
    const caret = start + emoji.length
    el.focus()
    el.setSelectionRange(caret, caret)
  })
}

function chooseAvatar() {
  avatarInput.value?.click()
}

function handleAvatarChange(event) {
  const file = event.target.files?.[0]
  if (!file) return
  if (!/^image\//.test(file.type)) {
    ElMessage.warning('请选择图片文件')
    event.target.value = ''
    return
  }
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    ElMessage.warning('头像图片不能超过 5MB')
    event.target.value = ''
    return
  }

  selectedAvatarFile.value = file
  form.avatar = buildAvatarDisplayPath(file)
  revokeAvatarPreview()
  avatarPreviewUrl.value = URL.createObjectURL(file)
}

function clearAvatar() {
  selectedAvatarFile.value = null
  form.avatar = ''
  revokeAvatarPreview()
  if (avatarInput.value) {
    avatarInput.value.value = ''
  }
}

function buildAvatarDisplayPath(file) {
  const path = file.webkitRelativePath || file.name
  return path.startsWith('.') || path.startsWith('/') ? path : `./${path}`
}

function normalizeUploadPath(value = '') {
  if (!value) return ''
  let path = String(value).trim().replace(/\\/g, '/')
  path = path.replace(/\/+/g, '/')
  if (!path.startsWith('/')) {
    path = '/' + path
  }
  return path
}

function revokeAvatarPreview() {
  if (avatarPreviewUrl.value) {
    URL.revokeObjectURL(avatarPreviewUrl.value)
    avatarPreviewUrl.value = ''
  }
}

function resolveAvatar(item) {
  return resolveCommentAvatar(item)
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
onBeforeUnmount(revokeAvatarPreview)
</script>

<style scoped>
.guestbook-page {
  width: var(--blog-content-width);
  margin: 0 auto;
  padding: 0 0 56px;
}

.eyebrow,
.section-heading p {
  margin: 0;
  color: var(--blog-meta);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.14em;
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

.composer-toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 10px;
}

.composer-toolbar__hint {
  color: var(--app-text-muted);
  font-size: 12px;
}

.composer-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
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

.avatar-field {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr);
  gap: 10px;
  align-items: start;
}

.avatar-picker {
  min-width: 0;
}

.avatar-picker__controls {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  gap: 8px;
  align-items: center;
}

.avatar-picker__file {
  display: none;
}

.avatar-picker__controls :deep(.el-button + .el-button) {
  margin-left: 0;
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

/* 内嵌回复框样式 */
.inline-reply-box {
  margin: 12px 0 0;
  padding: 12px;
  background: var(--app-surface-muted);
  border: 1px solid var(--blog-divider);
  border-radius: 8px;
}
.inline-reply-header {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  color: var(--blog-link);
  font-size: 14px;
}
.inline-textarea {
  width: 100%;
  min-height: 80px;
  padding: 10px 12px;
  border: 1px solid var(--blog-input-border);
  background: var(--app-surface);
  color: var(--app-text-primary);
  font: inherit;
  line-height: 1.6;
  box-sizing: border-box;
  border-radius: 6px;
  resize: vertical;
}
.inline-textarea:focus {
  outline: none;
  border-color: var(--blog-link);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--blog-link) 14%, transparent);
}
.inline-reply-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 12px;
  color: var(--app-text-muted);
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
  .guestbook-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .guestbook-page {
    padding-bottom: 42px;
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

  .avatar-picker__controls {
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .pager-wrap {
    justify-content: center;
    overflow-x: auto;
  }
}
</style>