<template>
  <!-- 使用 v-show 控制容器显示/隐藏 -->
  <div id="result-container" v-show="isVisible">
    <div class="result-box">
      <div class="box-title">
        <h3>运行结果</h3>
      </div> 

      <div class="box-text">
        <!-- 使用 ref 获取 DOM 元素 -->
        <p ref="typingTextRef" class="typing-text">
          <!-- 文本将通过打字机效果动态显示 -->
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
// import { defineExpose } from 'vue'

// 控制容器可见性的响应式变量
const isVisible = ref(false)

// 打字机效果相关变量
const typingTextRef = ref(null)
const fullText = "路漫漫其修远兮，吾将上下而求索️🤓\n开源共享👀\n知识面广🧏‍♂️\n多线程学习✈️\n技术提升快🚀"
let displayIndex = 0
let typingTimer = null
const typingSpeed = 70 // 字符显示间隔（毫秒）

// 打字机效果实现方法
const startTypingEffect = async () => {
  // 确保 DOM 已更新
  await nextTick()
  
  // 清除现有文本
  if (typingTextRef.value) {
    typingTextRef.value.textContent = ''
  }
  
  // 重置索引
  displayIndex = 0
  
  // 清除现有定时器
  if (typingTimer) {
    clearInterval(typingTimer)
    typingTimer = null
  }
  
  // 开始打字效果
  typingTimer = setInterval(() => {
    if (displayIndex < fullText.length) {
      // 创建文本节点并添加字符
      const textNode = document.createTextNode(fullText[displayIndex])
      typingTextRef.value.appendChild(textNode)
      
      // 如果是换行符，添加br元素
      if (fullText[displayIndex] === '\n') {
        const br = document.createElement('br')
        typingTextRef.value.appendChild(br)
      }
      
      displayIndex++
    } else {
      // 文本显示完成后清除定时器
      clearInterval(typingTimer)
      typingTimer = null
    }
  }, typingSpeed)
}

// 处理运行事件的方法 - 显示容器并启动打字机效果
const handleRunEvent = (codeContent) => {
  // 显示结果容器
  isVisible.value = true
  // 启动打字效果
  startTypingEffect()
}

// 暴露方法给父组件
defineExpose({
  handleRunEvent
})

// 组件卸载前清除定时器
onBeforeUnmount(() => {
  if (typingTimer) {
    clearInterval(typingTimer)
  }
})

// 组件挂载时不自动启动打字机效果
// onMounted钩子已移除，初始状态不显示
</script>

<style scoped>
#result-container {
    width: 100%;
    height: 100%;
    padding-top: 4%;
}

.result-box {
    color: var(--app-code-text);
    width: 100%;
    min-width: 100%;
    background-color: var(--app-code-header-bg);
    border-radius: 5px;
}

.box-title {
    display: flex;
    align-items: center;
    padding-left: 10px;
    width: 100%;
    height: 50px;
    border-bottom: 1px solid var(--app-code-header-border);
}

.box-title h3 {
    color: var(--app-code-accent);
}

.box-text {
    width: 100%;
    height: 360px;
    padding: 20px 0 0 10px;
}

.typing-text {
    white-space: pre-wrap; /* 保留换行符 */
    position: relative;
}

/* 打字机光标效果 */
.typing-text::after {
    content: '|';
    position: absolute;
    animation: blink 1s infinite;
    color: var(--app-code-text);
    font-weight: bold;
}

@keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
}
</style>