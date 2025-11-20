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
.container{
  width: 100%;
}

.main-container{
    width: 85%;
    margin:0 auto;
    padding: 20px 0;
    /* background-color: aqua; */
}
</style>