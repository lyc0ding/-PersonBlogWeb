<template>
  <div class="about-page">
    <el-skeleton v-if="loading" animated :rows="8" class="about-loading" />

    <template v-else>
      <el-empty v-if="unavailable" description="关于页面暂未开放" class="about-empty" />

      <template v-else>
      <header class="about-hero">
        <img v-if="about.coverUrl" :src="about.coverUrl" alt="" class="hero-cover">
        <div class="hero-content">
          <div class="profile">
            <img v-if="about.avatarUrl" :src="about.avatarUrl" alt="" class="avatar">
            <div class="profile-copy">
              <p class="eyebrow">ABOUT</p>
              <h1>{{ about.title || '关于' }}</h1>
              <p class="subtitle">{{ about.subtitle || about.roleTitle || '记录技术与生活的个人博客' }}</p>
            </div>
          </div>
        </div>
      </header>

      <main class="about-layout">
        <aside class="side-panel">
          <section class="identity">
            <h2>{{ about.ownerName || 'Lycoding' }}</h2>
            <p v-if="about.roleTitle">{{ about.roleTitle }}</p>
          </section>

          <dl class="meta-list">
            <template v-if="about.location">
              <dt>所在地</dt>
              <dd>{{ about.location }}</dd>
            </template>
            <template v-if="about.email">
              <dt>邮箱</dt>
              <dd><a :href="`mailto:${about.email}`">{{ about.email }}</a></dd>
            </template>
            <template v-if="about.updateTime">
              <dt>更新</dt>
              <dd>{{ about.updateTime }}</dd>
            </template>
          </dl>

          <div v-if="about.skills?.length" class="skills">
            <span v-for="skill in about.skills" :key="skill">{{ skill }}</span>
          </div>

          <div v-if="about.links?.length" class="link-list">
            <a
              v-for="link in about.links"
              :key="`${link.label}_${link.url}`"
              :href="link.url"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ link.label || link.url }}
            </a>
          </div>
        </aside>

        <article class="content-panel">
          <p v-if="about.intro" class="intro">{{ about.intro }}</p>

          <section v-if="about.contentHtml" class="prose" v-html="about.contentHtml" />
          <section v-else-if="about.contentText" class="prose" v-html="textToHtml(about.contentText)" />

          <section v-if="about.experiences?.length" class="timeline">
            <h2>经历</h2>
            <div class="timeline-list">
              <div v-for="item in about.experiences" :key="`${item.year}_${item.title}`" class="timeline-item">
                <time>{{ item.year }}</time>
                <div>
                  <h3>{{ item.title }}</h3>
                  <p>{{ item.description }}</p>
                </div>
              </div>
            </div>
          </section>
        </article>
      </main>
      </template>
    </template>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { publicAboutService } from '@/api/about'

const loading = ref(false)
const about = ref(defaultAbout())
const unavailable = ref(false)

function defaultAbout() {
  return {
    title: '关于 Lycoding',
    subtitle: '用文字记录技术、生活与长期主义',
    ownerName: 'Lycoding',
    roleTitle: '后端开发者 / 博客作者',
    location: '中国',
    email: 'admin@example.com',
    avatarUrl: '/logo.png',
    coverUrl: '/img/bac2.jpg',
    intro: '这里是一个持续更新的个人博客。我会记录 Java、Spring Boot、数据库实践，也会收藏一些生活里的灵感与照片。',
    contentHtml: '<p>你好，我是 Lycoding。这个博客用于沉淀开发笔记、项目复盘和生活片段。</p><p>我喜欢把复杂问题拆成可验证的小步骤，也希望这里的内容能让后来者少走一些弯路。</p>',
    contentText: '',
    skills: ['Java', 'Spring Boot', 'MySQL', 'Vue', '系统设计'],
    links: [
      { label: 'GitHub', url: 'https://github.com/' },
      { label: 'Email', url: 'mailto:admin@example.com' },
    ],
    experiences: [
      { year: '2026', title: '重构个人博客', description: '完善文章、留言、朋友圈和关于页面管理能力。' },
      { year: '长期', title: '持续写作', description: '把技术实践和生活观察整理为可复用的内容。' },
    ],
  }
}

function normalizeAbout(value = {}) {
  const fallback = defaultAbout()
  return {
    ...fallback,
    ...value,
    skills: Array.isArray(value.skills) ? value.skills : fallback.skills,
    links: Array.isArray(value.links) ? value.links : fallback.links,
    experiences: Array.isArray(value.experiences) ? value.experiences : fallback.experiences,
  }
}

function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function textToHtml(text) {
  return escapeHtml(text)
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, '<br>')}</p>`)
    .join('')
}

async function loadAbout() {
  loading.value = true
  try {
    const res = await publicAboutService()
    const data = res?.data ?? res
    if (data) {
      about.value = normalizeAbout(data)
      unavailable.value = false
    } else {
      unavailable.value = true
    }
  } catch (err) {
    console.warn('[about] 使用默认关于页面内容', err)
    about.value = defaultAbout()
    unavailable.value = false
  } finally {
    loading.value = false
  }
}

onMounted(loadAbout)
</script>

<style scoped>
.about-page {
  width: var(--blog-content-width);
  margin: 0 auto;
  padding: 24px 16px 56px;
}

.about-loading {
  padding: 24px;
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: 8px;
}

.about-empty {
  padding: 48px 24px;
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: 8px;
}

.about-hero {
  position: relative;
  min-height: 280px;
  overflow: hidden;
  border: 1px solid var(--blog-card-border);
  border-radius: 8px;
  background: var(--app-surface);
}

.hero-cover {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.about-hero::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(15, 20, 25, 0.72), rgba(15, 20, 25, 0.26));
}

.hero-content {
  position: relative;
  z-index: 1;
  min-height: 280px;
  display: flex;
  align-items: flex-end;
  padding: 32px;
  color: #fff;
}

.profile {
  display: flex;
  align-items: center;
  gap: 18px;
  max-width: 760px;
}

.avatar {
  width: 88px;
  height: 88px;
  flex: 0 0 88px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid rgba(255, 255, 255, 0.84);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
}

.eyebrow {
  margin: 0 0 8px;
  font-size: 12px;
  letter-spacing: 0.16em;
  color: rgba(255, 255, 255, 0.76);
}

.profile-copy h1 {
  margin: 0;
  font-size: 34px;
  line-height: 1.2;
  letter-spacing: 0;
}

.subtitle {
  margin: 10px 0 0;
  font-size: 16px;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.86);
}

.about-layout {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 24px;
  margin-top: 24px;
  align-items: start;
}

.side-panel,
.content-panel {
  background: var(--app-surface);
  border: 1px solid var(--blog-card-border);
  border-radius: 8px;
}

.side-panel {
  position: sticky;
  top: calc(var(--blog-header-height, 118px) + 20px);
  padding: 20px;
}

.identity h2 {
  margin: 0 0 6px;
  color: var(--app-text-primary);
  font-size: 22px;
}

.identity p {
  margin: 0;
  color: var(--app-text-muted);
  line-height: 1.6;
}

.meta-list {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr);
  gap: 10px 12px;
  margin: 20px 0 0;
  padding-top: 18px;
  border-top: 1px solid var(--app-divider-subtle);
  font-size: 14px;
}

.meta-list dt {
  color: var(--app-text-muted);
}

.meta-list dd {
  margin: 0;
  color: var(--app-text-secondary);
  word-break: break-word;
}

.meta-list a,
.link-list a {
  color: var(--blog-link);
  text-decoration: none;
}

.meta-list a:hover,
.link-list a:hover {
  text-decoration: underline;
}

.skills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 20px;
}

.skills span {
  padding: 5px 10px;
  border: 1px solid var(--blog-card-border);
  border-radius: 999px;
  background: var(--app-surface-muted);
  color: var(--app-text-secondary);
  font-size: 13px;
}

.link-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
  padding-top: 18px;
  border-top: 1px solid var(--app-divider-subtle);
  font-size: 14px;
}

.content-panel {
  padding: 28px;
}

.intro {
  margin: 0 0 24px;
  padding: 16px 18px;
  border-left: 4px solid var(--blog-link);
  background: var(--app-surface-muted);
  color: var(--app-text-secondary);
  line-height: 1.8;
}

.prose {
  color: var(--app-text-secondary);
  font-size: 16px;
  line-height: 1.9;
}

.prose :deep(p) {
  margin: 0 0 1em;
}

.prose :deep(h2),
.prose :deep(h3),
.prose :deep(h4) {
  margin: 1.5em 0 0.7em;
  color: var(--app-text-primary);
  line-height: 1.45;
}

.prose :deep(blockquote) {
  margin: 1em 0;
  padding: 10px 14px;
  border-left: 4px solid var(--blog-link);
  background: var(--app-surface-muted);
}

.prose :deep(figure.article-image) {
  margin: 18px 0;
}

.prose :deep(figure.article-image img) {
  max-width: 100%;
  border-radius: 6px;
}

.prose :deep(figcaption),
.prose :deep(.code-caption) {
  margin-top: 8px;
  color: var(--app-text-muted);
  font-size: 13px;
  text-align: center;
}

.prose :deep(pre.article-code) {
  margin: 16px 0 6px;
  padding: 14px;
  border-radius: 6px;
  overflow: auto;
  background: #282c34;
  color: #f8fafc;
  font-family: Consolas, "Courier New", monospace;
  font-size: 13px;
  line-height: 1.6;
}

.timeline {
  margin-top: 32px;
  padding-top: 26px;
  border-top: 1px solid var(--app-divider-subtle);
}

.timeline h2 {
  margin: 0 0 18px;
  color: var(--app-text-primary);
  font-size: 22px;
}

.timeline-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.timeline-item {
  display: grid;
  grid-template-columns: 86px minmax(0, 1fr);
  gap: 18px;
}

.timeline-item time {
  color: var(--blog-link);
  font-weight: 600;
}

.timeline-item h3 {
  margin: 0 0 6px;
  color: var(--app-text-primary);
  font-size: 17px;
}

.timeline-item p {
  margin: 0;
  color: var(--app-text-secondary);
  line-height: 1.7;
}

@media (max-width: 900px) {
  .about-layout {
    grid-template-columns: 1fr;
  }

  .side-panel {
    position: static;
  }
}

@media (max-width: 640px) {
  .about-page {
    padding: 16px 12px 40px;
  }

  .hero-content {
    padding: 24px;
  }

  .profile {
    align-items: flex-start;
    flex-direction: column;
  }

  .profile-copy h1 {
    font-size: 28px;
  }

  .content-panel {
    padding: 20px;
  }

  .timeline-item {
    grid-template-columns: 1fr;
    gap: 6px;
  }
}
</style>
