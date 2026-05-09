<template>
  <RouterView />
</template>

<script setup>
import { RouterView } from 'vue-router'
import { useThemeStore } from '@/stores/themeStore'

const themeStore = useThemeStore()
themeStore.init()
</script>
