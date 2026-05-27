<template>
  <div class="blog-shell">
    <Banner />

    <div class="blog-grid">
      <main class="blog-main">
        <Main />
      </main>
      <aside class="blog-aside">
        <Introduction />
        <section class="widget">
          <h3 class="widget-title">标签云</h3>
          <TagCloud />
        </section>
      </aside>
    </div>
  </div>
</template>

<script setup>
import TagCloud from '@/components/sidebar/TagCloud.vue'
import Introduction from '@/components/sidebar/BlogProfileCard.vue'
import Banner from './Banner.vue'
import Main from './Main.vue'
</script>

<style scoped>
.blog-shell {
  width: 100%;
  padding-bottom: 32px;
}

.blog-grid {
  width: var(--blog-content-width);
  margin: 0 auto;
  padding: 8px 16px 0;
  display: grid;
  grid-template-columns: 1fr 260px;
  gap: 36px;
  align-items: start;
}

.blog-main {
  min-width: 0;
}

.blog-aside {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.widget-title {
  margin: 0 0 10px;
  font-size: 15px;
  font-weight: 600;
  color: var(--app-text-primary);
  padding-bottom: 8px;
  border-bottom: 1px solid var(--blog-divider);
}

@media (max-width: 900px) {
  .blog-grid {
    grid-template-columns: 1fr;
  }
}
</style>
