<template>
  <div id="nav-container">
    <div class="nav-inner">
      <div class="nav-brand">
        <router-link to="/" class="site-name" @click="blurTarget">{{ brandName }}</router-link>
        <p class="site-tagline">{{ siteTagline }}</p>
      </div>

      <div class="nav-toolbar">
        <form class="search" role="search" @submit.prevent="onSearch">
          <label class="sr-only" for="global-search">搜索关键字</label>
          <input
            id="global-search"
            v-model.trim="keyword"
            type="search"
            class="search-input"
            placeholder="搜索关键字"
            autocomplete="off"
          />
          <button type="submit" class="search-btn">搜索</button>
          <button
            type="button"
            class="theme-toggle"
            :disabled="isThemeTransitioning"
            :aria-label="isDark ? '切换为浅色模式' : '切换为深色模式'"
            :title="isDark ? '切换为浅色模式' : '切换为深色模式'"
            @click="toggleTheme"
          >
            <i class="iconfont" :class="themeIcon" aria-hidden="true" />
          </button>
        </form>

        <nav class="nav-links" aria-label="主导航">
          <router-link
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="nav-link"
            active-class="active"
            exact-active-class="active"
          >
            {{ item.label }}
          </router-link>
        </nav>
      </div>

      <!-- <div class="nav-actions">
        <div class="dropdown-wrapper" @mouseenter="showDropdown" @mouseleave="hideDropdown">
          <i class="iconfont icon-gengduo dropdown-trigger" aria-hidden="true" />
          <transition name="fade">
            <ul v-show="isDropdownVisible" class="dropdown-menu">
              <li @click="handleMenuClick('个人信息')">个人信息</li>
              <li @click="navTo">后台管理</li>
              <li @click="handleMenuClick('主题')">设置</li>
              <li @click="handleMenuClick('退出')">退出</li>
            </ul>
          </transition>
        </div>
      </div> -->
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useSiteConfigStore } from '@/stores/siteConfigStore'
import { useThemeStore } from '@/stores/themeStore'

const router = useRouter()
const siteConfigStore = useSiteConfigStore()
const themeStore = useThemeStore()
const { isDark } = storeToRefs(themeStore)

const fallbackNavItems = [
  { label: '首页', path: '/' },
  { label: '朋友圈', path: '/space' },
  { label: '文章', path: '/articles' },
  { label: '留言板', path: '/comments' },
  { label: '照片', path: '/photos' },
  { label: '关于', path: '/about' },
]

const brandName = computed(() => siteConfigStore.value('site.owner', 'Lycoding'))
const siteTagline = computed(() => siteConfigStore.value('site.tagline', 'Move It . Live For Youself .'))
const navItems = computed(() => {
  const items = siteConfigStore.json('site.navItems', fallbackNavItems)
  if (!Array.isArray(items)) return fallbackNavItems
  const normalized = items
    .filter((item) => item?.visible !== false && item?.label && item?.path)
    .map((item) => ({
      label: String(item.label),
      path: String(item.path),
    }))
  return normalized.length ? normalized : fallbackNavItems
})

const keyword = ref('')
const isThemeTransitioning = ref(false)
const themeIcon = computed(() => (isDark.value ? 'icon-wanshang' : 'icon-qingbaitian'))
// const isDropdownVisible = ref(false)

const blurTarget = (e) => {
  e?.currentTarget?.blur?.()
}

const onSearch = () => {
  if (!keyword.value) return
  router.push({ path: '/articles', query: { q: keyword.value } })
}

const toggleTheme = async (event) => {
  if (isThemeTransitioning.value) return

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const supportsViewTransition = typeof document.startViewTransition === 'function'

  const applyTheme = async () => {
    themeStore.toggle()
    await nextTick()
  }

  if (!supportsViewTransition || prefersReducedMotion) {
    await applyTheme()
    return
  }

  const buttonRect = event?.currentTarget?.getBoundingClientRect?.()
  const x = buttonRect ? buttonRect.left + buttonRect.width / 2 : window.innerWidth / 2
  const y = buttonRect ? buttonRect.top + buttonRect.height / 2 : window.innerHeight / 2
  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  )
  const root = document.documentElement

  isThemeTransitioning.value = true
  root.classList.add('theme-transitioning')

  const transition = document.startViewTransition(applyTheme)

  try {
    await transition.ready
    const animation = root.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: 650,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        pseudoElement: '::view-transition-new(root)',
      }
    )
    await Promise.allSettled([animation.finished, transition.finished])
  } finally {
    root.classList.remove('theme-transitioning')
    isThemeTransitioning.value = false
  }
}

// const showDropdown = () => {
//   isDropdownVisible.value = true
// }

// const hideDropdown = () => {
//   isDropdownVisible.value = false
// }

// const handleMenuClick = (item) => {
//   console.log(`选择了: ${item}`)
//   isDropdownVisible.value = false
// }

// const navTo = () => {
//   isDropdownVisible.value = false
//   router.push('/admin')
// }

onMounted(() => {
  siteConfigStore.loadConfigs()
})
</script>

<style scoped>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

#nav-container {
  width: 100%;
  min-height: var(--blog-header-height, 108px);
  padding: 14px 20px 12px;
  background-color: var(--app-nav-bg);
  border-bottom: 1px solid var(--blog-nav-border);
  position: fixed;
  top: 0;
  z-index: 1000;
  user-select: none;
}

.nav-inner {
  width: var(--blog-content-width);
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px 24px;
}

.nav-brand {
  flex: 0 0 auto;
  min-width: 0;
}

.site-name {
  font-size: 1.75rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--app-text-primary);
  text-decoration: none;
}

.site-name:hover {
  color: var(--blog-link);
}

.site-tagline {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--app-text-muted);
}

.nav-toolbar {
  flex: 1 1 280px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 10px;
  min-width: 0;
}

.search {
  display: flex;
  width: 100%;
  max-width: 404px;
  margin-left: auto;
  gap: 0;
}

.search-input {
  flex: 1;
  min-width: 0;
  height: 34px;
  padding: 0 10px;
  border: 1px solid var(--blog-input-border);
  border-right: none;
  border-radius: 2px 0 0 2px;
  background: var(--app-surface);
  color: var(--app-text-primary);
  font-size: 14px;
}

.search-input:focus {
  outline: none;
  border-color: var(--blog-link);
}

.search-btn {
  height: 34px;
  padding: 0 14px;
  border: 1px solid var(--blog-link);
  border-radius: 0;
  background: var(--blog-link);
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  margin-right: 10px;
}

.search-btn:hover {
  filter: brightness(1.05);
}

.nav-links {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 4px 18px;
  padding-top: 2px;
}

.nav-link {
  font-size: 15px;
  color: var(--blog-nav-link);
  text-decoration: none;
  padding: 2px 0;
  border-bottom: 2px solid transparent;
  transition: color 0.2s ease, border-color 0.2s ease;
}

.nav-link:hover {
  color: var(--blog-link);
}

.nav-link.active {
  color: var(--blog-link);
  font-weight: 600;
  border-bottom-color: var(--blog-link);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
}

.theme-toggle {
  flex: 0 0 auto;
  width: 30px;
  height: 30px;
  padding: 0;
  border: 1px solid var(--blog-input-border);
  border-radius: 50%;
  background: var(--app-surface);
  cursor: pointer;
  color: var(--blog-nav-link);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease, background-color 0.2s ease;
}

.theme-toggle:hover {
  color: var(--blog-link);
  background-color: var(--blog-nav-link-hover-bg);
}

.theme-toggle:disabled {
  cursor: default;
  opacity: 0.85;
}

.theme-toggle .iconfont {
  font-size: 20px;
}

:global(::view-transition-old(root)),
:global(::view-transition-new(root)) {
  animation: none;
  mix-blend-mode: normal;
}

:global(html.theme-transitioning::view-transition-old(root)),
:global(html.theme-transitioning::view-transition-new(root)) {
  pointer-events: none;
}

:global(html.theme-transitioning::view-transition-new(root)) {
  z-index: 1;
}

:global(html.theme-transitioning::view-transition-old(root)) {
  z-index: 0;
}

/* .dropdown-wrapper {
  position: relative;
  display: inline-block;
  cursor: pointer;
}

.dropdown-trigger {
  font-size: 22px;
  padding: 8px;
  color: var(--blog-nav-link);
  transition: color 0.2s ease;
}

.dropdown-trigger:hover {
  color: var(--blog-link);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  min-width: 160px;
  background-color: var(--nav-dropdown-bg);
  border: 1px solid var(--blog-divider);
  border-radius: 2px;
  box-shadow: 0 4px 12px var(--app-shadow-soft);
  list-style: none;
  padding: 6px 0;
  margin: 6px 0 0;
  z-index: 2000;
}

.dropdown-menu li {
  padding: 10px 18px;
  font-size: 14px;
  color: var(--nav-dropdown-text);
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
  white-space: nowrap;
}

.dropdown-menu li:hover {
  background-color: var(--nav-dropdown-hover-bg);
  color: var(--blog-link);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
  transform-origin: top right;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
} */

@media (max-width: 720px) {
  .search {
    margin-left: 0;
    max-width: none;
  }

  .nav-links {
    justify-content: flex-start;
  }

  .nav-inner {
    flex-direction: column;
  }

  .nav-actions {
    align-self: flex-end;
  }
}
</style>
