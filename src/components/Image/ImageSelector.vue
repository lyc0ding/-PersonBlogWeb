<template>
  <ImageUploader
    :model-value="modelValue"
    biz-type="photo"
    hint="封面图 JPG/PNG/GIF，最大 5MB"
    @update:model-value="emit('update:modelValue', $event)"
  />
</template>

<script setup>
import ImageUploader from './ImageUploader.vue'

defineProps({
  modelValue: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])
</script>
