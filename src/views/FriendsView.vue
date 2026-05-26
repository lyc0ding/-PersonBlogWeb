<template>
  <div class="blog-page">
    <ImagePreviewer
      :show-preview="showImagePreview"
      :current-image="currentPreviewImage"
      @close="closeImagePreview"
    />
    <section ref="sceneEl" class="photo-cylinder" aria-label="照片墙"></section>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import * as THREE from 'three'
import ImagePreviewer from '@/components/image/ImagePreviewer.vue'
import avatarUrl from '@/assets/img/avatar.png'
import bac1Url from '@/assets/img/bac1.jpg'
import imageUrl from '@/assets/img/image.png'
import neymarUrl from '@/assets/img/neymar.png'
import vscodeUrl from '@/assets/img/vscode.png'
import whiteUrl from '@/assets/img/white.png'

const sceneEl = ref(null)
const showImagePreview = ref(false)
const currentPreviewImage = ref('')

const localPhotos = [
  bac1Url,
  vscodeUrl,
  avatarUrl,
  imageUrl,
  neymarUrl,
  whiteUrl,
  '/img/bac2.jpg',
  '/img/neymar.jpg',
]
const remotePhotos = [
  'https://picsum.photos/id/10/800/800',
  'https://picsum.photos/id/11/800/800',
  'https://picsum.photos/id/12/800/800',
  'https://picsum.photos/id/13/800/800',
  'https://picsum.photos/id/14/800/800',
  'https://picsum.photos/id/15/800/800',
  'https://picsum.photos/id/16/800/800',
  'https://picsum.photos/id/17/800/800',
  'https://picsum.photos/id/18/800/800',
  'https://picsum.photos/id/19/800/800',
]
const photos = [...localPhotos, ...remotePhotos].map(src => ({ src }))

// 内壁圆柱参数
let renderer, scene, camera, container
let raycaster, pointer
let clock
let animationFrame = 0
let disposed = false
let resizeObserver
let photoCards = []
let hoveredCard = null

// 配置
const CYLINDER_RADIUS = 4.0
const ROTATE_SPEED = 0.12
const PHOTO_SIZE = 1.2
// hover配置
const HOVER_SCALE = 1.25
const HOVER_LIFT = 0.15

onMounted(() => {
  init()
})

onBeforeUnmount(() => {
  disposed = true
  cancelAnimationFrame(animationFrame)
  resizeObserver?.disconnect()
  clearResources()
  renderer?.domElement?.remove()
})

function init() {
  if (!sceneEl.value) return
  const { clientWidth, clientHeight } = sceneEl.value

  scene = new THREE.Scene()

  // 相机圆心 内壁正视
  camera = new THREE.PerspectiveCamera(60, clientWidth / clientHeight, 0.1, 100)
  camera.position.set(0, 0, 0)

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(clientWidth, clientHeight)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  sceneEl.value.appendChild(renderer.domElement)

  const light = new THREE.AmbientLight(0xffffff, 1.5)
  scene.add(light)

  raycaster = new THREE.Raycaster()
  pointer = new THREE.Vector2()
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('click', onClick)

  container = new THREE.Group()
  scene.add(container)

  loadPhotos()

  resizeObserver = new ResizeObserver(onResize)
  resizeObserver.observe(sceneEl.value)

  clock = new THREE.Clock()
  animate()
}

function loadPhotos() {
  const loader = new THREE.TextureLoader()
  loader.setCrossOrigin('anonymous')

  photos.forEach((item, i) => {
    loader.load(
      item.src,
      texture => {
        if (disposed) { texture.dispose(); return }
        texture.colorSpace = THREE.SRGBColorSpace
        createPhoto(texture, item.src, i)
      },
      undefined,
      () => createPhoto(getFallbackTexture(i), item.src, i)
    )
  })
}

// 创建内壁照片 + 存用户数据
function createPhoto(texture, src, index) {
  const total = photos.length
  const angle = (index / total) * Math.PI * 2

  const geometry = new THREE.PlaneGeometry(PHOTO_SIZE, PHOTO_SIZE)
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide,
    transparent: true,
  })
  const mesh = new THREE.Mesh(geometry, material)

  mesh.position.set(
    Math.sin(angle) * CYLINDER_RADIUS,
    0,
    Math.cos(angle) * CYLINDER_RADIUS
  )
  mesh.lookAt(0, 0, 0)

  // 存入卡片信息
  const card = {
    mesh, material, texture, geometry, src,
    baseY: 0,
    scale: 1,
    targetScale: 1,
    targetY: 0
  }
  mesh.userData.card = card

  container.add(mesh)
  photoCards.push(card)
}

function animate() {
  if (disposed) return
  animationFrame = requestAnimationFrame(animate)
  const delta = clock.getDelta()

  // 关键：有hover就停止旋转，无hover正常转
  if (!hoveredCard) {
    container.rotation.y -= delta * ROTATE_SPEED
  }

  // 每张保持正视镜头
  photoCards.forEach(card => {
    card.mesh.lookAt(0, 0, 0)
  })

  // 更新hover缩放+上浮动画
  updateHoverEffect(delta)
  // 射线检测hover
  updateRaycast()

  renderer.render(scene, camera)
}

// hover 缩放 + 平滑上浮
function updateHoverEffect(delta) {
  photoCards.forEach(card => {
    const isHover = card === hoveredCard
    card.targetScale = isHover ? HOVER_SCALE : 1
    card.targetY = isHover ? HOVER_LIFT : 0

    // 平滑插值
    card.scale += (card.targetScale - card.scale) * 0.15
    card.mesh.scale.setScalar(card.scale)

    card.mesh.position.y += (card.targetY - card.mesh.position.y) * 0.15
  })
}

// 射线拾取
function updateRaycast() {
  raycaster.setFromCamera(pointer, camera)
  const meshes = photoCards.map(c => c.mesh)
  const intersects = raycaster.intersectObjects(meshes)

  const nextHover = intersects[0]?.object.userData.card || null
  hoveredCard = nextHover

  document.body.style.cursor = hoveredCard ? 'zoom-in' : 'default'
}

function onPointerMove(e) {
  const rect = renderer.domElement.getBoundingClientRect()
  pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
  pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
}

function onClick() {
  if (!hoveredCard) return
  currentPreviewImage.value = hoveredCard.src
  showImagePreview.value = true
}

function closeImagePreview() {
  showImagePreview.value = false
  currentPreviewImage.value = ''
}

function onResize() {
  if (!sceneEl.value) return
  const w = sceneEl.value.clientWidth
  const h = sceneEl.value.clientHeight
  renderer.setSize(w, h)
  camera.aspect = w / h
  camera.updateProjectionMatrix()
}

function getFallbackTexture(index) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = index % 2 ? '#e6f0ff' : '#f0f5ff'
  ctx.fillRect(0, 0, 512, 512)
  return new THREE.CanvasTexture(canvas)
}

function clearResources() {
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('click', onClick)
  photoCards.forEach(c => {
    c.mesh.clear()
    c.geometry.dispose()
    c.material.dispose()
    c.texture.dispose()
  })
  photoCards = []
  renderer?.dispose()
}
</script>

<style scoped>
.blog-page {
  width: var(--blog-content-width);
  margin: 0 auto;
  padding: 24px 16px 60px;
}

.photo-cylinder {
  position: relative;
  width: 100%;
  height: clamp(560px, calc(100vh - 200px), 820px);
  min-height: 560px;
  overflow: hidden;
  border-radius: 20px;
}

.photo-cylinder :deep(canvas) {
  display: block;
  width: 100%;
  height: 100%;
}

@media (max-width: 768px) {
  .blog-page {
    padding: 20px 0 40px;
  }
  .photo-cylinder {
    height: 62vh;
    min-height: 480px;
    border-radius: 12px;
  }
}
</style>