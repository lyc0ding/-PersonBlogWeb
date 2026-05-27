<template>
  <PetDog />
  <RouterView />
</template>

<script setup>
import { RouterView } from 'vue-router'
import { useThemeStore } from '@/stores/themeStore'
import PetDog from '@/components/pet/PetDog.vue'

const themeStore = useThemeStore()
themeStore.init()
</script>
