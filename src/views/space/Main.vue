<template>
  <div id="container">
    <ImagePreviewer
      :show-preview="showImagePreview"
      :current-image="currentPreviewImage"
      @close="closeImagePreview"
    />

    <div class="space-layout">
      <main class="moment-feed" aria-label="朋友圈动态">
        <div class="feed-head">
          <div>
            <h2>朋友圈</h2>
            <p>近期动态、图片和碎片记录</p>
          </div>
          <el-button :loading="loading" @click="loadMoments">刷新</el-button>
        </div>

        <el-alert
          v-if="error"
          :title="error"
          type="error"
          show-icon
          :closable="false"
        />

        <el-skeleton v-if="loading && !moments.length" :rows="6" animated />
        <el-empty v-else-if="!moments.length" description="暂无动态" />

        <article
          v-for="item in moments"
          v-else
          :key="item.id"
          :ref="(el) => setMomentCardRef(el, item.id)"
          :data-moment-id="item.id"
          class="moment-card"
          role="link"
          tabindex="0"
          @click="openMoment(item)"
          @keydown.enter="openMoment(item)"
        >
          <div class="moment-panel">
            <header class="moment-head">
              <div>
                <p class="moment-kind">动态</p>
                <h2 class="moment-title">
                  <RouterLink
                    :to="{ name: 'MomentDetail', params: { id: item.id } }"
                    @click.stop="rememberMomentPosition(item)"
                  >
                    {{ item.title || '无标题动态' }}
                  </RouterLink>
                </h2>
              </div>
              <time class="moment-date" :datetime="item.createTime">{{ formatDate(item.createTime) }}</time>
            </header>

            <p class="moment-text">{{ item.content }}</p>

            <div
              class="moment-gallery"
              :class="galleryClass(item.images?.length || 0)"
            >
              <button
                v-for="(src, index) in item.images"
                :key="`${item.id}_${src}`"
                type="button"
                class="gallery-item"
                @click.stop="openImagePreview(src)"
              >
                <img :src="src" :alt="`${item.title || '动态'} 图片 ${index + 1}`" loading="lazy">
              </button>
              <div v-if="!item.images?.length" class="gallery-empty">
                <span>纯文字动态</span>
              </div>
            </div>

            <footer class="moment-foot">
              <div class="moment-tags">
                <span># 朋友圈</span>
              </div>
              <div class="moment-stats">
                <span><i class="iconfont icon-hot" /> {{ item.status === 1 ? '展示中' : '隐藏' }}</span>
                <RouterLink
                  :to="{ name: 'MomentDetail', params: { id: item.id } }"
                  @click.stop="rememberMomentPosition(item)"
                >
                  查看详情
                </RouterLink>
              </div>
            </footer>
          </div>
        </article>

        <div class="pager-wrap">
          <el-pagination
            v-model:current-page="query.pageNum"
            v-model:page-size="query.pageSize"
            background
            layout="total, prev, pager, next"
            :total="total"
            @current-change="loadMoments"
          />
        </div>
      </main>

      <aside class="space-side">
        <PersonBox />
      </aside>
    </div>
  </div>
</template>

<script setup>
import { nextTick, onBeforeUpdate, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import PersonBox from '@/components/sidebar/BlogProfileCard.vue'
import ImagePreviewer from '@/components/image/ImagePreviewer.vue'
import { timelinePageService } from '@/api/timeline'

const router = useRouter()
const SPACE_SCROLL_TARGET_KEY = 'personblog_space_scroll_target'
const loading = ref(false)
const error = ref('')
const moments = ref([])
const total = ref(0)
const momentCardRefs = new Map()

const query = reactive({
  pageNum: 1,
  pageSize: 6,
})

async function loadMoments() {
  loading.value = true
  error.value = ''
  try {
    const res = await timelinePageService({ ...query })
    const page = res?.data ?? res ?? {}
    moments.value = page.records ?? page.list ?? []
    total.value = page.total ?? moments.value.length
    await restoreMomentPosition()
  } catch (err) {
    moments.value = []
    total.value = 0
    error.value = err?.message || '朋友圈动态加载失败，请确认后端 `/timeline/page` 可访问。'
  } finally {
    loading.value = false
  }
}

const galleryClass = (count) => {
  if (count === 0) return 'gallery-empty-wrap'
  if (count === 1) return 'gallery-one'
  if (count === 2) return 'gallery-two'
  return 'gallery-grid'
}

function setMomentCardRef(el, id) {
  if (!id) return
  if (el) {
    momentCardRefs.set(String(id), el)
  }
}

function rememberMomentPosition(item) {
  if (!item?.id) return
  sessionStorage.setItem(SPACE_SCROLL_TARGET_KEY, JSON.stringify({
    id: String(item.id),
    pageNum: query.pageNum,
    pageSize: query.pageSize,
  }))
}

function openMoment(item) {
  if (!item?.id) return
  rememberMomentPosition(item)
  router.push({ name: 'MomentDetail', params: { id: item.id } })
}

function readMomentPositionTarget() {
  const rawTarget = sessionStorage.getItem(SPACE_SCROLL_TARGET_KEY)
  if (!rawTarget) return null

  try {
    return JSON.parse(rawTarget)
  } catch {
    sessionStorage.removeItem(SPACE_SCROLL_TARGET_KEY)
    return null
  }
}

async function restoreMomentPosition() {
  const target = readMomentPositionTarget()
  if (!target) return

  if (Number(target.pageNum) !== query.pageNum || Number(target.pageSize) !== query.pageSize) {
    return
  }

  await nextTick()
  const targetElement = momentCardRefs.get(String(target.id))
  if (!targetElement) {
    sessionStorage.removeItem(SPACE_SCROLL_TARGET_KEY)
    return
  }

  sessionStorage.removeItem(SPACE_SCROLL_TARGET_KEY)
  targetElement.scrollIntoView({
    behavior: 'auto',
    block: 'start',
  })
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

function formatDate(value) {
  if (!value) return '-'
  return String(value).replace(/-/g, '.').slice(0, 16)
}

onBeforeUpdate(() => {
  momentCardRefs.clear()
})

onMounted(() => {
  const target = readMomentPositionTarget()
  if (target) {
    query.pageNum = Number(target.pageNum) || query.pageNum
    query.pageSize = Number(target.pageSize) || query.pageSize
  }
  loadMoments()
})
</script>

<style scoped>
#container {
  width: 100%;
  margin: 0 auto;
  padding: 8px 16px 44px;
}

.space-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) var(--blog-sidebar-width);
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

.feed-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--blog-divider);
}

.feed-head h2 {
  margin: 0 0 4px;
  color: var(--app-text-primary);
}

.feed-head p {
  margin: 0;
  color: var(--app-text-muted);
}

.moment-card {
  position: relative;
  display: block;
  min-height: 430px;
  scroll-margin-top: calc(var(--blog-header-height, 118px) + 16px);
}

.moment-panel {
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr) auto;
  min-width: 0;
  min-height: 430px;
  padding: 18px 18px 16px;
  overflow: hidden;
  background: var(--app-surface);
  border: 1px solid var(--blog-card-border);
  border-radius: 8px;
  box-shadow: var(--app-shadow-card, 0 10px 28px rgba(15, 23, 42, 0.04));
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.moment-card:hover .moment-panel,
.moment-card:focus-visible .moment-panel {
  border-color: rgba(43, 108, 176, 0.28);
  box-shadow: 0 14px 34px rgba(15, 23, 42, 0.08);
  transform: translateY(-1px);
}

.moment-card:focus-visible {
  outline: 2px solid var(--blog-link);
  outline-offset: 3px;
  border-radius: 8px;
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
  font-size: 1.12rem;
  line-height: 1.4;
  font-weight: 650;
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.moment-title a {
  color: var(--app-text-primary);
  text-decoration: none;
}

.moment-title a:hover {
  color: var(--blog-link);
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
  min-height: 190px;
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
  background: var(--app-surface-muted);
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

.moment-stats a {
  color: var(--blog-link);
  font-weight: 650;
  text-decoration: none;
  white-space: nowrap;
}

.space-side {
  width: var(--blog-sidebar-width);
}

.pager-wrap {
  display: flex;
  justify-content: flex-end;
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

  .feed-head,
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
