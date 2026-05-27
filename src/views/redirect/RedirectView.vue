<!-- views/redirect/RedirectView.vue -->
<template>
  <div></div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

onMounted(() => {
  const { params, query } = route
  const { path } = params
  
  router.replace({ path: '/' + path, query })
})
</script>
