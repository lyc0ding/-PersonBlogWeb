<template>
  <div id="banner-container">
    <div class="famous-remark">
      <h1>
        {{ displayText }}
        <span class="cursor" v-if="showCursor">|</span>
      </h1>

      <div class="statistic" > 
        <div style="margin-right: 15px;">
          <el-statistic :value="studyNum"/> 
          <p class="stat-label">学习人数</p>
        </div>

        <div style="margin-left: 15px;text-align: center;">
          <el-statistic :value="onlineNum"/>
          <p class="stat-label">在线人数</p>
        </div>
      </div>
    </div>

    <!-- 电脑屏幕+代码、运行结果 -->
    <div class="code-container">
      <div class="computer">
         <div class="code-source">
          <Code @run="handleRunEvent"/>
         </div>
      </div>

      <div style="width: 200px;height: 100%;min-width: 200px;">
        <!-- 占位置的盒子 -->
      </div>

      <!-- 代码运行结果 -->
      <div class="code-result">
        <Results ref="resultsRef"></Results>
      </div> 
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useTransition } from '@vueuse/core'
import Code from './Code.vue'
import Results from './Results.vue'

// 创建Results组件的ref
const resultsRef = ref(null)

// 学习人数加载效果
const source1 = ref(0)
const studyNum = useTransition(source1, {
  duration: 1500,
})
source1.value = 15647

// 在线人数加载效果
const source2 = ref(0)
const onlineNum = useTransition(source2, {
  duration: 1500,
})
source2.value = 47

const originalText = '无私奉献不是天方夜谭，有时候，我们也可以做到！'
const displayText = ref('')
const showCursor = ref(true) // 控制光标显示状态
const delay = 150 // 每个字符显示的延迟时间，单位为毫秒

// Code组件运行时发消息
const handleRunEvent = (codeContent) => {
  // console.log('收到运行请求，代码内容：', codeContent)
  // 立即调用Results组件的方法
  if (resultsRef.value) {
    resultsRef.value.handleRunEvent(codeContent)
  }
}

onMounted(() => {
  let index = 0
  const timer = setInterval(() => {
    if (index < originalText.length) {
      displayText.value += originalText.charAt(index)
      index++
    } else {
      clearInterval(timer)
      // 文字显示完后，让光标继续闪烁2秒再消失
      // setTimeout(() => {
      //   showCursor.value = false
      // }, 2000)
    }
  }, delay)
})
</script>

<style scoped>
#banner-container {
  width: 100%;

  .famous-remark {
    width: 100%;
    height: 200px;
    display: flex;
    align-items: center;
    justify-content:center;
    flex-direction: column;
    .statistic{
      display: flex;
      flex-direction: row;
    }
  }

  .code-container{
    width: 100%;
    height: 750px;
    padding:4%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;

    .computer{
      padding-top: 33px;
      position: relative; /* 确保z-index生效 */
      z-index: 10; /*悬停时确保在最上层*/
      display: flex;
      justify-content: center;
      width: 750px;
      min-width: 750px;
      height: 600px;
      background: url('@/assets/img/image.png');
      background-size:cover;     /* 等比例缩放填满容器 */
      background-position: center; /* 图片居中 */
      background-repeat: no-repeat; /* 不重复 */
      transition: transform 0.4s ease-out; /* 添加平滑过渡效果 */
      
      .code-source{
        width: 685px;
        min-width: 685px;
        height: 388px;
      }
    }

      .computer:hover {
        transform: translateY(-20px); /* 鼠标悬停时上移20像素 */
      }

    .code-result{
      width: 45%;
      height: 600px;
      z-index: 10;
    }

    .code-result {
      /* 添加过渡效果使结果区域同步上移 */
      transition: transform 0.4s ease-out;
    }
  }
  
  h1 {
    font-size: 24px;
    white-space: nowrap; /* 防止文字换行 */
    position: relative;
    background: linear-gradient(to right, var(--app-gradient-start), var(--app-gradient-end));
    background-clip: text; /* 将背景裁剪到文字区域 */
    -webkit-text-fill-color: transparent; /* 设置文字颜色为透明 */
    margin-top: 50px;
  }
  
  .cursor {
    animation: blink 1s infinite;
    margin-left: 3px; /* 光标与文字之间的间距 */
    background-color: var(--app-cursor-block);

  }

  .stat-label {
    color: var(--app-stat-label);
  }
  
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }
}
</style>