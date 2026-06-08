<template>
  <div class="pet-layer">
    <button
      v-if="hidden"
      type="button"
      class="pet-recall"
      aria-label="唤回宠物"
      title="唤回宠物"
      @click="showPet"
    >
      <i class="iconfont icon-xiaoxi" aria-hidden="true"></i>
    </button>

    <div
      v-show="visible"
      ref="petEl"
      class="line-pet dog"
      :class="{
        'is-armed': armed,
        'is-following': following,
        'is-walking': walking,
        'is-hiding': hiding,
        'is-returning': returning,
      }"
      :style="petStyle"
      @pointerdown="onPetPointerDown"
      @click.stop
    >
      <button
        type="button"
        class="pet-hide"
        aria-label="隐藏宠物"
        title="隐藏宠物"
        @pointerdown.stop
        @click.stop="hidePet"
      >
        <i class="iconfont icon-close" aria-hidden="true"></i>
      </button>
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
import { onBeforeUnmount, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { usePetDog } from '@/composables/usePetDog'
import { usePetStore } from '@/stores/petStore'

const legLabels = ['one', 'two', 'three', 'four']
const petMoveSpeed = 0.06
const hideAnimationMs = 560
const returnAnimationMs = 520

const petEl = ref(null)
const bodyWrapperEl = ref(null)
const bodyEl = ref(null)
const headWrapperEl = ref(null)
const headEl = ref(null)
const legWrapperEls = ref([])
const legInnerEls = ref([])
const tailWrapperEl = ref(null)
const tailInnerEl = ref(null)
const petStore = usePetStore()
const {
  visible,
  hidden,
  hiding,
  returning,
} = storeToRefs(petStore)
let hideTimer = 0
let returnTimer = 0

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
  restPet,
  showTip,
} = usePetDog(petRefs, {
  moveSpeed: petMoveSpeed,
})

function hidePet() {
  if (!petStore.startHide()) return

  window.clearTimeout(hideTimer)
  window.clearTimeout(returnTimer)
  restPet('我先躲起来')

  hideTimer = window.setTimeout(() => {
    petStore.finishHide()
  }, hideAnimationMs)
}

function showPet() {
  if (!petStore.startReturn()) return

  window.clearTimeout(hideTimer)
  window.clearTimeout(returnTimer)

  returnTimer = window.setTimeout(() => {
    petStore.finishReturn()
    showTip('我回来啦', 1200)
  }, returnAnimationMs)
}

onBeforeUnmount(() => {
  window.clearTimeout(hideTimer)
  window.clearTimeout(returnTimer)
  petStore.settleTransition()
})
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

.pet-hide,
.pet-recall {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  color: var(--app-text-secondary);
  background: color-mix(in srgb, var(--app-surface) 88%, transparent);
  border: 1px solid color-mix(in srgb, var(--blog-card-border) 80%, transparent);
  border-radius: 50%;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.14);
  cursor: pointer;
  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease,
    opacity 0.2s ease;
}

.pet-hide:hover,
.pet-recall:hover {
  color: var(--blog-link);
  background: var(--app-surface);
  border-color: color-mix(in srgb, var(--blog-link) 30%, var(--blog-card-border));
  transform: translateY(-1px);
}

.pet-hide {
  position: absolute;
  top: -9px;
  right: -7px;
  z-index: 20;
  opacity: 0;
  transform: translateY(4px) scale(0.92);
}

.line-pet:hover .pet-hide,
.line-pet:focus-within .pet-hide {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.pet-hide .iconfont,
.pet-recall .iconfont {
  font-size: 13px;
  line-height: 1;
}

.pet-recall {
  position: fixed;
  left: 22px;
  bottom: 28px;
  z-index: 10000;
  pointer-events: auto;
  animation: petRecallIn 0.28s ease both, petRecallPulse 2.4s ease-in-out 0.35s infinite;
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

.line-pet.is-hiding {
  pointer-events: none;
  animation: petHideAway 0.56s cubic-bezier(0.7, 0, 0.3, 1) both;
}

.line-pet.is-returning {
  animation: petReturn 0.52s cubic-bezier(0.18, 0.85, 0.25, 1.18) both;
}

.line-pet.is-hiding .pet-shadow {
  animation: petHideShadow 0.56s ease both;
}

.line-pet.is-returning .pet-shadow {
  animation: petReturnShadow 0.52s ease both;
}

@keyframes shadowBreath {
  0%, 100% { transform: scale(1); opacity: 0.82; }
  50% { transform: scale(0.86); opacity: 0.5; }
}

@keyframes petHideAway {
  0% {
    opacity: 1;
    filter: saturate(1);
  }
  35% {
    transform: translate3d(var(--pet-current-x, 0), var(--pet-current-y, 0), 0) translateY(-8px) scale(1.02);
  }
  100% {
    opacity: 0;
    filter: saturate(0.82);
    transform: translate3d(var(--pet-current-x, 0), var(--pet-current-y, 0), 0) translate(-46px, 54px) scale(0.28) rotate(-8deg);
  }
}

@keyframes petReturn {
  0% {
    opacity: 0;
    transform: translate3d(var(--pet-current-x, 0), var(--pet-current-y, 0), 0) translate(-42px, 48px) scale(0.32) rotate(-8deg);
  }
  68% {
    opacity: 1;
    transform: translate3d(var(--pet-current-x, 0), var(--pet-current-y, 0), 0) translateY(-10px) scale(1.05);
  }
  100% {
    opacity: 1;
    transform: translate3d(var(--pet-current-x, 0), var(--pet-current-y, 0), 0);
  }
}

@keyframes petHideShadow {
  0% { transform: scale(1); opacity: 0.82; }
  100% { transform: translateY(18px) scale(0.24); opacity: 0; }
}

@keyframes petReturnShadow {
  0% { transform: translateY(18px) scale(0.24); opacity: 0; }
  100% { transform: scale(1); opacity: 0.82; }
}

@keyframes petRecallIn {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.86);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes petRecallPulse {
  0%, 100% {
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.14);
  }
  50% {
    box-shadow:
      0 8px 20px rgba(15, 23, 42, 0.14),
      0 0 0 8px color-mix(in srgb, var(--blog-link) 12%, transparent);
  }
}

@media (max-width: 640px) {
  .pet-layer :deep(.line-pet) {
    width: 92px;
    height: 92px;
  }

  .pet-hide {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
