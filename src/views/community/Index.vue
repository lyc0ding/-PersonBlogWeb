<template>
  <div class="container">
     <Banner></Banner>

     <div class="mian-content">
      <Main></Main>
      <CategoryVue></CategoryVue>
     </div>
     
  </div>
</template>

<script setup>
import CategoryVue from './direction/Category.vue';
import Banner from './Banner.vue';
import Main from './Main.vue';
</script>

<style scoped>
.container{
  width: 100%;

  .mian-content{
    margin: 20px auto;
    /* height: 1800px; */
    width: 85%;
    display: grid;
    /* 关键设置：第一列自适应，第二列固定 */
    grid-template-columns: 1fr 250px;
    gap: 10px; /* 可选间距 */
    
  }
}
</style>
