<template>
  <div id="nav-container">
    <div class="nav-inner">
      <div class="nav-brand">
        <router-link to="/" class="site-name" @click="blurTarget">Lycoding</router-link>
        <p class="site-tagline">Move It . Live For Youself .</p>
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

      <div class="nav-actions">
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
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const navItems = [
  { label: '首页', path: '/' },
  { label: '朋友圈', path: '/space' },
  { label: '文章', path: '/technolyge' },
  { label: '留言板', path: '/comments' },
  { label: '照片', path: '/photos' },
  { label: '关于', path: '/about' },
]

const keyword = ref('')
const isDropdownVisible = ref(false)

const blurTarget = (e) => {
  e?.currentTarget?.blur?.()
}

const onSearch = () => {
  if (!keyword.value) return
  router.push({ path: '/technolyge', query: { q: keyword.value } })
}

const showDropdown = () => {
  isDropdownVisible.value = true
}

const hideDropdown = () => {
  isDropdownVisible.value = false
}

const handleMenuClick = (item) => {
  console.log(`选择了: ${item}`)
  isDropdownVisible.value = false
}

const navTo = () => {
  isDropdownVisible.value = false
  router.push('/admin')
}
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
  max-width: 360px;
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
  border-radius: 0 2px 2px 0;
  background: var(--blog-link);
  color: #fff;
  font-size: 14px;
  cursor: pointer;
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
  padding: 8px;
  border: none;
  border-radius: 2px;
  background: transparent;
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

.theme-toggle .iconfont {
  font-size: 20px;
}

.dropdown-wrapper {
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
}

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
