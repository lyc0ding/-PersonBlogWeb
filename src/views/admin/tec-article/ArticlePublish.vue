<template>
  <div class="container">
    <div class="content">
        <MainText></MainText>
    </div>
    <div class="overview">
        <OverView @handlePublish="handlePublish"></OverView>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import MainText from './components/MainText.vue';
import OverView from './components/OverView.vue';

const childRef = ref(null);

// 点击预览页面发布按钮，上传新增内容页面
const handlePublish = () => {
  childRef.value.save()
};

</script>

<style scoped>
.container{
  display: grid;                  /* 启用 Grid 布局 */
  grid-template-columns: 1fr 1fr; /* 两列，各占 1 份（平分宽度） */
  gap: 10px;
}
</style>