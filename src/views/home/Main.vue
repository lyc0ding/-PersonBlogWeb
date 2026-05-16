<template>
  <div id="main-container">
    <div class="title1">
      <h3>建站时间线</h3>
    </div>

    <TimeLine />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import TimeLine from '@/views/home/TimeLine.vue';

</script>

<style scoped>
#main-container {
  width: 100%;
  max-width: var(--blog-content-max, 960px);
  margin: 0 auto;
  padding: 8px 16px 48px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.title1 {
  width: 100%;
  text-align: center;
  padding: 12px 0 20px;
  border-bottom: 1px solid var(--blog-divider);
  margin-bottom: 8px;
}

.title1 h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: var(--app-text-primary);
}



</style>