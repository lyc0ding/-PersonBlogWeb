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
            :key="post.title"
            class="post-entry"
            to="/technolyge"
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
            <img src="/logo.png" alt="Lycoding">
          </div>
          <div>
            <p class="profile-label">BLOG OWNER</p>
            <h2>Lycoding</h2>
            <p class="profile-text">
              这里整理开发笔记、嵌入式实践和生活里的片段，保留一点长期主义的痕迹。
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

    <section class="quick-section" aria-label="站点入口">
      <RouterLink
        v-for="link in quickLinks"
        :key="link.title"
        class="quick-link"
        :to="link.path"
      >
        <span>{{ link.title }}</span>
        <p>{{ link.desc }}</p>
      </RouterLink>
    </section>
  </div>
</template>

<script setup>
const stats = [
  { label: '文章记录', value: '23+' },
  { label: '评论交流', value: '45+' },
  { label: '建站年份', value: '2026' },
]

const recentPosts = [
  {
    title: 'Codex 自制宠物',
    excerpt: '把一个有趣的小工具接入博客，让页面多一点个人化的交互感。',
    date: '2026-05-08',
    category: '建站',
  },
  {
    title: 'U-Boot、内核移植与根文件系统构建',
    excerpt: '记录 BeagleBone Green Gateway 与 AM335X 的移植流程和关键问题。',
    date: '2026-04-25',
    category: '嵌入式',
  },
  {
    title: '你们搞大模型的就是？',
    excerpt: '关于近期大模型发展、开发体验和日常使用的一些观察。',
    date: '2026-04-11',
    category: '生活',
  },
]

const nowItems = [
  '整理 Vue 博客前台的阅读体验',
  '补齐嵌入式开发过程中的问题记录',
  '把日常想法沉淀成可以回看的文字',
]

const quickLinks = [
  { title: '文章', desc: '技术笔记与经验整理', path: '/technolyge' },
  { title: '朋友圈', desc: '图片、文字和近期动态', path: '/space' },
  { title: '留言板', desc: '留下想法或交流问题', path: '/comments' },
  { title: '关于', desc: '了解这个博客和博主', path: '/about' },
]
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
  background: color-mix(in srgb, var(--app-surface) 86%, transparent);
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
  background: rgba(43, 108, 176, 0.055);
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

.quick-section {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1px;
  margin-top: 34px;
  border: 1px solid var(--blog-divider);
  background: var(--blog-divider);
}

.quick-link {
  min-height: 126px;
  padding: 22px;
  background: var(--app-surface);
  color: inherit;
  text-decoration: none;
  transition:
    background-color 0.22s ease,
    color 0.22s ease,
    transform 0.22s ease;
}

.quick-link:hover {
  background: var(--app-surface-muted);
  transform: translateY(-2px);
}

.quick-link span {
  color: var(--app-text-primary);
  font-size: 1rem;
  font-weight: 700;
}

.quick-link p {
  margin: 10px 0 0;
  color: var(--app-text-secondary);
  font-size: 13px;
  line-height: 1.65;
}

@media (max-width: 820px) {
  .home-layout {
    grid-template-columns: 1fr;
  }

  .quick-section {
    grid-template-columns: repeat(2, minmax(0, 1fr));
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

  .quick-section {
    grid-template-columns: 1fr;
  }
}
</style>
