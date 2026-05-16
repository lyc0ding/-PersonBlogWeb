<template>
  <div class="code-block-editor">
    <div class="code-toolbar">
      <el-select
        :model-value="language"
        size="small"
        placeholder="语言"
        style="width: 140px"
        @update:model-value="onLanguageChange"
      >
        <el-option
          v-for="item in CODE_LANGUAGES"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <el-input
        :model-value="filename"
        size="small"
        placeholder="文件名（可选，如 Main.java）"
        style="flex: 1; min-width: 160px"
        @update:model-value="onFilenameChange"
      />
      <el-button size="small" @click="copyCode">
        <el-icon><DocumentCopy /></el-icon>
        复制
      </el-button>
    </div>
    <div class="code-mirror-wrap">
      <CodeMirror
        :model-value="modelValue"
        :extensions="extensions"
        @update:model-value="onCodeChange"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import CodeMirror from 'vue-codemirror6'
import { java } from '@codemirror/lang-java'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorView } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { DocumentCopy } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { CODE_LANGUAGES } from '@/constants/article'

const props = defineProps({
  modelValue: { type: String, default: '' },
  language: { type: String, default: 'java' },
  filename: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue', 'update:language', 'update:filename'])

const extensions = computed(() => {
  const langExt = props.language === 'java' ? java() : []
  return [
    langExt,
    oneDark,
    EditorView.lineNumbers,
    EditorState.tabSize.of(2),
    EditorView.theme({
      '&': { height: '100%' },
      '.cm-scroller': { overflow: 'auto', fontFamily: '"JetBrains Mono", Consolas, monospace' },
      '.cm-content, .cm-gutter': { fontSize: '13px', lineHeight: '1.55' },
    }),
  ]
})

function onCodeChange(val) {
  emit('update:modelValue', val)
}

function onLanguageChange(val) {
  emit('update:language', val)
}

function onFilenameChange(val) {
  emit('update:filename', val)
}

async function copyCode() {
  try {
    await navigator.clipboard.writeText(props.modelValue || '')
    ElMessage.success('代码已复制')
  } catch {
    ElMessage.error('复制失败')
  }
}
</script>

<style scoped>
.code-block-editor {
  border: 1px solid var(--app-border);
  border-radius: 6px;
  overflow: hidden;
  background: #282c34;
}

.code-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: var(--app-code-header-bg);
  border-bottom: 1px solid var(--app-code-header-border);
}

.code-mirror-wrap {
  height: 280px;
}

:deep(.cm-editor) {
  height: 100%;
}

:deep(.cm-focused) {
  outline: none;
}
</style>
