<template>
  <div id="main-container">
    <div class="title1">
        <h3>建站时间线</h3>
    </div>

    <TimeLine/>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import TimeLine from '@/views/home/TimeLine.vue';

</script>

<style scoped>
#main-container {
  width: 100%;
  height: 1000px;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: 'Noto Sans SC', sans-serif;
}

.title1 {
  width: 100%;
  text-align: center;
  position: relative;
}

.title1 h3 {
  /* 字体设置 */
  font-family:'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
  font-size: 2.2rem;
  font-weight: 700;
  letter-spacing: 1px;
  color: white;
}



</style>