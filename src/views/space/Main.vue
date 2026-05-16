<template>
  <div id="container">
    <ImagePreviewer
      :show-preview="showImagePreview"
      :current-image="currentPreviewImage"
      @close="closeImagePreview"
    />

    <div class="main">
      <div class="contents">
        <article
          v-for="(item, index) in paragraphs"
          :key="index"
          ref="paragraphRefs"
          class="shuoshuo-card"
        >
          <p class="post-kind">说说</p>
          <div class="card-head">
            <h2 class="card-title">{{ item.title }}</h2>
            <div class="card-date">
              <span>{{ item.date }}</span>
            </div>
          </div>

          <div
            class="card-body"
            :class="{ expanded: expandedStates[index] }"
          >
            <div class="card-inner">
              <div class="media" v-if="item.images?.length">
                <img
                  v-for="(src, i) in item.images"
                  :key="i"
                  :src="src"
                  alt=""
                  @click="openImagePreview(src)"
                >
              </div>
              <p>{{ item.text }}</p>
            </div>
          </div>

          <div class="card-foot">
            <span><i class="iconfont icon-hot" /> {{ item.hot }}</span>
            <span><i class="iconfont icon-comments" /> {{ item.comments }} 留言</span>
          </div>

          <button
            v-if="showMoreStates[index]"
            type="button"
            class="toggle-more"
            @click="toggleParagraph(index)"
          >
            <i class="iconfont" :class="expandedStates[index] ? 'icon-xiangshangjiantou' : 'icon-xiangxiajiantou'" />
            {{ expandedStates[index] ? '收起内容' : '展示更多' }}
          </button>
        </article>
      </div>

      <aside class="side">
        <PersonBox />
      </aside>
    </div>

    <MessageVue
      ref="toastMessage"
      position="right"
      :duration="2000"
      content="点赞成功"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import PersonBox from '../../components/sider/Introduction.vue'
import ImagePreviewer from '@/components/image/ImagePreviewer.vue'
import MessageVue from '@/components/Message/Index.vue'

const paragraphs = ref([
  {
    title: '呜呜呜~今天有点倒霉',
    date: '2025 年 7 月 24 日 · 10:24',
    text: '今天真是倒霉透了！先是早上闹钟没响，起床就晚了一个小时。匆忙中又打翻了咖啡，把新买的衬衫弄脏了。',
    images: ['/img/bac1.jpg', '/img/bac2.jpg'],
    hot: '3.7k 热度',
    comments: 45,
  },
  {
    title: '诈尸一下',
    date: '2025 年 12 月 11 日 · 21:53',
    text: '马上就是 2026 年了，哈哈哈。过得太快了吧。',
    images: [],
    hot: '1.2k 热度',
    comments: 13,
  },
])

const expandedStates = ref(paragraphs.value.map(() => false))
const showMoreStates = ref(paragraphs.value.map(() => false))
const paragraphRefs = ref([])

const toastMessage = ref(null)

onMounted(() => {
  setTimeout(() => {
    showMoreStates.value = paragraphRefs.value.map((el) => {
      if (!el) return false
      const inner = el.querySelector?.('.card-inner')
      return inner && inner.scrollHeight > 320
    })
  }, 120)
})

const toggleParagraph = (index) => {
  expandedStates.value[index] = !expandedStates.value[index]
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
  padding: 8px 16px 40px;
}

.main {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 28px;
}

.contents {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.side {
  flex: 0 0 250px;
  width: 250px;
}

.shuoshuo-card {
  padding: 22px 0 24px;
  border-bottom: 1px solid var(--blog-divider);
}

.post-kind {
  margin: 0 0 6px;
  font-size: 13px;
  color: var(--blog-meta);
  letter-spacing: 0.08em;
}

.card-head {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px 16px;
  margin-bottom: 10px;
}

.card-title {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--app-text-primary);
}

.card-date {
  font-size: 13px;
  color: var(--blog-meta);
  white-space: nowrap;
}

.card-body {
  max-height: 320px;
  overflow: hidden;
  transition: max-height 0.35s ease;
}

.card-body.expanded {
  max-height: 2000px;
}

.card-inner p {
  margin: 0 0 12px;
  font-size: 15px;
  line-height: 1.85;
  color: var(--app-text-secondary);
}

.media {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 12px;
}

.media img {
  max-width: 100%;
  border-radius: 2px;
  cursor: zoom-in;
  border: 1px solid var(--blog-card-border);
}

.card-foot {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 12px;
  font-size: 13px;
  color: var(--blog-meta);
}

.card-foot .iconfont {
  margin-right: 4px;
  font-size: 15px;
}

.toggle-more {
  display: block;
  margin: 14px auto 0;
  padding: 6px 14px;
  font-size: 13px;
  color: var(--blog-link);
  background: transparent;
  border: 1px solid var(--blog-divider);
  border-radius: 2px;
  cursor: pointer;
}

.toggle-more:hover {
  border-color: var(--blog-link);
  background: var(--blog-nav-link-hover-bg);
}

@media (max-width: 900px) {
  .main {
    flex-direction: column;
  }

  .side {
    width: 100%;
    flex: none;
  }
}
</style>
