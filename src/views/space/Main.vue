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
          class="moment-card"
          :class="{ 'is-current': String(item.id) === String(currentMomentId) }"
          :data-current-id="item.id"
          :ref="(el) => setMomentCardRef(item.id, el)"
          role="link"
          tabindex="0"
          @click="openMoment(item.id)"
          @keydown.enter="openMoment(item.id)"
        >
          <div class="moment-panel">
            <header class="moment-head">
              <div>
                <p class="moment-kind">动态</p>
                <h2 class="moment-title">
                  <RouterLink
                    :to="{ name: 'MomentDetail', params: { id: item.id } }"
                    @click.stop="rememberMomentScroll"
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
                  @click.stop="rememberMomentScroll"
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
        <PersonBox
          :current-location="currentLocation"
          :toc-items="momentTocItems"
          @current-location-click="scrollToCurrentMoment"
        />
      </aside>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onActivated, onBeforeUpdate, onMounted, onUnmounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import PersonBox from '@/components/sidebar/BlogProfileCard.vue'
import ImagePreviewer from '@/components/image/ImagePreviewer.vue'
import { timelinePageService } from '@/api/timeline'
import {
  hasWindowScrollRestoreMark,
  readPageSnapshotForReturn,
  rememberPageSnapshotForReturn,
  restoreWindowScrollIfMarked,
} from '@/utils/scrollMemory'

const router = useRouter()
const loading = ref(false)
const error = ref('')
const moments = ref([])
const total = ref(0)
const currentLocation = ref(null)
const currentMomentId = ref(null)
const momentCardRefs = new Map()
const visibleMomentIds = new Map()
let momentObserver = null

const query = reactive({
  pageNum: 1,
  pageSize: 6,
})

const momentTocItems = computed(() => moments.value.map(buildCurrentMomentLocation).filter(Boolean))

async function loadMoments() {
  loading.value = true
  error.value = ''
  try {
    const res = await timelinePageService({ ...query })
    const page = res?.data ?? res ?? {}
    moments.value = page.records ?? page.list ?? []
    total.value = page.total ?? moments.value.length
    await nextTick()
    syncMomentObserver()
    updateCurrentMoment(moments.value[0])
  } catch (err) {
    moments.value = []
    total.value = 0
    updateCurrentMoment(null)
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

function openMoment(id) {
  if (!id) return
  rememberMomentScroll()
  router.push({ name: 'MomentDetail', params: { id } })
}

function rememberMomentScroll() {
  rememberPageSnapshotForReturn('space', {
    query: { ...query },
    moments: moments.value,
    total: total.value,
    currentMomentId: currentMomentId.value,
    currentLocation: currentLocation.value,
  })
}

async function restoreMomentSnapshot() {
  const snapshot = readPageSnapshotForReturn('space')
  if (!snapshot?.moments) return false

  Object.assign(query, snapshot.query || {})
  moments.value = Array.isArray(snapshot.moments) ? snapshot.moments : []
  total.value = Number.isFinite(snapshot.total) ? snapshot.total : moments.value.length
  currentMomentId.value = snapshot.currentMomentId ?? null
  currentLocation.value = snapshot.currentLocation ?? buildCurrentMomentLocation(moments.value[0])

  await nextTick()
  syncMomentObserver()
  const currentItem = moments.value.find((item) => String(item.id) === String(currentMomentId.value))
  updateCurrentMoment(currentItem || moments.value[0])
  restoreWindowScrollIfMarked('space')
  return true
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

function buildCurrentMomentLocation(item) {
  if (!item) return null
  const title = String(item.title || '无标题动态').trim()
  return {
    id: item.id,
    title: title || '无标题动态',
    icon: 'icon-xiaoxi',
    type: 'moment',
  }
}

function updateCurrentMoment(item) {
  const location = buildCurrentMomentLocation(item)
  currentMomentId.value = location?.id ?? null
  currentLocation.value = location
}

function setMomentCardRef(id, el) {
  if (el && id != null) {
    momentCardRefs.set(String(id), el)
  }
}

function syncMomentObserver() {
  momentObserver?.disconnect()
  visibleMomentIds.clear()

  if (!momentCardRefs.size) return

  if (typeof IntersectionObserver === 'undefined') {
    updateCurrentMoment(moments.value[0])
    return
  }

  momentObserver = new IntersectionObserver(handleMomentIntersections, {
    root: null,
    rootMargin: '-130px 0px -45% 0px',
    threshold: [0, 0.12, 0.35, 0.65],
  })

  momentCardRefs.forEach((el) => momentObserver.observe(el))
}

function handleMomentIntersections(entries) {
  entries.forEach((entry) => {
    const id = String(entry.target.dataset.currentId || '')
    if (!id) return

    if (entry.isIntersecting) {
      visibleMomentIds.set(id, entry.intersectionRatio)
    } else {
      visibleMomentIds.delete(id)
    }
  })

  const currentId = Array.from(visibleMomentIds.entries())
    .sort((a, b) => b[1] - a[1])[0]?.[0]

  if (!currentId || currentId === String(currentMomentId.value)) return

  const currentItem = moments.value.find((item) => String(item.id) === currentId)
  updateCurrentMoment(currentItem)
}

function scrollToCurrentMoment(location = null) {
  const id = typeof location === 'object' ? location?.id : (location ?? currentMomentId.value)
  const target = id != null ? momentCardRefs.get(String(id)) : null
  if (id != null) {
    const currentItem = moments.value.find((item) => String(item.id) === String(id))
    updateCurrentMoment(currentItem)
  }
  target?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

onBeforeUpdate(() => {
  momentCardRefs.clear()
})

onMounted(() => {
  if (hasWindowScrollRestoreMark('space')) {
    restoreMomentSnapshot().then((restored) => {
      if (!restored) loadMoments()
    })
  } else {
    loadMoments()
  }
})

onActivated(() => {
  restoreWindowScrollIfMarked('space')
})

onUnmounted(() => {
  momentObserver?.disconnect()
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
.moment-card:focus-visible .moment-panel,
.moment-card.is-current .moment-panel {
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
