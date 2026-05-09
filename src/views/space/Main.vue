<template>
  <div id="container">

    <ImagePreviewer
      :show-preview="showImagePreview"
      :current-image="currentPreviewImage"
      @close="closeImagePreview">
    </ImagePreviewer>

    <div class="main">
      <div class="contents">
        <div class="paragraph" v-for="(item, index) in 3" :key="index" ref="paragraphs">
          <div class="paragraph-inner" :class="{ 'expanded': expandedStates[index] }">
            <div class="paragraph-head">
              <div class="paragraph-head-left">
                <h2>呜呜呜~今天有点倒霉</h2>
              </div>
              <div class="paragraph-head-right">
                <i class="iconfont icon-rili">&nbsp;&nbsp;7 月 24 日, 2025年&nbsp;&nbsp;|&nbsp;&nbsp;</i>
                <i class="iconfont icon-clock">&nbsp;&nbsp;10:24:65</i>
              </div>
            </div>
            <div class="paragraph-content">
              <img :src=img1 @click="openImagePreview(img1)">
              <img :src=img2 @click="openImagePreview(img2)">
              <p>今天真是倒霉透了！先是早上闹钟没响，起床就晚了一个小时。匆忙中又打翻了咖啡，把新买的衬衫弄脏了。</p>
            </div>

            <div class="paragraph-bottom">
                <i class="iconfont iconfont1 icon-hot"/>&nbsp;3.7k热度&nbsp;&nbsp;
                <i class="iconfont iconfont2 icon-comments"/>&nbsp;45留言
            </div>
          </div>
          <div class="show-more" v-if="showMoreStates[index] || expandedStates[index]" 
               @click="toggleParagraph(index)">
               <i class="iconfont" :class="[expandedStates[index] ? ' icon-xiangshangjiantou' : 'icon-xiangxiajiantou']"></i>
            {{ expandedStates[index] ? '收起内容' : '展示更多' }}
          </div>
        </div>
      </div>

      <!-- 右侧个人信息展示组件 -->
      <PersonBox></PersonBox> 
    </div>

    <!-- 消息展示组件 -->
    <MessageVue 
      ref="toastMessage" 
      position="right" 
      :duration="2000"
      content="点赞成功">
    </MessageVue>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import PersonBox from '../../components/sider/Introduction.vue'
import ImagePreviewer from '@/components/image/ImagePreviewer.vue'
import MessageVue from '@/components/Message/Index.vue'

// 用于存储每个段落的展开状态
const expandedStates = ref(Array(10).fill(false));
// 用于记录哪些段落需要显示"展示更多"按钮
const showMoreStates = ref(Array(10).fill(false));
// 获取段落元素的引用
const paragraphs = ref([]);

// 添加 Message 的引用
const toastMessage = ref(null)

const img1 = ref('/img/bac1.jpg')
const img2 = ref('/img/bac2.jpg')

// 挂载后检查哪些段落需要显示"展示更多"按钮
onMounted(() => {
  setTimeout(() => {
    showMoreStates.value = paragraphs.value.map(paragraph => {
      const inner = paragraph.querySelector('.paragraph-inner');
      return inner && inner.scrollHeight > 500;
    });
  }, 100);
});

// 切换段落的展开状态
const toggleParagraph = (index) => {
  expandedStates.value[index] = !expandedStates.value[index];
};

// 处理点赞点击
const handleLike = () => {
   // 手动触发消息显示
  toastMessage.value.show();
}

// 添加图片预览状态
const showImagePreview = ref(false);
const currentPreviewImage = ref('');

// 打开图片预览
const openImagePreview = (imgSrc) => {
  currentPreviewImage.value = imgSrc;
  showImagePreview.value = true;
};

// 关闭图片预览
const closeImagePreview = () => {
  showImagePreview.value = false;
};
</script>

<style scoped>
#container{
  width: 100%;
  margin-top: 50px;
  display: flex;
  justify-content: center;
  min-width: 1500px;

  .main{
    width: 85%;
    display: flex;
    gap: 10px;
    flex-direction: row;

    .contents{
      flex:1;
      display: flex;
      flex-direction: column; /* 垂直排列 */
      gap: 10px; /* 子元素间统一间距 */

      .paragraph{
        width: 100%;
        /* border-radius: 15px; */
        background-color: var(--app-surface);
        color: var(--app-text-primary);
        position: relative;
        box-shadow: 0 4px 12px var(--app-shadow-soft);
        transition: all 0.3s ease;
        
        .paragraph-inner {
          max-height: 500px;
          overflow: hidden;
          transition: max-height 0.5s ease;
        }
        
        .paragraph-inner.expanded {
          max-height: 2000px; /* 足够大的值容纳内容 */
        }

        .paragraph-head{
          width: 100%;  
          display: flex;
          border-radius: 15px 15px 0 0 ;
          padding: 10px 25px 0 25px;
          background-color: var(--app-surface-muted);
          border-bottom: 1px solid var(--app-divider-subtle);

          .paragraph-head-left{
            width: 50%;
            height: 100%;

            h2 {
              font-size: 20px;
              margin: 15px 0 10px;
              color: var(--app-text-primary);
              font-weight: 600;
            }
          }

          .paragraph-head-right{
            width: 50%;
            height: 100%;
            padding: 10px;
            text-align: right;
            color: var(--app-text-secondary);
            font-size: 14px;
            display: flex;
            justify-content: flex-end;
            align-items: center;
          }

        }
        .paragraph-content{
          width: 100%;
          padding: 20px;
          
          p {
            font-size: 16px;
            line-height: 1.8;
            color: var(--app-text-secondary);
            margin: 0 0 15px 0;
          }

          img{
            margin-top: 10px;
            width: 70%;
            height: auto; 
            display: block; 
            border-radius: 8px;
            box-shadow: 0 2px 8px var(--app-shadow-soft);
          }

          img + img {
            margin-top: 20px;
          }
        }
        .paragraph-bottom{
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: end;
          padding: 15px 20px;
          user-select: none;

          .iconfont1{
              color: var(--app-hot-icon);
              font-size: 20px;
          }

          .iconfont2{
              color: var(--app-comments-icon);
              font-size: 20px;
          }
        }
      }
      
      .show-more {
        width: 200px;
        padding: 8px 12px;
        text-align: center;
        color: var(--app-text-primary);
        border-radius: 4px;
        cursor: pointer;
        margin: 15px auto;
        font-size: 14px;
        transition: all 0.3s;
        position: relative;
        box-shadow: 0 2px 5px var(--app-shadow-soft);
      }
    }
  }
}
</style> 