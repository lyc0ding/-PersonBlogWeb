<template>
  <div class="block-editor">
    <div class="block-toolbar">
      <span class="toolbar-label">插入内容块</span>
      <el-button size="small" @click="insertBlock('heading')">标题</el-button>
      <el-button size="small" @click="insertBlock('paragraph')">段落</el-button>
      <el-button size="small" @click="insertBlock('image')">图片</el-button>
      <el-button size="small" type="primary" plain @click="insertBlock('code')">代码</el-button>
      <el-button size="small" @click="insertBlock('quote')">引用</el-button>
    </div>

    <el-empty v-if="!blocks.length" description="暂无内容，请插入内容块" />

    <div
      v-for="(block, index) in blocks"
      :key="block.id"
      class="block-item"
      :class="{ 'is-focused': focusedIndex === index }"
      @click="focusedIndex = index"
    >
      <div class="block-type-tag">{{ blockTypeLabel(block.type) }}</div>

      <div v-if="block.type === 'heading'" class="block-body">
        <el-select v-model="block.level" size="small" style="width: 100px; margin-bottom: 8px">
          <el-option label="H2" :value="2" />
          <el-option label="H3" :value="3" />
          <el-option label="H4" :value="4" />
        </el-select>
        <el-input
          v-model="block.content"
          placeholder="输入标题文字"
          size="large"
        />
      </div>

      <div v-else-if="block.type === 'paragraph'" class="block-body">
        <el-input
          v-model="block.content"
          type="textarea"
          :rows="5"
          placeholder="输入段落内容，支持换行"
          resize="vertical"
        />
      </div>

      <div v-else-if="block.type === 'quote'" class="block-body">
        <el-input
          v-model="block.content"
          type="textarea"
          :rows="3"
          placeholder="引用内容"
        />
      </div>

      <div v-else-if="block.type === 'image'" class="block-body">
        <ImageUploader
          v-model="block.url"
          biz-type="content"
          :max-size-m-b="5"
          hint="正文图片，建议宽度 ≥ 800px"
        />
        <div class="image-meta">
          <el-input v-model="block.alt" placeholder="图片描述（alt）" />
          <el-input v-model="block.caption" placeholder="图片说明（可选）" />
        </div>
      </div>

      <div v-else-if="block.type === 'code'" class="block-body">
        <CodeBlockEditor
          v-model="block.content"
          v-model:language="block.language"
          v-model:filename="block.filename"
        />
      </div>

      <div class="block-actions">
        <el-button size="small" :disabled="index === 0" @click="moveBlock(index, -1)">上移</el-button>
        <el-button size="small" :disabled="index === blocks.length - 1" @click="moveBlock(index, 1)">下移</el-button>
        <el-button size="small" type="danger" plain @click="removeBlock(index)">删除</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessageBox } from 'element-plus'
import { createBlock } from '@/constants/article'
import CodeBlockEditor from './CodeBlockEditor.vue'
import ImageUploader from '@/components/Image/ImageUploader.vue'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:modelValue'])

const focusedIndex = ref(-1)

const blocks = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

function blockTypeLabel(type) {
  const map = {
    heading: '标题',
    paragraph: '段落',
    image: '图片',
    code: '代码',
    quote: '引用',
  }
  return map[type] || type
}

function insertBlock(type) {
  const next = [...blocks.value, createBlock(type)]
  blocks.value = next
  focusedIndex.value = next.length - 1
}

function moveBlock(index, delta) {
  const target = index + delta
  if (target < 0 || target >= blocks.value.length) return
  const list = [...blocks.value]
  ;[list[index], list[target]] = [list[target], list[index]]
  blocks.value = list
  focusedIndex.value = target
}

async function removeBlock(index) {
  try {
    await ElMessageBox.confirm('确定删除该内容块？', '提示', { type: 'warning' })
    const list = [...blocks.value]
    list.splice(index, 1)
    blocks.value = list.length ? list : [createBlock('paragraph')]
    focusedIndex.value = -1
  } catch {
    /* cancelled */
  }
}
</script>

<style scoped>
.block-editor {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.block-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: var(--app-surface-muted);
  border: 1px solid var(--app-border);
  border-radius: 6px;
}

.toolbar-label {
  font-size: 13px;
  color: var(--app-text-muted);
  margin-right: 4px;
}

.block-item {
  position: relative;
  padding: 14px;
  border: 1px solid var(--app-border);
  border-radius: 8px;
  background: var(--app-surface);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.block-item.is-focused {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--el-color-primary) 25%, transparent);
}

.block-type-tag {
  position: absolute;
  top: 10px;
  right: 12px;
  font-size: 12px;
  color: var(--app-text-muted);
  background: var(--app-surface-muted);
  padding: 2px 8px;
  border-radius: 4px;
}

.block-body {
  padding-right: 56px;
}

.image-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 10px;
}

.block-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed var(--app-divider-subtle);
}
</style>
