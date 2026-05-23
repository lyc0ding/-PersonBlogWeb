<template>
  <div class="article-feed">
    <article
      v-for="(item, index) in contentList"
      :key="item.id"
      class="post-card"
      :class="index % 2 === 0 ? 'post-card--image-left' : 'post-card--image-right'"
    >
      <div class="post-content">
        <p class="post-kind">文章</p>
        <h2 class="post-title">
          <a href="javascript:void(0)" @click.prevent>{{ item.title }}</a>
        </h2>
        <p class="post-excerpt" v-html="item.excerpt" />
        <ul class="post-meta">
          <li>作者: Echo</li>
          <li>{{ item.date }}</li>
          <li>{{ item.category }}</li>
          <li>{{ item.comments }} 评论</li>
        </ul>
        <p class="post-more">
          <a href="javascript:void(0)" @click.prevent>阅读全文</a>
        </p>
      </div>

      <a class="post-cover" href="javascript:void(0)" @click.prevent :aria-label="`${item.title} 封面`">
        <img :src="resolveCoverUrl(item)" :alt="item.title" loading="lazy">
      </a>
    </article>

    <div class="pager-wrap">
      <PaginateVue />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import PaginateVue from '@/components/Pagination/Paginate.vue'

const route = useRoute()

const allPosts = ref([
  {
    id: 1,
    title: 'Codex 自制宠物',
    excerpt: '使用 Codex 自制宠物并且添加到博客中使用',
    date: '2026-05-08 13:06',
    category: '建站',
    comments: 10,
    coverUrl: '/img/bac2.jpg',
  },
  {
    id: 2,
    title: 'U-Boot、内核移植与根文件系统构建（BeagleBone Green Gateway&AM335X）',
    excerpt: '基于 BeagleBone Green Gateway 开发板（核心芯片为 TI AM3358）的 U-Boot、内核移植与根文件系统构建全流程',
    date: '2026-04-25 22:36',
    category: '嵌入式',
    comments: 4,
    coverUrl: '/static/images/nickname.png',
  },
  {
    id: 3,
    title: '你们搞大模型的就是？',
    excerpt: '关于近期大模型发展和使用的小感概：你们搞大模型的就是码奸，你们已经害死前端兄弟了，还要害死后端兄弟……',
    date: '2026-04-11 14:11',
    category: '生活',
    comments: 14,
    coverUrl: '/img/neymar.jpg',
  },
])

const contentList = computed(() => {
  const q = (route.query.q || '').toString().trim().toLowerCase()
  if (!q) return allPosts.value
  return allPosts.value.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.excerpt.replace(/<[^>]+>/g, '').toLowerCase().includes(q)
  )
})

const resolveCoverUrl = (post) => {
  return post.coverUrl || post.coverPage || post.thumbnail || '/img/bac2.jpg'
}
</script>

<style scoped>
.article-feed {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.post-card {
  --cover-width: 30%;
  --cut-size: 28px;
  --edge-x: 20px;
  --edge-y: 10px;
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
  background: linear-gradient(90deg, rgba(43, 108, 176, 0.06), transparent 68%);
  box-shadow:
    inset 3px 0 0 var(--blog-link),
    0 10px 24px rgba(15, 23, 42, 0.06);
  transform: translateY(-1px);
}

.post-card:active {
  transform: translateY(0);
}

.post-content {
  position: absolute;
  top: var(--edge-y);
  bottom: var(--edge-y);
  z-index: 2;
  width: calc(100% - var(--cover-width) - var(--edge-x) * 2);
  min-width: 0;
  overflow: hidden;
}

.post-card--image-left .post-content {
  right: var(--edge-x);
  padding: 0 0 0 calc(var(--cut-size) + 18px);
  clip-path: polygon(var(--cut-size) 0, 100% 0, 100% 100%, 0 100%);
}

.post-card--image-right .post-content {
  left: var(--edge-x);
  padding: 0 calc(var(--cut-size) + 18px) 0 0;
  clip-path: polygon(0 0, 100% 0, calc(100% - var(--cut-size)) 100%, 0 100%);
}

.post-content::after {
  content: '';
  position: absolute;
  top: 0;
  width: 1px;
  height: 100%;
  background: var(--blog-divider);
  opacity: 0.9;
}

.post-card--image-left .post-content::after {
  left: var(--cut-size);
  transform: skewX(-10deg);
  transform-origin: top;
}

.post-card--image-right .post-content::after {
  right: var(--cut-size);
  transform: skewX(-10deg);
  transform-origin: bottom;
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

.post-card:hover .post-title a,
.post-card:focus-within .post-title a {
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

.post-more a:hover {
  text-decoration: underline;
}

.post-cover {
  position: absolute;
  top: var(--edge-y);
  bottom: var(--edge-y);
  display: block;
  width: calc(var(--cover-width) + var(--cut-size) - var(--edge-x));
  min-height: 0;
  overflow: hidden;
  background: var(--app-surface-muted);
}

.post-card--image-left .post-cover {
  left: var(--edge-x);
  clip-path: polygon(0 0, 100% 0, calc(100% - var(--cut-size)) 100%, 0 100%);
}

.post-card--image-right .post-cover {
  right: var(--edge-x);
  clip-path: polygon(var(--cut-size) 0, 100% 0, 100% 100%, 0 100%);
}

.post-cover::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.24), transparent 42%);
  pointer-events: none;
}

.post-cover img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  transition: transform 0.35s ease, filter 0.35s ease;
}

.post-card:hover .post-cover img {
  transform: scale(1.04);
  filter: saturate(1.04) contrast(1.03);
}

.pager-wrap {
  padding: 20px 0 8px;
}

@media (max-width: 720px) {
  .post-card {
    display: flex;
    flex-direction: column;
    gap: 14px;
    height: auto;
    min-height: 0;
    padding: 8px 15px;
    overflow: visible;
  }

  .post-content {
    position: relative;
    top: auto;
    bottom: auto;
    left: auto;
    right: auto;
    width: 100%;
    min-height: 0;
    padding-right: 0;
    clip-path: none;
  }

  .post-card--image-left .post-content,
  .post-card--image-right .post-content {
    padding: 0;
  }

  .post-content::after {
    display: none;
  }

  .post-cover {
    position: relative;
    top: auto;
    right: auto;
    bottom: auto;
    left: auto;
    width: 100%;
    order: -1;
    min-height: 180px;
    clip-path: none;
    border: 1px solid var(--blog-card-border);
  }

  .post-card--image-left .post-cover,
  .post-card--image-right .post-cover {
    left: auto;
    right: auto;
    clip-path: none;
  }

  .post-cover img {
    position: static;
    min-height: 180px;
  }
}
</style>
