<template>
  <div class="floating-tools">
    <button
      type="button"
      class="tool-button"
      :class="{ 'is-visible': showToTop }"
      :tabindex="showToTop ? 0 : -1"
      aria-label="回到顶部"
      title="回到顶部"
      @click="scrollToTop"
    >
      <i class="iconfont icon-huidaodingbu" aria-hidden="true"></i>
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const SHOW_THRESHOLD = 500
const showToTop = ref(false)

let rafId = 0
let activeScrollElement = null

const getRootScrollTop = () => Math.max(
  window.scrollY || window.pageYOffset || 0,
  document.scrollingElement?.scrollTop || 0,
  document.documentElement?.scrollTop || 0,
  document.body?.scrollTop || 0,
)

const normalizeScrollTarget = (target) => {
  if (!target || target === document || target === document.documentElement || target === document.body) {
    return null
  }

  return target instanceof Element ? target : null
}

const getCurrentScrollTop = () => Math.max(
  getRootScrollTop(),
  activeScrollElement?.scrollTop || 0,
)

const updateVisibility = () => {
  showToTop.value = getCurrentScrollTop() > SHOW_THRESHOLD
  rafId = 0
}

const handleScroll = (event) => {
  const target = normalizeScrollTarget(event?.target)

  if (target) {
    activeScrollElement = target
  }

  if (rafId) return
  rafId = window.requestAnimationFrame(updateVisibility)
}

const scrollElementToTop = (element) => {
  if (!element || element.scrollHeight <= element.clientHeight) return

  element.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}

// 回到顶部实现
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })

  const scrollTargets = new Set([
    document.scrollingElement,
    document.documentElement,
    document.body,
    document.getElementById('app'),
    document.getElementById('app-container'),
    document.querySelector('main'),
    activeScrollElement,
  ].filter(Boolean))

  scrollTargets.forEach(scrollElementToTop)
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  document.addEventListener('scroll', handleScroll, { passive: true, capture: true })
  window.addEventListener('resize', handleScroll, { passive: true })
  updateVisibility()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('scroll', handleScroll, true)
  window.removeEventListener('resize', handleScroll)

  if (rafId) {
    window.cancelAnimationFrame(rafId)
  }
})
</script>

<style lang="scss" scoped>
.floating-tools {
  position: fixed;
  right: 30px;
  bottom: 50px;
  z-index: 1500;
  width: 45px;
  height: 45px;
  pointer-events: none;
}

.tool-button {
  width: 45px;
  height: 45px;
  padding: 0;
  border: 1px solid var(--app-border);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--app-surface);
  cursor: pointer;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transform: translateY(8px);
  transition:
    opacity 0.3s ease,
    visibility 0.3s ease,
    transform 0.3s ease,
    background-color 0.3s ease;

  &.is-visible {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
    transform: translateY(0);
  }

  &:hover {
    background-color: color-mix(in srgb, var(--app-text-primary) 10%, transparent);
    transform: translateY(0) scale(1.1);
  }

  .iconfont {
    font-size: 28px;
    line-height: 1;
    color: var(--nav-trigger-hover);
    transition: color 0.3s ease;
  }
}

@media (max-width: 640px) {
  .floating-tools {
    right: 16px;
    bottom: 24px;
  }
}
</style>
