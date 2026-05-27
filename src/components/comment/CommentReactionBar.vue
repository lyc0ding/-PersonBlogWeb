<template>
  <div class="comment-reactions">
    <button
      v-for="item in visibleReactions"
      :key="item.emoji"
      type="button"
      class="reaction-chip"
      :class="{ 'reaction-chip--active': item.emoji === state.myEmoji }"
      @click="handleToggle(item.emoji)"
    >
      <span>{{ item.emoji }}</span>
      <span>{{ item.count }}</span>
    </button>

    <el-popover
      v-model:visible="pickerVisible"
      placement="top"
      :width="220"
      trigger="click"
      popper-class="comment-emoji-popper"
    >
      <template #reference>
        <button type="button" class="reaction-add" title="添加表情反应">
          <span>+</span>
        </button>
      </template>
      <div class="emoji-panel">
        <p class="emoji-panel__title">给这条留言一个反应</p>
        <div class="emoji-grid reaction-grid">
          <button
            v-for="emoji in state.list"
            :key="emoji"
            type="button"
            class="emoji-item"
            @click="handleToggle(emoji)"
          >
            {{ emoji }}
          </button>
        </div>
      </div>
    </el-popover>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { getReactionState, toggleReaction } from '@/utils/commentReactions'

const props = defineProps({
  commentId: {
    type: [Number, String],
    required: true,
  },
})

const pickerVisible = ref(false)
const state = ref(getReactionState(props.commentId))

const visibleReactions = computed(() => state.value.list)

watch(
  () => props.commentId,
  (id) => {
    state.value = getReactionState(id)
  }
)

function handleToggle(emoji) {
  state.value = toggleReaction(props.commentId, emoji)
  pickerVisible.value = false
}
</script>

<style scoped>
.comment-reactions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
}

.reaction-chip,
.reaction-add {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-height: 30px;
  padding: 0 10px;
  border: 1px solid var(--blog-input-border);
  border-radius: 999px;
  background: var(--app-surface);
  color: var(--app-text-secondary);
  font: inherit;
  font-size: 13px;
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease;
}

.reaction-chip:hover,
.reaction-add:hover {
  border-color: color-mix(in srgb, var(--blog-link) 35%, var(--blog-input-border));
}

.reaction-chip--active {
  border-color: color-mix(in srgb, var(--blog-link) 45%, var(--blog-input-border));
  background: color-mix(in srgb, var(--blog-link) 10%, var(--app-surface));
  color: var(--blog-link);
}

.reaction-add {
  width: 30px;
  justify-content: center;
  padding: 0;
  color: var(--app-text-muted);
}

.emoji-panel__title {
  margin: 0 0 10px;
  color: var(--app-text-muted);
  font-size: 12px;
}

.reaction-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6px;
}

.emoji-item {
  width: 100%;
  aspect-ratio: 1;
  border: 0;
  border-radius: 8px;
  background: transparent;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
}

.emoji-item:hover {
  background: color-mix(in srgb, var(--blog-link) 10%, transparent);
}
</style>
