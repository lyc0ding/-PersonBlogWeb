<template>
  <div class="pet-layer">
    <span
      v-for="step in footprints"
      :key="step.id"
      class="paw-print"
      :class="{ 'is-right': step.right }"
      :style="{
        left: `${step.x}px`,
        top: `${step.y}px`,
        transform: `rotate(${step.rotate}deg)`,
      }"
    >
      <i></i>
      <i></i>
      <i></i>
      <i></i>
    </span>

    <div
      ref="petRef"
      class="line-pet"
      :class="{
        'is-armed': armed,
        'is-following': following,
        'is-walking': walking,
        'is-dragging': dragging,
      }"
      :style="petStyle"
      @pointerdown.stop="startDrag"
      @click.stop="togglePet"
    >
      <div class="pet-shadow"></div>
      <div class="pet-tip" :class="{ show: tipVisible }">{{ tipText }}</div>

      <div class="pet-stage">
        <div class="pet-model" :style="modelStyle">
          <svg class="dog-sketch" viewBox="0 0 104 104" aria-hidden="true">
            <path class="tail-line" d="M52 83 C50 96 68 98 68 85 C68 79 62 77 59 82" />

            <path class="paw paw-front-left" d="M31 43 C25 47 24 56 30 60 C36 64 42 58 40 50 C39 44 35 41 31 43Z" />
            <path class="paw paw-front-right" d="M73 43 C79 47 80 56 74 60 C68 64 62 58 64 50 C65 44 69 41 73 43Z" />
            <path class="paw paw-back-left" d="M30 70 C23 75 24 86 32 88 C39 89 43 82 39 75 C37 70 34 68 30 70Z" />
            <path class="paw paw-back-right" d="M74 70 C81 75 80 86 72 88 C65 89 61 82 65 75 C67 70 70 68 74 70Z" />

            <ellipse class="body-fill" cx="52" cy="59" rx="23" ry="31" />
            <path class="body-line" d="M52 35 C44 42 42 75 52 88 C62 75 60 42 52 35Z" />
            <path class="body-patch body-patch-left" d="M39 50 C35 57 36 69 43 72" />
            <path class="body-patch body-patch-right" d="M65 50 C69 57 68 69 61 72" />

            <path class="ear ear-left" d="M38 20 C30 10 19 12 20 25 C21 38 33 36 39 28Z" />
            <path class="ear ear-right" d="M66 20 C74 10 85 12 84 25 C83 38 71 36 65 28Z" />

            <ellipse class="head-fill" cx="52" cy="28" rx="20" ry="18" />
            <path class="muzzle" d="M43 31 C47 39 57 39 61 31" />
            <circle class="eye eye-left" cx="44" cy="25" r="2.5" />
            <circle class="eye eye-right" cx="60" cy="25" r="2.5" />
            <path class="nose" d="M49 30 C51 28 53 28 55 30 C54 33 50 33 49 30Z" />
            <path class="mouth" d="M52 33 C50 36 47 36 45 34 M52 33 C54 36 57 36 59 34" />
            <path class="collar" d="M35 40 C44 46 60 46 69 40" />
            <circle class="tag" cx="52" cy="43" r="2.4" />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const petRef = ref(null)
const posX = ref(0)
const posY = ref(0)
const targetX = ref(0)
const targetY = ref(0)
const mouseX = ref(0)
const mouseY = ref(0)
const directionAngle = ref(0)
const walking = ref(false)
const dragging = ref(false)
const armed = ref(false)
const following = ref(false)
const tipVisible = ref(false)
const tipText = ref('汪')
const footprints = ref([])

const size = 104
const margin = 24
const speed = 0.105
const footprintGap = 26
const petTips = ['汪', '再点页面我就跟着你', '摸摸头', '我在看你']

let rafId = 0
let tipTimer = 0
let idleTimer = 0
let footprintId = 0
let lastFootprintX = 0
let lastFootprintY = 0
let dragPointerId = null
let dragOffsetX = 0
let dragOffsetY = 0
let dragStartX = 0
let dragStartY = 0
let dragDistance = 0
const footprintTimers = new Set()

const petStyle = computed(() => ({
  transform: `translate3d(${posX.value}px, ${posY.value}px, 0)`,
}))

const modelStyle = computed(() => ({
  transform: `rotate(${directionAngle.value}deg)`,
}))

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

const getBounds = () => ({
  maxX: Math.max(margin, window.innerWidth - (petRef.value?.offsetWidth ?? size) - margin),
  maxY: Math.max(margin, window.innerHeight - (petRef.value?.offsetHeight ?? size) - margin),
})

const getPetSize = () => ({
  width: petRef.value?.offsetWidth ?? size,
  height: petRef.value?.offsetHeight ?? size,
})

const angleTo = (fromX, fromY, toX, toY) => {
  const angle = Math.atan2(toY - fromY, toX - fromX) * 180 / Math.PI + 90
  return Number.isFinite(angle) ? angle : directionAngle.value
}

const showTip = (text, duration = 1400) => {
  tipText.value = text
  tipVisible.value = true
  window.clearTimeout(tipTimer)
  tipTimer = window.setTimeout(() => {
    tipVisible.value = false
  }, duration)
}

const updateLook = (clientX, clientY) => {
  const rect = petRef.value?.getBoundingClientRect()
  if (!rect) return

  mouseX.value = clientX
  mouseY.value = clientY
  directionAngle.value = angleTo(rect.left + rect.width / 2, rect.top + rect.height / 2, clientX, clientY)
}

const setTargetToMouse = () => {
  const { maxX, maxY } = getBounds()
  const { width, height } = getPetSize()
  targetX.value = clamp(mouseX.value - width / 2, margin, maxX)
  targetY.value = clamp(mouseY.value - height / 2, margin, maxY)
}

const addFootprint = () => {
  const { width, height } = getPetSize()
  const centerX = posX.value + width / 2
  const centerY = posY.value + height / 2

  if (Math.hypot(centerX - lastFootprintX, centerY - lastFootprintY) < footprintGap) return

  const angle = directionAngle.value * Math.PI / 180
  const rightX = Math.cos(angle)
  const rightY = Math.sin(angle)
  const forwardX = Math.sin(angle)
  const forwardY = -Math.cos(angle)
  const isRight = footprintId % 2 === 0
  const side = isRight ? 1 : -1
  const id = footprintId + 1

  footprintId = id
  lastFootprintX = centerX
  lastFootprintY = centerY
  footprints.value = [
    ...footprints.value.slice(-9),
    {
      id,
      right: isRight,
      x: centerX - forwardX * 18 + rightX * side * 11 - 5,
      y: centerY - forwardY * 18 + rightY * side * 11 - 5,
      rotate: directionAngle.value + side * 7,
    },
  ]

  const timer = window.setTimeout(() => {
    footprints.value = footprints.value.filter((step) => step.id !== id)
    footprintTimers.delete(timer)
  }, 1600)
  footprintTimers.add(timer)
}

const startDrag = (event) => {
  event.preventDefault()
  dragging.value = true
  dragPointerId = event.pointerId
  dragStartX = event.clientX
  dragStartY = event.clientY
  dragDistance = 0

  const rect = petRef.value.getBoundingClientRect()
  dragOffsetX = event.clientX - rect.left
  dragOffsetY = event.clientY - rect.top
  petRef.value.setPointerCapture?.(event.pointerId)
}

const onPointerMove = (event) => {
  updateLook(event.clientX, event.clientY)

  if (dragging.value && event.pointerId === dragPointerId) {
    const { maxX, maxY } = getBounds()
    posX.value = clamp(event.clientX - dragOffsetX, margin, maxX)
    posY.value = clamp(event.clientY - dragOffsetY, margin, maxY)
    targetX.value = posX.value
    targetY.value = posY.value
    dragDistance = Math.hypot(event.clientX - dragStartX, event.clientY - dragStartY)
    return
  }

  if (following.value) {
    setTargetToMouse()
  }
}

const onPointerUp = (event) => {
  if (!dragging.value || event.pointerId !== dragPointerId) return
  dragging.value = false
  dragPointerId = null
}

const togglePet = () => {
  if (dragDistance > 8) return

  if (following.value) {
    following.value = false
    armed.value = false
    showTip('汪，我先歇会', 1300)
    return
  }

  armed.value = true
  showTip(petTips[Math.floor(Math.random() * petTips.length)], 1500)
}

const onPageClick = (event) => {
  if (dragging.value || following.value || !armed.value) return
  mouseX.value = event.clientX
  mouseY.value = event.clientY
  following.value = true
  armed.value = false
  setTargetToMouse()
  showTip('开始跟随', 1200)
}

const tick = () => {
  const dx = targetX.value - posX.value
  const dy = targetY.value - posY.value
  const distance = Math.hypot(dx, dy)

  walking.value = distance > 1.2
  if (walking.value) {
    const { width, height } = getPetSize()
    directionAngle.value = angleTo(
      posX.value + width / 2,
      posY.value + height / 2,
      targetX.value + width / 2,
      targetY.value + height / 2,
    )
    addFootprint()
  }

  if (!dragging.value && distance > 0.7) {
    posX.value += dx * speed
    posY.value += dy * speed
  } else if (!dragging.value) {
    posX.value = targetX.value
    posY.value = targetY.value
  }

  rafId = window.requestAnimationFrame(tick)
}

const handleResize = () => {
  const { maxX, maxY } = getBounds()
  posX.value = clamp(posX.value, margin, maxX)
  posY.value = clamp(posY.value, margin, maxY)
  targetX.value = clamp(targetX.value, margin, maxX)
  targetY.value = clamp(targetY.value, margin, maxY)
}

onMounted(() => {
  const { maxY } = getBounds()
  posX.value = margin
  posY.value = maxY
  targetX.value = posX.value
  targetY.value = posY.value
  mouseX.value = window.innerWidth / 2
  mouseY.value = window.innerHeight / 2

  const { width, height } = getPetSize()
  lastFootprintX = posX.value + width / 2
  lastFootprintY = posY.value + height / 2

  window.addEventListener('pointermove', onPointerMove, { passive: true })
  window.addEventListener('pointerup', onPointerUp, { passive: true })
  window.addEventListener('pointercancel', onPointerUp, { passive: true })
  window.addEventListener('click', onPageClick, { passive: true })
  window.addEventListener('resize', handleResize, { passive: true })

  showTip('汪，点我互动', 1600)
  rafId = window.requestAnimationFrame(tick)
  idleTimer = window.setInterval(() => {
    if (!dragging.value && !following.value && !armed.value && Math.random() > 0.55) {
      showTip('汪~', 1100)
    }
  }, 7200)
})

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
  window.removeEventListener('pointercancel', onPointerUp)
  window.removeEventListener('click', onPageClick)
  window.removeEventListener('resize', handleResize)
  if (rafId) window.cancelAnimationFrame(rafId)
  if (tipTimer) window.clearTimeout(tipTimer)
  if (idleTimer) window.clearInterval(idleTimer)
  footprintTimers.forEach((timer) => window.clearTimeout(timer))
  footprintTimers.clear()
})
</script>

<style scoped>
.pet-layer {
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
}

.line-pet {
  position: absolute;
  left: 0;
  top: 0;
  width: 104px;
  height: 104px;
  cursor: pointer;
  pointer-events: auto;
  touch-action: none;
  user-select: none;
  will-change: transform;
}

.line-pet.is-dragging {
  cursor: grabbing;
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
}

.pet-tip.show {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.pet-stage {
  position: absolute;
  inset: 0;
  overflow: visible;
}

.pet-model {
  position: absolute;
  inset: 0;
  transform-origin: 50% 55%;
  transition: transform 0.12s linear;
  will-change: transform;
}

.dog-sketch {
  width: 100%;
  height: 100%;
  overflow: visible;
  filter: drop-shadow(0 6px 7px rgba(15, 23, 42, 0.12));
  transform-origin: center;
}

.dog-sketch :is(path, ellipse, circle) {
  vector-effect: non-scaling-stroke;
}

.tail-line,
.body-line,
.body-patch,
.muzzle,
.mouth,
.collar {
  fill: none;
  stroke: #171717;
  stroke-width: 3.1;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.tail-line {
  stroke-width: 4;
}

.body-fill,
.head-fill,
.paw,
.ear {
  fill: #fffdf8;
  stroke: #171717;
  stroke-width: 3.1;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.ear {
  fill: #fff4e5;
}

.body-line,
.body-patch {
  stroke-width: 2.1;
  opacity: 0.58;
}

.eye {
  fill: #171717;
}

.nose {
  fill: #171717;
  stroke: #171717;
  stroke-width: 1.3;
  stroke-linejoin: round;
}

.collar {
  stroke: #f97316;
  stroke-width: 2.6;
}

.tag {
  fill: #facc15;
  stroke: #171717;
  stroke-width: 1.6;
}

.line-pet.is-walking .dog-sketch {
  animation: sketchWalk 0.42s ease-in-out infinite;
}

.line-pet.is-walking .paw-front-left,
.line-pet.is-walking .paw-back-right {
  animation: pawStepA 0.42s ease-in-out infinite;
}

.line-pet.is-walking .paw-front-right,
.line-pet.is-walking .paw-back-left {
  animation: pawStepB 0.42s ease-in-out infinite;
}

.line-pet.is-armed .dog-sketch {
  filter: drop-shadow(0 0 9px rgba(249, 115, 22, 0.34)) drop-shadow(0 6px 7px rgba(15, 23, 42, 0.12));
}

.line-pet.is-following .tail-line {
  animation: tailWag 0.36s ease-in-out infinite;
}

.paw-print {
  position: fixed;
  width: 12px;
  height: 12px;
  opacity: 0;
  pointer-events: none;
  animation: footprintFade 1.6s ease-out forwards;
}

.paw-print i {
  position: absolute;
  display: block;
  border-radius: 50%;
  background: rgba(23, 23, 23, 0.22);
}

.paw-print i:nth-child(1) {
  left: 4px;
  top: 5px;
  width: 6px;
  height: 5px;
}

.paw-print i:nth-child(2),
.paw-print i:nth-child(3),
.paw-print i:nth-child(4) {
  width: 3px;
  height: 3px;
}

.paw-print i:nth-child(2) {
  left: 1px;
  top: 1px;
}

.paw-print i:nth-child(3) {
  left: 5px;
  top: 0;
}

.paw-print i:nth-child(4) {
  right: 1px;
  top: 2px;
}

.paw-print.is-right {
  scale: -1 1;
}

@keyframes sketchWalk {
  0%, 100% { translate: 0 0; }
  50% { translate: 0 -2px; }
}

@keyframes pawStepA {
  0%, 100% { translate: 0 0; }
  50% { translate: 0 3px; }
}

@keyframes pawStepB {
  0%, 100% { translate: 0 3px; }
  50% { translate: 0 0; }
}

@keyframes tailWag {
  0%, 100% { rotate: -3deg; }
  50% { rotate: 5deg; }
}

@keyframes shadowBreath {
  0%, 100% { transform: scale(1); opacity: 0.82; }
  50% { transform: scale(0.86); opacity: 0.5; }
}

@keyframes footprintFade {
  0% { opacity: 0; scale: 0.88; }
  16% { opacity: 1; scale: 1; }
  100% { opacity: 0; scale: 1; }
}

@media (max-width: 640px) {
  .line-pet {
    width: 92px;
    height: 92px;
  }
}
</style>
