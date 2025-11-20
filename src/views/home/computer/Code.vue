<template>
  <div id="code-screen">
    <CodeMirror 
      v-model="code" 
      :extensions="extensions" 
      style="height: 100%;width: 100%;border: none;"/>
      <el-button @click="handleRun" type="success" plain style="position: absolute;top: 10px;right: 10px;width: 53px;height: 23px;">
        <i class="iconfont icon-yunhang "/>运行
      </el-button>
  </div>
</template>

<script setup>
import CodeMirror from 'vue-codemirror6';
import { java } from '@codemirror/lang-java';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView } from '@codemirror/view';
import { ref } from 'vue';
import { EditorState } from "@codemirror/state"; // 关键修复

// 声明自定义事件
const emit = defineEmits(['run'])

// 处理运行按钮点击
const handleRun = () => {
  emit('run', 'run') // 触发事件并传递当前代码
}

const code = ref(`
public class Main{
    public static void main(String[] args) {
        System.out.println("路漫漫其修远兮，吾将上下而求索️🤓");
        new Thread(new Technique()).start();
    }
}
class Technique implements Runnable{
    @Override
    public void run() {
        System.out.println("开源共享👀");
        System.out.println("知识面广🧏‍♂️");
        System.out.println("多线程学习✈️");
        System.out.println("技术提升快🚀");
    }
}
`);

// 扩展配置（替代旧版 options）
const extensions = [
  java(), // Java 语言支持
  oneDark, // 主题
  EditorView.lineNumbers, // 行号
  EditorView.contentAttributes.of({ autocapitalize: "on" }), // 自动大写
  EditorState.tabSize.of(4), // 缩进 4 空格[6,7](@ref)
   // 添加字体自定义扩展 [6,9](@ref)
  EditorView.theme({
    ".cm-content, .cm-gutter": {
      fontFamily: '"JetBrains Mono", "Fira Code", Consolas, "Courier New", monospace', // 优先使用开发字体
      fontSize: "14px",
      lineHeight: "1.5",
      letterSpacing: "0.3px"
    }
  })
];
</script>

<style scoped>
#code-screen {
  width: 100%;
  height: 100%;
  position: relative;
}
/* 确保编辑器高度自适应 */
:deep(.cm-editor) { 
  height: 100%;
  overscroll-behavior: none; /* 解决滚动警告 */ 
}

/* 添加字体自定义规则 */
:deep(.cm-content), 
:deep(.cm-gutter) {
  font-family: "JetBrains Mono", "Fira Code", Consolas, "Courier New", monospace;
  font-size: 14px;
  line-height: 1.5;
  letter-spacing: 0.3px;
}
</style>