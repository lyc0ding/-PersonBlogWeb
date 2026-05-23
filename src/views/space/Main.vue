<template>
  <div id="container">
    <ImagePreviewer
      :show-preview="showImagePreview"
      :current-image="currentPreviewImage"
      @close="closeImagePreview"
    />

    <div class="space-layout">
      <main class="moment-feed" aria-label="朋友圈动态">
        <article
          v-for="item in moments"
          :key="item.id"
          class="moment-card"
        >
          <div class="moment-panel">
            <header class="moment-head">
              <div>
                <p class="moment-kind">{{ item.type }}</p>
                <h2 class="moment-title">{{ item.title }}</h2>
              </div>
              <time class="moment-date" :datetime="item.datetime">{{ item.date }}</time>
            </header>

            <p class="moment-text">{{ item.text }}</p>

            <div
              class="moment-gallery"
              :class="galleryClass(item.images?.length || 0)"
            >
              <button
                v-for="(src, index) in item.images"
                :key="src"
                type="button"
                class="gallery-item"
                @click="openImagePreview(src)"
              >
                <img :src="src" :alt="`${item.title} 图片 ${index + 1}`" loading="lazy">
              </button>
              <div v-if="!item.images?.length" class="gallery-empty">
                <span>纯文字动态</span>
              </div>
            </div>

            <footer class="moment-foot">
              <div class="moment-tags">
                <span v-for="tag in item.tags" :key="tag"># {{ tag }}</span>
              </div>
              <div class="moment-stats">
                <span><i class="iconfont icon-hot" /> {{ item.hot }}</span>
                <span><i class="iconfont icon-comments" /> {{ item.comments }} 留言</span>
              </div>
            </footer>
          </div>
        </article>
      </main>

      <aside class="space-side">
        <PersonBox />
      </aside>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import PersonBox from '../../components/sider/Introduction.vue'
import ImagePreviewer from '@/components/image/ImagePreviewer.vue'

const moments = ref([
  {
    id: 1,
    type: '日常',
    title: '把今天过成一个小版本',
    date: '2026.05.18 22:18',
    datetime: '2026-05-18T22:18:00',
    day: '18',
    text: '下午把博客的几个交互细节收了一下，晚上顺手整理桌面。生活和代码一样，先把能看见的地方理顺，剩下的问题就会变得清楚。',
    images: ['/img/bac1.jpg', '/img/bac2.jpg', '/static/images/nickname.png'],
    tags: ['博客', '前端', '记录'],
    hot: '3.7k',
    comments: 45,
  },
  {
    id: 2,
    type: '碎碎念',
    title: '诈尸一下',
    date: '2026.04.27 21:53',
    datetime: '2026-04-27T21:53:00',
    day: '27',
    text: '时间过得太快了，很多事刚开始觉得很远，回头看已经是很久以前。最近想少一点无效焦虑，多做一点能留下来的东西。',
    images: ['/img/neymar.jpg'],
    tags: ['生活', '复盘'],
    hot: '1.2k',
    comments: 13,
  },
  {
    id: 3,
    type: '学习',
    title: '一次嵌入式环境整理',
    date: '2026.04.13 16:40',
    datetime: '2026-04-13T16:40:00',
    day: '13',
    text: '把旧开发板的 U-Boot、内核和根文件系统笔记重新梳了一遍。很多步骤以前只是跑通，现在再写下来，才发现真正有价值的是可复现的过程。',
    images: ['/img/bac2.jpg', '/img/bac1.jpg'],
    tags: ['嵌入式', 'Linux', '笔记'],
    hot: '980',
    comments: 8,
  },
])

const galleryClass = (count) => {
  if (count === 0) return 'gallery-empty-wrap'
  if (count === 1) return 'gallery-one'
  if (count === 2) return 'gallery-two'
  return 'gallery-grid'
}

const showImagePreview = ref(false)
const currentPreviewImage = ref('')

const openImagePreview = (imgSrc) => {
  currentPreviewImage.value = imgSrc
  showImagePreview.value = true
}

const closeImagePreview = () => {
  showImagePreview.value = false
}
</script>

<style scoped>
#container {
  width: 100%;
  max-width: var(--blog-content-max, 960px);
  margin: 0 auto;
  padding: 8px 16px 44px;
}

.space-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 250px;
  gap: 34px;
  align-items: start;
}

.moment-feed {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 22px;
  min-width: 0;
}

.moment-card {
  position: relative;
  display: block;
  height: 430px;
}

.moment-panel {
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr) auto;
  min-width: 0;
  min-height: 0;
  padding: 18px 18px 16px;
  overflow: hidden;
  background: var(--app-surface);
  border: 1px solid var(--blog-card-border);
  border-radius: 8px;
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.04);
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.moment-card:hover .moment-panel {
  border-color: rgba(43, 108, 176, 0.28);
  box-shadow: 0 14px 34px rgba(15, 23, 42, 0.08);
  transform: translateY(-1px);
}

.moment-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 10px;
}

.moment-kind {
  margin: 0 0 5px;
  color: var(--blog-meta);
  font-size: 12px;
  letter-spacing: 0.08em;
}

.moment-title {
  margin: 0;
  color: var(--app-text-primary);
  font-size: 1.12rem;
  line-height: 1.4;
  font-weight: 650;
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.moment-date {
  flex: none;
  color: var(--blog-meta);
  font-size: 12px;
  line-height: 1.6;
  white-space: nowrap;
}

.moment-text {
  margin: 0 0 14px;
  color: var(--app-text-secondary);
  font-size: 15px;
  line-height: 1.85;
  display: -webkit-box;
  max-height: 83px;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.moment-gallery {
  display: grid;
  gap: 8px;
  margin: 4px 0 14px;
  min-height: 0;
  overflow: hidden;
}

.gallery-one {
  grid-template-columns: minmax(0, 0.72fr);
}

.gallery-two {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.gallery-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.gallery-empty-wrap {
  grid-template-columns: 1fr;
}

.gallery-item {
  position: relative;
  display: block;
  min-width: 0;
  padding: 0;
  overflow: hidden;
  background: var(--app-surface-muted);
  border: 1px solid var(--blog-card-border);
  border-radius: 6px;
  cursor: zoom-in;
}

.gallery-item::before {
  content: '';
  display: block;
  height: 100%;
}

.gallery-one .gallery-item::before {
  height: 100%;
}

.gallery-item img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.25s ease, filter 0.25s ease;
}

.gallery-item:hover img {
  transform: scale(1.04);
  filter: saturate(1.05) contrast(1.03);
}

.gallery-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  color: var(--app-text-muted);
  background:
    linear-gradient(135deg, transparent 0 48%, var(--blog-divider) 49% 51%, transparent 52%),
    var(--app-surface-muted);
  border: 1px dashed var(--blog-card-border);
  border-radius: 6px;
  font-size: 13px;
}

.moment-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding-top: 12px;
  min-height: 45px;
  border-top: 1px solid var(--blog-divider);
}

.moment-tags,
.moment-stats {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 14px;
  color: var(--blog-meta);
  font-size: 13px;
  max-height: 36px;
  overflow: hidden;
}

.moment-tags span {
  color: var(--blog-link);
}

.moment-stats .iconfont {
  margin-right: 4px;
  font-size: 15px;
}

.space-side {
  width: 250px;
}

:global(html.dark) .moment-panel {
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.22);
}

:global(html.dark) .moment-card:hover .moment-panel {
  border-color: rgba(99, 179, 237, 0.32);
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.34);
}

@media (max-width: 900px) {
  .space-layout {
    grid-template-columns: 1fr;
  }

  .space-side {
    width: 100%;
  }
}

@media (max-width: 640px) {
  #container {
    padding: 8px 14px 36px;
  }

  .moment-card {
    height: 420px;
  }

  .moment-panel {
    padding: 15px 14px 14px;
  }

  .moment-head,
  .moment-foot {
    flex-direction: column;
    align-items: flex-start;
  }

  .gallery-one,
  .gallery-two,
  .gallery-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .gallery-one {
    grid-template-columns: 1fr;
  }
}
</style>
