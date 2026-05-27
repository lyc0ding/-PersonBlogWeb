<template>
  <div class="pet-layer">
    <div
      ref="petEl"
      class="line-pet dog"
      :class="{
        'is-armed': armed,
        'is-following': following,
        'is-walking': walking,
      }"
      :style="petStyle"
      @pointerdown="onPetPointerDown"
      @click.stop
    >
      <div class="pet-shadow" />
      <div class="pet-tip" :class="{ show: tipVisible }">{{ tipText }}</div>

      <div ref="bodyWrapperEl" class="body-wrapper">
        <div ref="bodyEl" class="body img-bg" />
      </div>

      <div ref="headWrapperEl" class="head-wrapper">
        <div ref="headEl" class="head img-bg" />
      </div>

      <div
        v-for="leg in legLabels"
        :key="leg"
        ref="legWrapperEls"
        class="leg-wrapper"
      >
        <div ref="legInnerEls" class="leg img-bg" :class="leg" />
      </div>

      <div ref="tailWrapperEl" class="tail-wrapper">
        <div ref="tailInnerEl" class="tail img-bg" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { usePetDog } from '@/composables/usePetDog'

const legLabels = ['one', 'two', 'three', 'four']

const petEl = ref(null)
const bodyWrapperEl = ref(null)
const bodyEl = ref(null)
const headWrapperEl = ref(null)
const headEl = ref(null)
const legWrapperEls = ref([])
const legInnerEls = ref([])
const tailWrapperEl = ref(null)
const tailInnerEl = ref(null)

const petRefs = {
  get petEl() { return petEl.value },
  get bodyWrapperEl() { return bodyWrapperEl.value },
  get bodyEl() { return bodyEl.value },
  get headWrapperEl() { return headWrapperEl.value },
  get headEl() { return headEl.value },
  get legEls() { return legWrapperEls.value },
  get legInnerEls() { return legInnerEls.value },
  get tailWrapperEl() { return tailWrapperEl.value },
  get tailInnerEl() { return tailInnerEl.value },
}

const {
  petStyle,
  walking,
  armed,
  following,
  tipVisible,
  tipText,
  onPetPointerDown,
} = usePetDog(petRefs)
</script>

<style scoped lang="scss">
.pet-layer {
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
}

.pet-layer :deep(.line-pet) {
  pointer-events: auto;
  cursor: pointer;
  touch-action: none;
  user-select: none;
  will-change: transform;
}

.pet-shadow {
  position: absolute;
  left: 26px;
  right: 26px;
  bottom: 10px;
  height: 11px;
  border-radius: 50%;
  background: rgba(31, 41, 55, 0.16);
  filter: blur(2px);
  animation: shadowBreath 2.4s ease-in-out infinite;
  pointer-events: none;
}

.pet-tip {
  position: absolute;
  left: 2px;
  top: -34px;
  max-width: min(220px, calc(100vw - 32px));
  transform: translateY(6px) scale(0.96);
  padding: 7px 12px;
  border: 1px solid rgba(17, 24, 39, 0.1);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.13);
  color: #111827;
  font-size: 12px;
  line-height: 1;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.18s ease, transform 0.18s ease;
  z-index: 10;
}

.pet-tip.show {
  opacity: 1;
  transform: translateY(0) scale(1);
}

@keyframes shadowBreath {
  0%, 100% { transform: scale(1); opacity: 0.82; }
  50% { transform: scale(0.86); opacity: 0.5; }
}

@media (max-width: 640px) {
  .pet-layer :deep(.line-pet) {
    width: 92px;
    height: 92px;
  }
}
</style>
