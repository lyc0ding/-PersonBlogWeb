import { defineStore } from 'pinia'
import { ref } from 'vue'

const STORAGE_KEY = 'personblog-theme'

function applyToDocument(isDark) {
  const root = document.documentElement
  root.classList.toggle('dark', isDark)
  root.style.colorScheme = isDark ? 'dark' : 'light'
}

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(false)

  function persist() {
    localStorage.setItem(STORAGE_KEY, isDark.value ? 'dark' : 'light')
  }

  function init() {
    let saved = localStorage.getItem(STORAGE_KEY)
    if (saved !== 'dark' && saved !== 'light') {
      const legacy = localStorage.getItem('theme')
      if (legacy === 'dark' || legacy === 'light') {
        saved = legacy
        localStorage.setItem(STORAGE_KEY, legacy)
      }
    }
    if (saved === 'dark' || saved === 'light') {
      isDark.value = saved === 'dark'
    } else {
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    applyToDocument(isDark.value)
  }

  function toggle() {
    isDark.value = !isDark.value
    persist()
    applyToDocument(isDark.value)
  }

  return { isDark, init, toggle }
})
