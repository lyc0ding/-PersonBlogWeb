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

.reaction-chip{
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

.reaction-chip:hover{
  border-color: color-mix(in srgb, var(--blog-link) 35%, var(--blog-input-border));
}

.reaction-chip--active {
  border-color: color-mix(in srgb, var(--blog-link) 45%, var(--blog-input-border));
  background: color-mix(in srgb, var(--blog-link) 10%, var(--app-surface));
  color: var(--blog-link);
}

</style>
