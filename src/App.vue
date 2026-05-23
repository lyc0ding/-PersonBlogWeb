<template>
  <MyPet />
  <RouterView />
</template>

<script setup>
import { RouterView } from 'vue-router'
import { useThemeStore } from '@/stores/themeStore'
import MyPet from './components/pet/MyPet.vue';

const themeStore = useThemeStore()
themeStore.init()
</script>
