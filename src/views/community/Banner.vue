<template>
  <div class="container">
    <div class="famous-remark">
      <h1>
        {{ displayText }}
        <span class="cursor" v-if="showCursor">|</span>
      </h1>

      <div class="statistic" > 
        <div style="margin-right: 15px;">
          <el-statistic :value="studyNum"/> 
          <p style="color: black;">学习人数</p>
        </div>

        <div style="margin-left: 15px;text-align: center;">
          <el-statistic :value="onlineNum"/>
          <p style="color: black;">在线人数</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useTransition } from '@vueuse/core'

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
.container{
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
  
    h1 {
        font-size: 24px;
        white-space: nowrap; /* 防止文字换行 */
        position: relative;
        background: linear-gradient(to right, #22df6a, #59cdeb); /* 设置从左到右的线性渐变 */
        background-clip: text; /* 将背景裁剪到文字区域 */
        -webkit-text-fill-color: transparent; /* 设置文字颜色为透明 */
        margin-top: 50px;
    }
  
    .cursor {
        animation: blink 1s infinite;
        margin-left: 3px; /* 光标与文字之间的间距 */
        background-color: #000;

    }
  
    @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0; }
    }
}
</style>
