<template>
  <div class="container">
    <div class="main-container">
      <MainVue></MainVue>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, toRefs, onMounted } from 'vue'
import MainVue from './Main.vue';

</script>

<style scoped>
.container {
  width: 100%;
  max-width: var(--blog-content-max, 960px);
  margin: 0 auto;
  padding: 16px 16px 40px;
}

.main-container {
  width: 100%;
  margin: 0 auto;
  padding: 8px 0 20px;
}
</style>