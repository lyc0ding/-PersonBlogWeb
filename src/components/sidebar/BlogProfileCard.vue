<template>
  <section class="profile-card" aria-label="博主信息">
    <div class="profile-card__head">
      <button class="profile-avatar" type="button" aria-label="查看关于页面" @click="toAbout">
        <img src="/logo.png" alt="Lycoding">
      </button>

      <div class="profile-copy">
        <p class="profile-eyebrow">PERSONAL BLOG</p>
        <h2>Lycoding</h2>
        <p class="profile-role">后端开发者 / 博客作者</p>
      </div>
    </div>

    <p class="profile-bio">
      记录 Java、Spring Boot、数据库实践，也收藏一些生活里的灵感与照片。
    </p>

    <div class="profile-status" aria-label="当前状态">
      <span class="status-dot" aria-hidden="true"></span>
      <span>正在整理 Vue 博客前台体验</span>
    </div>

    <div class="profile-stats" aria-label="博客统计">
      <div v-for="item in stats" :key="item.label" class="stat-item">
        <strong>{{ item.value }}</strong>
        <span>{{ item.label }}</span>
      </div>
    </div>

    <div class="profile-tags" aria-label="关注方向">
      <span v-for="tag in tags" :key="tag">{{ tag }}</span>
    </div>

    <nav class="profile-links" aria-label="快速入口">
      <RouterLink
        v-for="link in links"
        :key="link.label"
        class="profile-link"
        :to="link.path"
      >
        <span class="link-icon" aria-hidden="true">
          <i :class="['iconfont', link.icon]"></i>
        </span>
        <span>{{ link.label }}</span>
        <i class="iconfont icon-youjiantou link-arrow" aria-hidden="true"></i>
      </RouterLink>
    </nav>
  </section>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const stats = [
  { label: '文章', value: '23+' },
  { label: '评论', value: '45+' },
  { label: '建站', value: '2026' },
]

const tags = ['Java', 'Spring Boot', 'Vue', 'MySQL']

const links = [
  { label: '关于我', path: '/about', icon: 'icon-shuohuaren' },
  { label: '文章归档', path: '/articles', icon: 'icon-wenjian' },
  { label: '留言交流', path: '/comments', icon: 'icon-liuyan' },
]

const toAbout = () => {
  router.push('/about')
}
</script>

<style scoped>
.profile-card {
  width: 100%;
  padding: 18px;
  overflow: hidden;
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--blog-link) 8%, transparent), transparent 42%),
    var(--app-surface);
  border: 1px solid var(--blog-card-border);
  border-radius: 8px;
  box-shadow: var(--app-shadow-card, 0 8px 24px rgba(15, 23, 42, 0.06));
}

.profile-card__head {
  display: grid;
  grid-template-columns: 58px minmax(0, 1fr);
  gap: 14px;
  align-items: center;
}

.profile-avatar {
  width: 58px;
  height: 58px;
  padding: 0;
  overflow: hidden;
  background: var(--app-surface-muted);
  border: 1px solid var(--blog-card-border);
  border-radius: 8px;
  cursor: pointer;
}

.profile-avatar img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.22s ease;
}

.profile-avatar:hover img {
  transform: scale(1.04);
}

.profile-copy {
  min-width: 0;
}

.profile-eyebrow {
  margin: 0 0 4px;
  color: var(--blog-meta);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.profile-copy h2 {
  margin: 0;
  color: var(--app-text-primary);
  font-size: 1.18rem;
  font-weight: 750;
  line-height: 1.25;
}

.profile-role {
  margin: 5px 0 0;
  color: var(--app-text-muted);
  font-size: 13px;
  line-height: 1.45;
}

.profile-bio {
  margin: 16px 0 0;
  color: var(--app-text-secondary);
  font-size: 14px;
  line-height: 1.8;
}

.profile-status {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 38px;
  margin-top: 14px;
  padding: 9px 10px;
  color: var(--app-text-secondary);
  background: color-mix(in srgb, var(--blog-link) 7%, var(--app-surface));
  border: 1px solid color-mix(in srgb, var(--blog-link) 16%, var(--blog-card-border));
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.45;
}

.status-dot {
  width: 7px;
  height: 7px;
  flex: 0 0 7px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.14);
}

.profile-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1px;
  margin-top: 16px;
  overflow: hidden;
  background: var(--blog-divider);
  border: 1px solid var(--blog-divider);
  border-radius: 8px;
}

.stat-item {
  min-width: 0;
  padding: 11px 6px 10px;
  text-align: center;
  background: var(--app-surface);
}

.stat-item strong {
  display: block;
  color: var(--app-text-primary);
  font-size: 1rem;
  font-weight: 750;
  line-height: 1.2;
}

.stat-item span {
  display: block;
  margin-top: 4px;
  color: var(--blog-meta);
  font-size: 12px;
  line-height: 1.2;
}

.profile-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.profile-tags span {
  padding: 5px 9px;
  color: var(--app-text-secondary);
  background: var(--app-surface-muted);
  border: 1px solid var(--blog-card-border);
  border-radius: 999px;
  font-size: 12px;
  line-height: 1;
}

.profile-links {
  display: grid;
  gap: 8px;
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid var(--blog-divider);
}

.profile-link {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr) 14px;
  gap: 9px;
  align-items: center;
  min-height: 38px;
  padding: 5px 8px 5px 5px;
  color: var(--app-text-secondary);
  text-decoration: none;
  border-radius: 8px;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
}

.profile-link:hover {
  color: var(--blog-link);
  background: color-mix(in srgb, var(--blog-link) 8%, transparent);
  transform: translateX(2px);
}

.link-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  color: var(--blog-link);
  background: color-mix(in srgb, var(--blog-link) 9%, var(--app-surface));
  border: 1px solid color-mix(in srgb, var(--blog-link) 18%, var(--blog-card-border));
  border-radius: 8px;
}

.profile-link span:nth-child(2) {
  overflow: hidden;
  font-size: 13px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.link-icon .iconfont {
  font-size: 15px;
}

.link-arrow {
  color: var(--blog-meta);
  font-size: 12px;
}

@media (max-width: 900px) {
  .profile-card {
    padding: 18px;
  }

  .profile-links {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .profile-link {
    grid-template-columns: 28px minmax(0, 1fr);
  }

  .link-arrow {
    display: none;
  }
}

@media (max-width: 560px) {
  .profile-card__head {
    grid-template-columns: 52px minmax(0, 1fr);
  }

  .profile-avatar {
    width: 52px;
    height: 52px;
  }

  .profile-links {
    grid-template-columns: 1fr;
  }
}
</style>
