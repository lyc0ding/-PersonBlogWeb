<template>
  <div class="container">
    <div class="notice">
        <i class="iconfont icon-notify"></i>
        <div class="title">欢迎大家一起学习交流~</div>
    </div>
    
    <div class="main">
        <!-- 为每个paragraph绑定动态背景图 -->
        <div class="paragraph" 
             v-for="item in contentList" 
             :key="item.id"
             :style="{'background-image': `url(${item.img})`}">  <!-- 关键修改：动态设置背景图 -->
            <div class="image " :class="[calculate(item.id) ? 'img-left':'img-right']">
                <img :src="item.img" alt="内容图片">
            </div>
            <div class="content" :class="[calculate(item.id) ? 'content-right':'content-left']">
                <div class="content-info">
                    <i class="iconfont icon-rili">&nbsp;&nbsp;7 月 24 日, 2025年&nbsp;&nbsp;|&nbsp;&nbsp;</i>
                    <i class="iconfont icon-clock">&nbsp;&nbsp;10:24:65</i>
                </div>
                <!-- 补充标题和内容展示 -->
                <div class="content-title">
                    {{ item.title }}
                    <div class="sign" v-for="sign in item.signs" :style="{'backgroundColor':`${sign.color}`}">
                        <i class="iconfont" :class="sign.icon">&nbsp;&nbsp;{{ sign.title }}</i>
                    </div>
                </div>
                <div class="content-text" v-html="item.content"></div>

                <div class="bottom" :class="[calculate(item.id) ? 'bottom-right':'bottom-left']">
                    <i class="iconfont iconfont1 icon-hot"/>&nbsp;3.7k热度&nbsp;&nbsp;
                    <i class="iconfont iconfont2 icon-comments"/>&nbsp;45留言
                </div>
            </div>
        </div>
    </div>

    <div class="footer">
        <PaginateVue></PaginateVue>
    </div>  
  </div>
</template>

<script setup>
import { ref } from 'vue';
import PaginateVue from '@/components/Pagination/Paginate.vue';

const contentList = ref([
    {
        id: 1,
        img: 'src/assets/img/vscode.png',
        title: '内容标题 1',  // 修正模板语法，直接写固定值或用index动态生成
        signs: [
            {
                icon: 'icon-biaoqian',
                title: '技术',
                color:'#FF7C25',
            }
        ],
        content:'这是斜线右侧的内容区域，占据了70%的宽度。这里可以放置详细的文字描述、列表或其他内容元素，与左侧的图片形成良好的视觉平衡。<br>通过斜线分隔创造出独特的视觉效果，使页面更具现代感和设计感。'
    },
    {
        id: 2,
        img: 'src/assets/img/bac1.jpg',
        title: '内容标题 2',
        signs: [
            {
                icon: 'icon-zujian',
                title: '组件',
                color:'#8AFFD6',
            },
            {
                icon: 'icon-wenjian',
                title: '代码',
                color:'#24BA43',
            },
            {
                icon: 'icon-biaoqian1',
                title: '水水文章',
                color:'#AC43FA',
            }
        ],
        
        content:'这是斜线右侧的内容区域，占据了70%的宽度。这里可以放置详细的文字描述、列表或其他内容元素，与左侧的图片形成良好的视觉平衡。<br>通过斜线分隔创造出独特的视觉效果，使页面更具现代感和设计感。'
    },
    {
        id: 3,
        img: 'src/assets/img/404.png',
        title: '内容标题 3',
        content:'这是斜线右侧的内容区域，占据了70%的宽度。这里可以放置详细的文字描述、列表或其他内容元素，与左侧的图片形成良好的视觉平衡。<br>通过斜线分隔创造出独特的视觉效果，使页面更具现代感和设计感。'
    },
    {
        id: 4,
        img: 'src/assets/img/404.png',
        title: '内容标题 3',
        content:'这是斜线右侧的内容区域，占据了70%的宽度。这里可以放置详细的文字描述、列表或其他内容元素，与左侧的图片形成良好的视觉平衡。<br>通过斜线分隔创造出独特的视觉效果，使页面更具现代感和设计感。'
    },
    {
        id: 5,
        img: 'src/assets/img/404.png',
        title: '内容标题 3',
        content:'这是斜线右侧的内容区域，占据了70%的宽度。这里可以放置详细的文字描述、列表或其他内容元素，与左侧的图片形成良好的视觉平衡。<br>通过斜线分隔创造出独特的视觉效果，使页面更具现代感和设计感。'
    }
])

const calculate = (value) => {
    return value % 2 !== 0;  // 简化判断逻辑
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

.notice > .iconfont {
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
    margin-top: 30px;
    position: relative;
    overflow: hidden;
    transition: box-shadow 0.3s ease;
    /* 背景图基础样式 */
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
}

.paragraph:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.image{
    width: 35%;
    height: 100%;
    transition: transform 0.5s ease;
    position: absolute;
    top: 0;

    img{
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
}

/* 图片在左 */
.img-left{
    left: 0;
}

/* 图片在右 */
.img-right{
    right: 0;
}

/* 内容图片动画 */
.img-left, .img-right {
    transition: transform 0.2s ease;
}

.paragraph:hover .img-left,
.paragraph:hover .img-right {
    transform: rotate(2deg) scale(1.10); 
    transition: transform 0.2s ease; /* 确保动画过渡效果 */
}

.content{
    position: absolute;
    top: 0;
    width: 70%;
    height: 100%;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    backdrop-filter: blur(50px);

    .iconfont{
        font-size: 15px;
        color: white;
    }
}

/* 内容在左*/
.content-left {
    left: 0;
    clip-path: polygon(0 0, 100% 0, 95% 100%, 0 100%);
    .content-info{
        height: 30px;
        padding: 10px;
    }

    .content-title {
        padding: 10px;
    }

    .content-text {
        padding: 10px;
        flex: 1;
        overflow: auto;
        line-height: 1.6;
    }
}

/* 内容在右*/
.content-right {
    right: 0;
    clip-path: polygon(5% 0, 100% 0, 100% 100%, 0 100%);

    .content-info{
        height: 30px;
        text-align: right;
        padding:10px;
    }

    .content-title {
        padding: 10px 50px;
    }

    .content-text {
        padding: 10px 50px;
        flex: 1;
        overflow: auto;
        line-height: 1.6;
        /* background-color: pink; */
    }
    
}

.content-title {
    font-size: 30px;
    margin: 0;
    color: white;
    display: flex;
    align-items: center;

    .sign{
        margin-left: 5px;
        padding: 0 15px;
        height: 50%;
        font-size: 14px;
        border-radius: 5px;
        user-select: none;

        &:first-child{
            margin-left: 50px!important;
        }
    }
}

.content-text {
    padding: 0 10px 10px;
    flex: 1;
    overflow: auto;
    color: white;
    line-height: 1.6;
}

.bottom{
    width: 100%;
    color: white;
    display: flex;
    align-items: center;

    .iconfont1{
        color: red;
        font-size: 20px;
    }

    .iconfont2{
        color: aqua;
        font-size: 20px;
    }
}

.bottom-right{
    padding: 0 20px 5px 0 ;
    justify-content: end;
}

.bottom-left{
    padding: 0 0 10px 20px;
    justify-content: start;
}

.footer{
    width: 100%;
    height: 50px;
    background-color: pink;
}
</style>
    