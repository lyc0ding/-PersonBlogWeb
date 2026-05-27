<template>
  <div
    class="comment-avatar"
    :class="[`comment-avatar--${size}`, { 'comment-avatar--image': hasImage }]"
    :title="name"
  >
    <img v-if="hasImage" :src="src" :alt="`${name} 的头像`" @error="onImageError">
    <span v-else>{{ fallbackText }}</span>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  src: { type: String, default: '' },
  name: { type: String, default: '' },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['md', 'sm'].includes(value),
  },
})

const imageBroken = ref(false)

const hasImage = computed(() => Boolean(props.src?.trim()) && !imageBroken.value)

const fallbackText = computed(() => {
  const text = String(props.name || '').trim()
  return (text.slice(0, 1) || '访').toUpperCase()
})

watch(
  () => props.src,
  () => {
    imageBroken.value = false
  }
)

function onImageError() {
  imageBroken.value = true
}
</script>

<style scoped>
.comment-avatar {
  flex-shrink: 0;
  display: grid;
  place-items: center;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--blog-link) 24%, var(--blog-divider));
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--blog-link) 16%, var(--app-surface)),
    var(--app-surface)
  );
  color: var(--blog-link);
  font-weight: 700;
  user-select: none;
}

.comment-avatar--md {
  width: 48px;
  height: 48px;
  font-size: 18px;
}

.comment-avatar--sm {
  width: 34px;
  height: 34px;
  font-size: 14px;
}

.comment-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.comment-avatar--image {
  background: var(--app-surface-muted);
}
</style>
