<template>
  <div class="container">
     <Banner></Banner>

     <div class="mian-content">
      <Main></Main>
      <div style="display: flex;flex-direction: column;gap: 10px;">
        <Introduction></Introduction>
        <TagCloud></TagCloud>
      </div>
     </div>
     
  </div>
</template>

<script setup>
import TagCloud from '../../components/sider/TagCloud.vue';
import Introduction from '@/components/sider/Introduction.vue';
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
