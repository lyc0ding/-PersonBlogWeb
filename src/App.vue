<template>
  <PetDog v-if="showPet" />
  <RouterView />
</template>

<script setup>
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { useThemeStore } from '@/stores/themeStore'
import { useSiteConfigStore } from '@/stores/siteConfigStore'
import PetDog from '@/components/pet/PetDog.vue'

const route = useRoute()
const themeStore = useThemeStore()
const siteConfigStore = useSiteConfigStore()
const showPet = computed(() => {
  return !route.path.startsWith('/admin') && !route.matched.some((item) => item.name === 'Admin')
})

themeStore.init()
siteConfigStore.loadConfigs()
</script>
