<template>
  <el-popover
    v-model:visible="visible"
    placement="top-start"
    :width="280"
    trigger="click"
    popper-class="comment-emoji-popper"
  >
    <template #reference>
      <button type="button" class="emoji-trigger" :title="triggerTitle">
        <span aria-hidden="true">{{ triggerIcon }}</span>
        <span>{{ triggerLabel }}</span>
      </button>
    </template>

    <div class="emoji-panel">
      <p class="emoji-panel__title">{{ panelTitle }}</p>
      <div class="emoji-grid">
        <button
          v-for="emoji in emojis"
          :key="emoji"
          type="button"
          class="emoji-item"
          @click="handleSelect(emoji)"
        >
          {{ emoji }}
        </button>
      </div>
    </div>
  </el-popover>
</template>

<script setup>
import { ref } from 'vue'
import { COMMENT_INSERT_EMOJIS } from '@/constants/commentEmoji'

defineProps({
  emojis: {
    type: Array,
    default: () => COMMENT_INSERT_EMOJIS,
  },
  triggerIcon: { type: String, default: '😊' },
  triggerLabel: { type: String, default: '表情' },
  triggerTitle: { type: String, default: '插入表情' },
  panelTitle: { type: String, default: '选择表情' },
})

const emit = defineEmits(['select'])

const visible = ref(false)

function handleSelect(emoji) {
  emit('select', emoji)
  visible.value = false
}
</script>

<style scoped>
.emoji-trigger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border: 1px solid var(--blog-input-border);
  border-radius: 999px;
  background: var(--app-surface);
  color: var(--app-text-secondary);
  font: inherit;
  font-size: 13px;
  cursor: pointer;
  transition: border-color 0.2s ease, color 0.2s ease;
}

.emoji-trigger:hover {
  border-color: var(--blog-link);
  color: var(--blog-link);
}

.emoji-panel__title {
  margin: 0 0 10px;
  color: var(--app-text-muted);
  font-size: 12px;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(8, minmax(0, 1fr));
  gap: 4px;
}

.emoji-item {
  width: 100%;
  aspect-ratio: 1;
  border: 0;
  border-radius: 8px;
  background: transparent;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
}

.emoji-item:hover {
  background: color-mix(in srgb, var(--blog-link) 10%, transparent);
}
</style>

<style>
.comment-emoji-popper {
  padding: 12px !important;
}
</style>
