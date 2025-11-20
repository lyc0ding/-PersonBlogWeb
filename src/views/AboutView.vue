<template>
  <div class="container">
    <div class="notice">
        <i class="iconfont icon-notify"></i>
        <div class="title">欢迎大家一起学习交流~</div>
    </div>
    
    <div class="main">
        <div class="paragraph" v-for="item in 4">
            <div class="image">
                <img src="/img/neymar.jpg" style="width:100%;height: 100%;object-fit: cover;">
            </div>
            <div class="content">

            </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const contentList = ref([
    {
        id: 1,
        img: 'src/assets/img/neymar.jpg',
        title: '内容标题 {{ index + 1 }}',
        content:'这是斜线右侧的内容区域，占据了70%的宽度。这里可以放置详细的文字描述、列表或其他内容元素，与左侧的图片形成良好的视觉平衡。<br>通过斜线分隔创造出独特的视觉效果，使页面更具现代感和设计感。'
    },
    {
        id: 2,
        img: 'src/assets/img/avatar.png',
        title: '内容标题 {{ index + 1 }}',
        content:'这是斜线右侧的内容区域，占据了70%的宽度。这里可以放置详细的文字描述、列表或其他内容元素，与左侧的图片形成良好的视觉平衡。<br>通过斜线分隔创造出独特的视觉效果，使页面更具现代感和设计感。'
    },
    {
        id: 3,
        img: 'https://picsum.photos/seed/img${index}/600/400',
        title: '内容标题 {{ index + 1 }}',
        content:'这是斜线右侧的内容区域，占据了70%的宽度。这里可以放置详细的文字描述、列表或其他内容元素，与左侧的图片形成良好的视觉平衡。<br>通过斜线分隔创造出独特的视觉效果，使页面更具现代感和设计感。'
    }
])

const calculate = (value) => {
    if (value % 2 != 0) {
        return true;
    } else {
        return false
    }
}
</script>

<style scoped>
.container {
    background-color: white;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 30px;
}

.notice {
    width: 100%;
    height: 50px;
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 0 30px;
    user-select: none;
}

.iconfont {
    font-size: 30px;
    color: rgb(255, 122, 5);
    /* 添加缩放动画 */
    animation: scaleAnimation 2s infinite ease-in-out;
    /* 确保缩放中心点为图标中心 */
    transform-origin: center;
}

.title {
    margin-left: 20px;
    font-size: 23px;
}

/* 喇叭缩放动画关键帧 */
@keyframes scaleAnimation {
    0% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.3);
    }
    100% {
        transform: scale(1);
    }
}

.main{
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.paragraph{
    width: 100%;
    height: 250px;
    border: grey 1px solid;
    position: relative;
    overflow: hidden;
    transition: box-shadow 0.3s ease;
    display: flex;
}

.image{
    width: 30%;
    height: 100%;
    background-color: aqua;
}

.content{
    flex: 1;
    background-color: yellow;
}
</style>
    