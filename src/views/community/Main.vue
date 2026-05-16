<template>
  <div class="article-feed">
    <article
      v-for="item in contentList"
      :key="item.id"
      class="post-card"
    >
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
  },
  {
    id: 2,
    title: 'U-Boot、内核移植与根文件系统构建（BeagleBone Green Gateway&AM335X）',
    excerpt: '基于 BeagleBone Green Gateway 开发板（核心芯片为 TI AM3358）的 U-Boot、内核移植与根文件系统构建全流程',
    date: '2026-04-25 22:36',
    category: '嵌入式',
    comments: 4,
  },
  {
    id: 3,
    title: '你们搞大模型的就是？',
    excerpt: '关于近期大模型发展和使用的小感概：你们搞大模型的就是码奸，你们已经害死前端兄弟了，还要害死后端兄弟……',
    date: '2026-04-11 14:11',
    category: '生活',
    comments: 14,
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
</script>

<style scoped>
.article-feed {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.post-card {
  padding: 22px 0 26px;
  border-bottom: 1px solid var(--blog-divider);
}

.post-kind {
  margin: 0 0 6px;
  font-size: 13px;
  color: var(--blog-meta);
  letter-spacing: 0.08em;
}

.post-title {
  margin: 0 0 10px;
  font-size: 1.35rem;
  font-weight: 600;
  line-height: 1.45;
}

.post-title a {
  color: var(--app-text-primary);
  text-decoration: none;
}

.post-title a:hover {
  color: var(--blog-link);
}

.post-excerpt {
  margin: 0 0 12px;
  font-size: 14px;
  line-height: 1.75;
  color: var(--app-text-secondary);
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

.pager-wrap {
  padding: 20px 0 8px;
}
</style>
