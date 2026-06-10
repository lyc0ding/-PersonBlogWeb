<script setup>
import { nextTick } from 'vue'

const props = defineProps({
  storageKey: {
    type: String,
    required: true,
  },
  scrollTargetId: {
    type: String,
    default: 'app',
  },
})

function getScrollContainers() {
  return [
    props.scrollTargetId ? document.getElementById(props.scrollTargetId) : null,
    document.scrollingElement,
    document.documentElement,
    document.body,
  ].filter((item, index, list) => item && list.indexOf(item) === index)
}

function getCurrentScrollTop() {
  return Math.max(
    window.scrollY || window.pageYOffset || 0,
    ...getScrollContainers().map((container) => container.scrollTop || 0)
  )
}

function read() {
  const value = sessionStorage.getItem(props.storageKey)
  if (value == null) return null

  const top = Number(value)
  if (!Number.isFinite(top)) {
    clear()
    return null
  }

  return top
}

function hasSaved() {
  return read() != null
}

function save() {
  sessionStorage.setItem(props.storageKey, String(getCurrentScrollTop()))
}

function clear() {
  sessionStorage.removeItem(props.storageKey)
}

function waitForStableLayout() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(resolve)
    })
  })
}

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

function shouldReduceMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

function scrollToTop(top, behavior = 'auto') {
  const nextTop = Math.max(0, top)

  window.scrollTo({
    top: nextTop,
    behavior,
  })
  getScrollContainers().forEach((container) => {
    if (typeof container.scrollTo === 'function') {
      container.scrollTo({
        top: nextTop,
        behavior,
      })
    } else {
      container.scrollTop = nextTop
    }
  })
}

function animateScrollTo(top, duration = 260) {
  const targetTop = Math.max(0, top)
  const startTop = getCurrentScrollTop()
  const distance = targetTop - startTop

  if (shouldReduceMotion() || duration <= 0 || Math.abs(distance) < 1) {
    scrollToTop(targetTop)
    return Promise.resolve()
  }

  return new Promise((resolve) => {
    const startTime = performance.now()
    const step = (now) => {
      const progress = Math.min(1, (now - startTime) / duration)
      const easedProgress = 1 - Math.pow(1 - progress, 3)

      scrollToTop(startTop + distance * easedProgress)

      if (progress < 1) {
        requestAnimationFrame(step)
        return
      }

      scrollToTop(targetTop)
      resolve()
    }

    requestAnimationFrame(step)
  })
}

async function restore(options = {}) {
  const top = read()
  if (top == null) return false

  await nextTick()
  await waitForStableLayout()

  if (options.behavior === 'smooth') {
    await animateScrollTo(top, options.duration ?? 260)
  } else {
    scrollToTop(top, options.behavior || 'auto')
  }

  if (options.settleDelay !== 0) {
    await wait(options.settleDelay ?? 80)
    await waitForStableLayout()
    scrollToTop(top)
  }

  clear()
  return true
}

defineExpose({
  clear,
  hasSaved,
  read,
  restore,
  save,
})
</script>

<template>
  <slot />
</template>
