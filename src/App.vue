<template>
  <PetDog />
  <RouterView />
</template>

<script setup>
import { RouterView } from 'vue-router'
import { useThemeStore } from '@/stores/themeStore'
import { useSiteConfigStore } from '@/stores/siteConfigStore'
import PetDog from '@/components/pet/PetDog.vue'

const themeStore = useThemeStore()
const siteConfigStore = useSiteConfigStore()
themeStore.init()
siteConfigStore.loadConfigs()
</script>
