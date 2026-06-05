<template>
  <div class="moment-detail-page">
    <ImagePreviewer
      :show-preview="showImagePreview"
      :current-image="currentPreviewImage"
      @close="closeImagePreview"
    />

    <div class="detail-shell">
      <el-button class="back-link" link @click="goBack">
        <i class="iconfont icon-zuojiantou" aria-hidden="true"></i>
        返回朋友圈
      </el-button>

      <el-alert
        v-if="error"
        :title="error"
        type="error"
        show-icon
        :closable="false"
      />

      <el-skeleton v-if="loading" :rows="9" animated />

      <article v-else-if="moment.id" class="moment-detail">
        <header class="moment-hero">
          <div class="hero-main">
            <p class="moment-kind">MOMENT DETAIL</p>
            <h1>{{ moment.title || '无标题动态' }}</h1>
            <p class="moment-time">
              <i class="iconfont icon-rili" aria-hidden="true"></i>
              {{ formatDate(moment.createTime || moment.updateTime) }}
            </p>
          </div>

          <div class="hero-status">
            <span class="status-dot" :class="{ 'is-hidden': moment.status === 0 }" aria-hidden="true"></span>
            <span>{{ moment.status === 0 ? '已隐藏' : '展示中' }}</span>
          </div>
        </header>

        <section class="moment-content">
          <p>{{ moment.content || '这条动态暂时没有文字内容。' }}</p>
        </section>

        <section class="moment-gallery-section" aria-label="动态图片">
          <div class="section-head">
            <div>
              <p>PHOTOS</p>
              <h2>图片记录</h2>
            </div>
            <span>{{ images.length }} 张</span>
          </div>

          <div v-if="images.length" class="moment-gallery" :class="galleryClass(images.length)">
            <button
              v-for="(src, index) in images"
              :key="`${moment.id}_${src}_${index}`"
              type="button"
              class="gallery-item"
              @click="openImagePreview(src)"
            >
              <img :src="src" :alt="`${moment.title || '动态'} 图片 ${index + 1}`" loading="lazy">
              <span>{{ String(index + 1).padStart(2, '0') }}</span>
            </button>
          </div>

          <div v-else class="empty-gallery">
            <i class="iconfont icon-xiaoxi" aria-hidden="true"></i>
            <span>这是一条纯文字动态</span>
          </div>
        </section>

        <footer class="moment-footer">
          <RouterLink class="next-link" :to="{ name: 'Space' }">
            <i class="iconfont icon-xiaoxi" aria-hidden="true"></i>
            继续看朋友圈
          </RouterLink>
          <RouterLink class="next-link" :to="{ name: 'Articles' }">
            <i class="iconfont icon-wenjian" aria-hidden="true"></i>
            去看文章
          </RouterLink>
        </footer>
      </article>

      <el-empty v-else description="动态不存在或已下线" />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ImagePreviewer from '@/components/image/ImagePreviewer.vue'
import { timelineDetailService } from '@/api/timeline'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const error = ref('')
const moment = ref({})
const showImagePreview = ref(false)
const currentPreviewImage = ref('')

const images = computed(() => (Array.isArray(moment.value.images) ? moment.value.images : []))

async function loadMomentDetail() {
  const id = route.params.id
  if (!id) return

  loading.value = true
  error.value = ''
  moment.value = {}
  try {
    const res = await timelineDetailService(id)
    moment.value = res?.data ?? res ?? {}
  } catch (err) {
    moment.value = {}
    error.value = err?.message || '朋友圈详情加载失败。'
  } finally {
    loading.value = false
  }
}

function galleryClass(count) {
  if (count === 1) return 'gallery-one'
  if (count === 2) return 'gallery-two'
  return 'gallery-grid'
}

function openImagePreview(imgSrc) {
  currentPreviewImage.value = imgSrc
  showImagePreview.value = true
}

function closeImagePreview() {
  showImagePreview.value = false
}

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push({ name: 'Space' })
  }
}

function formatDate(value) {
  if (!value) return '-'
  return String(value).replace(/-/g, '.').slice(0, 16)
}

onMounted(loadMomentDetail)

watch(
  () => route.params.id,
  () => loadMomentDetail()
)
</script>

<style scoped>
.moment-detail-page {
  width: 100%;
  padding: 22px 16px 46px;
}

.detail-shell {
  width: min(980px, 100%);
  margin: 0 auto;
}

.back-link {
  margin-bottom: 14px;
  padding-left: 0;
  color: var(--app-text-secondary);
}

.back-link .iconfont {
  margin-right: 5px;
  font-size: 13px;
}

.moment-detail {
  overflow: hidden;
  background: var(--app-surface);
  border: 1px solid var(--blog-card-border);
  border-radius: 8px;
  box-shadow: var(--app-shadow-card, 0 10px 28px rgba(15, 23, 42, 0.05));
}

.moment-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 20px;
  align-items: start;
  padding: 30px 30px 24px;
  border-bottom: 1px solid var(--blog-divider);
  background:
    linear-gradient(118deg, color-mix(in srgb, #218c72 12%, transparent), transparent 48%),
    linear-gradient(292deg, color-mix(in srgb, #c08a3e 9%, transparent), transparent 42%),
    var(--app-surface);
}

.moment-kind {
  margin: 0 0 10px;
  color: #218c72;
  font-size: 13px;
  font-weight: 750;
  letter-spacing: 0;
}

.moment-hero h1 {
  margin: 0;
  color: var(--app-text-primary);
  font-size: 2.05rem;
  font-weight: 780;
  line-height: 1.28;
  letter-spacing: 0;
  word-break: break-word;
}

.moment-time {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 16px 0 0;
  color: var(--blog-meta);
  font-size: 13px;
}

.moment-time .iconfont {
  color: #218c72;
}

.hero-status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 34px;
  padding: 7px 10px;
  color: var(--app-text-secondary);
  background: color-mix(in srgb, #218c72 8%, var(--app-surface));
  border: 1px solid color-mix(in srgb, #218c72 20%, var(--blog-card-border));
  border-radius: 8px;
  font-size: 13px;
  white-space: nowrap;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.14);
}

.status-dot.is-hidden {
  background: var(--app-text-muted);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--app-text-muted) 18%, transparent);
}

.moment-content {
  padding: 28px 30px 10px;
}

.moment-content p {
  max-width: 760px;
  margin: 0;
  color: var(--app-text-secondary);
  font-size: 17px;
  line-height: 1.95;
  white-space: pre-wrap;
  word-break: break-word;
}

.moment-gallery-section {
  padding: 20px 30px 30px;
}

.section-head {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 14px;
}

.section-head p {
  margin: 0 0 4px;
  color: #218c72;
  font-size: 12px;
  font-weight: 750;
  letter-spacing: 0;
}

.section-head h2 {
  margin: 0;
  color: var(--app-text-primary);
  font-size: 20px;
}

.section-head span {
  color: var(--blog-meta);
  font-size: 13px;
}

.moment-gallery {
  display: grid;
  gap: 10px;
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

.gallery-item {
  position: relative;
  display: block;
  min-width: 0;
  aspect-ratio: 1;
  padding: 0;
  overflow: hidden;
  background: var(--app-surface-muted);
  border: 1px solid var(--blog-card-border);
  border-radius: 8px;
  cursor: zoom-in;
}

.gallery-one .gallery-item {
  aspect-ratio: 16 / 10;
}

.gallery-two .gallery-item {
  aspect-ratio: 4 / 3;
}

.gallery-item img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.25s ease, filter 0.25s ease;
}

.gallery-item:hover img {
  transform: scale(1.04);
  filter: saturate(1.05) contrast(1.03);
}

.gallery-item span {
  position: absolute;
  right: 10px;
  bottom: 9px;
  padding: 3px 7px;
  color: #ffffff;
  background: rgba(15, 23, 42, 0.58);
  border-radius: 6px;
  font-size: 12px;
  line-height: 1;
}

.empty-gallery {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 190px;
  color: var(--app-text-muted);
  background: var(--app-surface-muted);
  border: 1px dashed var(--blog-card-border);
  border-radius: 8px;
}

.moment-footer {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 18px 30px 28px;
  border-top: 1px solid var(--blog-divider);
}

.next-link {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 36px;
  padding: 7px 10px;
  color: var(--app-text-secondary);
  text-decoration: none;
  background: var(--app-surface-muted);
  border: 1px solid var(--blog-card-border);
  border-radius: 8px;
  transition: color 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
}

.next-link:hover {
  color: #218c72;
  border-color: color-mix(in srgb, #218c72 30%, var(--blog-card-border));
  transform: translateY(-1px);
}

@media (max-width: 760px) {
  .moment-detail-page {
    padding: 16px 14px 38px;
  }

  .moment-hero {
    grid-template-columns: 1fr;
    padding: 22px 20px;
  }

  .moment-hero h1 {
    font-size: 1.62rem;
  }

  .moment-content,
  .moment-gallery-section {
    padding-left: 20px;
    padding-right: 20px;
  }

  .gallery-one,
  .gallery-two,
  .gallery-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .gallery-one {
    grid-template-columns: 1fr;
  }

  .moment-footer {
    padding-left: 20px;
    padding-right: 20px;
  }
}

@media (max-width: 520px) {
  .gallery-two,
  .gallery-grid {
    grid-template-columns: 1fr;
  }
}
</style>
