<template>
  <div class="blog-page">
    <ImagePreviewer
      :show-preview="showImagePreview"
      :current-image="currentPreviewImage"
      @close="closeImagePreview"
    />
    <section ref="sceneEl" class="photo-cylinder" aria-label="照片墙" data-photo-cylinder></section>
  </div>
</template>

<script setup>
import { onActivated, onBeforeUnmount, onDeactivated, onMounted, ref } from 'vue'
import * as THREE from 'three'
import ImagePreviewer from '@/components/image/ImagePreviewer.vue'
import { photoPageService } from '@/api/photo'

defineOptions({
  name: 'PhotosPage',
})

const sceneEl = ref(null)
const showImagePreview = ref(false)
const currentPreviewImage = ref('')

let photos = []

const gentleCurveFactor = 2.8 // 圆柱弧度，略平一些便于铺满视野
const worldHeight = 12 // 增大高度，给随机偏移留空间
const cylinderRotationSpeed = 0.11
const wallFillFactor = 1.6 // 略微降低，避免图片过挤
const photoScaleRange = { min: 0.6, max: 1.5 }  // 调整大小范围，让随机效果更自然
const compactRowGapFactor = 0.6 // 降低行紧凑度，让上下更松散
const baseFrameColor = new THREE.Color(0xf8fafc)
const hoverFrameColor = new THREE.Color(0x9fd7ff)
const hoverOffset = new THREE.Vector3()

// 新增：随机偏移参数
const randomOffsetConfig = {
  // Y轴上下随机偏移范围（单位：世界坐标）
  yRange: 0.8,
  // 角度随机偏移范围（弧度，影响左右分布）
  angleRange: 0.25,
  // Z轴（深度）随机偏移范围，模拟前后堆叠
  depthRange: 0.35,
  // 图片旋转角度随机范围（弧度，让图片歪一点）
  rotationRange: Math.PI / 18 // 10度以内
}

let renderer
let scene
let camera
let cylinderGroup
let resizeObserver
let animationFrame = 0
let disposed = false
let clock
let raycaster
let pointer
let hoveredCard = null
let lastSize = { width: 0, height: 0 }
let sceneObjects = []
let photoCards = []
let interactiveMeshes = []
let pointerHandlers = null
let buildVersion = 0
let sceneActive = true

onMounted(() => {
  initScene()
  loadPhotos()
})

onActivated(() => {
  sceneActive = true
  resizeScene()
  startAnimation()
})

onDeactivated(() => {
  stopAnimation()
})

onBeforeUnmount(() => {
  disposed = true
  stopAnimation()
  resizeObserver?.disconnect()
  removePointerEvents()
  clearCylinder()
  renderer?.dispose()
  renderer?.domElement?.remove()
})

function initScene() {
  if (!sceneEl.value) return

  scene = new THREE.Scene()

  camera = new THREE.PerspectiveCamera(76, 1, 0.08, 120)
  camera.position.set(0, 0, 0)
  camera.lookAt(0, 0, -1)

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
    preserveDrawingBuffer: true,
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.setClearAlpha(0)
  renderer.sortObjects = true
  sceneEl.value.appendChild(renderer.domElement)

  raycaster = new THREE.Raycaster()
  pointer = new THREE.Vector2()

  cylinderGroup = new THREE.Group()
  scene.add(cylinderGroup)

  addPointerEvents()

  resizeObserver = new ResizeObserver(resizeScene)
  resizeObserver.observe(sceneEl.value)
  resizeScene()

  clock = new THREE.Clock()
  startAnimation()
}

function startAnimation() {
  if (disposed || animationFrame || !renderer || !scene || !camera || !clock) return

  sceneActive = true
  clock?.getDelta()
  animationFrame = requestAnimationFrame(animate)
}

function stopAnimation() {
  sceneActive = false
  cancelAnimationFrame(animationFrame)
  animationFrame = 0
  setHoveredCard(null)
}

function resizeScene() {
  if (!sceneEl.value || !renderer || !camera) return

  const width = sceneEl.value.clientWidth
  const height = sceneEl.value.clientHeight
  if (!width || !height) return

  renderer.setSize(width, height, false)
  camera.aspect = width / height

  if (Math.abs(width - lastSize.width) > 2 || Math.abs(height - lastSize.height) > 2) {
    lastSize = { width, height }
    rebuildCylinder(width, height)
  } else {
    camera.updateProjectionMatrix()
  }
}

function rebuildCylinder(containerWidth, containerHeight) {
  clearCylinder()
  buildVersion += 1

  const pxToWorld = worldHeight / containerHeight
  const circumference = containerWidth * pxToWorld * gentleCurveFactor
  const radius = circumference / (Math.PI * 2)
  const height = containerHeight * pxToWorld

  camera.fov = clamp(THREE.MathUtils.radToDeg(2 * Math.atan((height / 2) / radius)), 54, 100)
  camera.near = Math.max(0.04, radius * 0.01)
  camera.far = Math.max(80, radius * 7)
  camera.updateProjectionMatrix()

  const layout = computePhotoLayout(containerHeight)
  addPhotos(radius, height, layout)
}

async function loadPhotos() {
  try {
    const res = await photoPageService({
      pageNum: 1,
      pageSize: 120,
      photoType: 'photo',
    })
    const page = res?.data ?? res ?? {}
    const records = page.records ?? page.list ?? []
    const managedPhotos = records
      .map((item) => ({
        src: item.imageUrl || item.url || item.src,
        title: item.title || '',
      }))
      .filter((item) => item.src)

    if (!managedPhotos.length || disposed) return

    photos = managedPhotos
    if (lastSize.width && lastSize.height) {
      rebuildCylinder(lastSize.width, lastSize.height)
    }
  } catch (err) {
    console.warn('[photos] 照片管理接口不可用，使用默认照片墙', err)
  }
}

function computePhotoLayout(containerHeight) {
  // 略微减少行数，让图片分布更松散
  const numRows = clamp(Math.round(containerHeight / 180), 2, 5)
  const photosPerRow = Math.ceil(photos.length / numRows)
  return { numRows, photosPerRow }
}

function addPhotos(radius, height, layout) {
  const loader = new THREE.TextureLoader()
  loader.setCrossOrigin('anonymous')
  const maxAnisotropy = renderer.capabilities.getMaxAnisotropy()
  const { numRows, photosPerRow } = layout
  const angleStep = (Math.PI * 2) / photosPerRow
  const baseRowPitch = (height * 0.8) / numRows
  const usedRows = Math.min(numRows, Math.ceil(photos.length / photosPerRow))
  const rowPitch = baseRowPitch * (usedRows <= 2 ? compactRowGapFactor : 1)
  const maxWidth = angleStep * radius * wallFillFactor
  const maxHeight = baseRowPitch * wallFillFactor
  const initialAngle = -0.62
  const currentBuildVersion = buildVersion

  photos.forEach((photo, index) => {
    const row = Math.floor(index / photosPerRow)
    const col = index % photosPerRow

    // 核心改动1：为位置加入随机偏移
    const baseAngle = initialAngle + col * angleStep
    const angleOffset = (Math.random() - 0.5) * 2 * randomOffsetConfig.angleRange
    const angle = baseAngle + angleOffset

    const baseY = (row - (usedRows - 1) / 2) * rowPitch
    const yOffset = (Math.random() - 0.5) * 2 * randomOffsetConfig.yRange
    const y = baseY + yOffset

    const texture = loader.load(
      photo.src,
      (loadedTexture) => {
        if (disposed || currentBuildVersion !== buildVersion) {
          loadedTexture.dispose()
          return
        }

        loadedTexture.colorSpace = THREE.SRGBColorSpace
        loadedTexture.anisotropy = maxAnisotropy
        loadedTexture.needsUpdate = true
        addPhotoCard({
          texture: loadedTexture,
          src: photo.src,
          aspect: loadedTexture.image.width / loadedTexture.image.height,
          radius,
          height,
          maxWidth,
          maxHeight,
          angle,
          y,
          index,
        })
      },
      undefined,
      () => {
        const fallbackTexture = makeFallbackTexture(index)
        addPhotoCard({
          texture: fallbackTexture,
          src: photo.src,
          aspect: 1.4,
          radius,
          height,
          maxWidth,
          maxHeight,
          angle,
          y,
          index,
        })
      },
    )
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = maxAnisotropy
  })
}

function addPhotoCard({ texture, src, aspect, radius, height, maxWidth, maxHeight, angle, y, index }) {
  const sizeScale = getPhotoSizeScale(src, index)
  const { width, photoHeight } = fitPhotoSize(maxWidth * sizeScale, maxHeight * sizeScale, aspect)
  
  // 核心改动2：深度随机偏移，让图片前后错开
  const baseDepthOffset = index * Math.max(height * 0.0008, radius * 0.00004)
  const randomDepthOffset = Math.random() * randomOffsetConfig.depthRange
  const totalDepthOffset = baseDepthOffset + randomDepthOffset

  const frameRadius = radius - height * 0.002 - totalDepthOffset
  const photoRadius = frameRadius - height * 0.016

  const frameMaterial = new THREE.MeshBasicMaterial({
    color: baseFrameColor,
    side: THREE.BackSide,
    depthTest: true,
    depthWrite: true,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -2 - index,
  })
  const frame = createCurvedMesh({
    radius: frameRadius,
    angle,
    y,
    width: width + height * 0.018,
    height: photoHeight + height * 0.018,
    material: frameMaterial,
  })

  const photoMaterial = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.BackSide,
    depthTest: true,
    depthWrite: true,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -4 - index,
  })
  const mesh = createCurvedMesh({
    radius: photoRadius,
    angle,
    y,
    width,
    height: photoHeight,
    material: photoMaterial,
  })

  // 核心改动3：图片随机旋转一点角度，打破水平对齐
  const rotationOffset = (Math.random() - 0.5) * 2 * randomOffsetConfig.rotationRange
  frame.rotation.z = rotationOffset
  mesh.rotation.z = rotationOffset

  frame.renderOrder = index
  mesh.renderOrder = index + 0.5
  const normal = new THREE.Vector3(-Math.sin(angle), 0, Math.cos(angle)).normalize()
  const card = {
    src,
    frame,
    mesh,
    frameMaterial,
    photoMaterial,
    normal,
    hover: 0,
    targetHover: 0,
    lift: height * 0.075,
    baseRenderOrder: index,
  }

  frame.userData.photoCard = card
  mesh.userData.photoCard = card
  cylinderGroup.add(frame, mesh)
  sceneObjects.push(frame, mesh)
  photoCards.push(card)
  interactiveMeshes.push(frame, mesh)
}

function makeFallbackTexture(index) {
  const canvas = document.createElement('canvas')
  canvas.width = 320
  canvas.height = 224
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = index % 2 ? '#d9e5f2' : '#edf2f7'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#5f6f85'
  ctx.font = '600 20px sans-serif'
  ctx.fillText('PHOTO', 28, 52)
  ctx.fillStyle = '#8da0b8'
  ctx.fillRect(28, 84, 264, 8)
  ctx.fillRect(28, 112, 190, 8)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function fitPhotoSize(maxWidth, maxHeight, aspect) {
  let width = maxWidth
  let photoHeight = width / aspect

  if (photoHeight > maxHeight) {
    photoHeight = maxHeight
    width = photoHeight * aspect
  }

  return { width, photoHeight }
}

function getPhotoSizeScale(src, index) {
  const seed = `${src}-${index}`
  let hash = 0

  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  }

  const randomRatio = hash / 0xffffffff
  return THREE.MathUtils.lerp(photoScaleRange.min, photoScaleRange.max, randomRatio)
}

function createCurvedMesh({ radius, angle, y, width, height, material }) {
  const geometry = createCurvedPanelGeometry(radius, angle, y, width, height)
  return new THREE.Mesh(geometry, material)
}

function createCurvedPanelGeometry(radius, centerAngle, centerY, panelWidth, panelHeight) {
  const horizontalSegments = 18
  const verticalSegments = 2
  const angularWidth = panelWidth / radius
  const vertices = []
  const uvs = []
  const indices = []

  for (let iy = 0; iy <= verticalSegments; iy += 1) {
    const v = iy / verticalSegments
    const y = centerY + (v - 0.5) * panelHeight

    for (let ix = 0; ix <= horizontalSegments; ix += 1) {
      const u = ix / horizontalSegments
      const angle = centerAngle + (u - 0.5) * angularWidth
      vertices.push(Math.sin(angle) * radius, y, -Math.cos(angle) * radius)
      uvs.push(u, v)
    }
  }

  for (let iy = 0; iy < verticalSegments; iy += 1) {
    for (let ix = 0; ix < horizontalSegments; ix += 1) {
      const a = iy * (horizontalSegments + 1) + ix
      const b = a + horizontalSegments + 1
      indices.push(a, b, a + 1, b, b + 1, a + 1)
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}

function addPointerEvents() {
  const canvas = renderer.domElement
  pointerHandlers = {
    move: onPointerMove,
    leave: () => setHoveredCard(null),
    click: onPhotoClick,
  }

  canvas.addEventListener('pointermove', pointerHandlers.move)
  canvas.addEventListener('pointerleave', pointerHandlers.leave)
  canvas.addEventListener('click', pointerHandlers.click)
}

function removePointerEvents() {
  if (!pointerHandlers || !renderer?.domElement) return

  const canvas = renderer.domElement
  canvas.removeEventListener('pointermove', pointerHandlers.move)
  canvas.removeEventListener('pointerleave', pointerHandlers.leave)
  canvas.removeEventListener('click', pointerHandlers.click)
  pointerHandlers = null
}

function onPointerMove(event) {
  if (!renderer || !camera || !raycaster || !pointer || showImagePreview.value) return

  const rect = renderer.domElement.getBoundingClientRect()
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
  scene.updateMatrixWorld(true)
  raycaster.setFromCamera(pointer, camera)

  const hit = raycaster.intersectObjects(interactiveMeshes, false)[0]
  setHoveredCard(hit?.object?.userData?.photoCard || null)
}

function setHoveredCard(card) {
  if (hoveredCard === card) return

  if (hoveredCard) {
    hoveredCard.targetHover = 0
    setCardRenderPriority(hoveredCard, false)
  }
  hoveredCard = card
  if (hoveredCard) {
    hoveredCard.targetHover = 1
    setCardRenderPriority(hoveredCard, true)
  }

  if (renderer?.domElement) {
    renderer.domElement.style.cursor = hoveredCard ? 'zoom-in' : 'default'
  }
}

function setCardRenderPriority(card, active) {
  const order = active ? 10000 : card.baseRenderOrder
  card.frame.renderOrder = order
  card.mesh.renderOrder = order + 0.5
  card.frameMaterial.depthTest = !active
  card.photoMaterial.depthTest = !active
  card.frameMaterial.polygonOffset = !active
  card.photoMaterial.polygonOffset = !active
}

function onPhotoClick() {
  if (!hoveredCard) return

  currentPreviewImage.value = hoveredCard.src
  showImagePreview.value = true
}

function closeImagePreview() {
  showImagePreview.value = false
  currentPreviewImage.value = ''
}

function animate() {
  if (disposed || !sceneActive) {
    animationFrame = 0
    return
  }

  if (!renderer || !scene || !camera || !clock) {
    animationFrame = 0
    return
  }

  animationFrame = requestAnimationFrame(animate)
  const delta = Math.min(clock.getDelta(), 0.04)

  if (!hoveredCard && !showImagePreview.value) {
    cylinderGroup.rotation.y += delta * cylinderRotationSpeed
  }

  updatePhotoHover()
  renderer.render(scene, camera)
}

function updatePhotoHover() {
  photoCards.forEach((card) => {
    card.hover += (card.targetHover - card.hover) * 0.18
    hoverOffset.copy(card.normal).multiplyScalar(card.hover * card.lift)
    card.frame.position.copy(hoverOffset)
    card.mesh.position.copy(hoverOffset)
    card.frameMaterial.color.copy(baseFrameColor).lerp(hoverFrameColor, card.hover)
  })
}

function clearCylinder() {
  setHoveredCard(null)
  sceneObjects.forEach((item) => {
    cylinderGroup?.remove(item)
    item.geometry?.dispose?.()
    if (Array.isArray(item.material)) {
      item.material.forEach(disposeMaterial)
    } else {
      disposeMaterial(item.material)
    }
  })
  sceneObjects = []
  photoCards = []
  interactiveMeshes = []
}

function disposeMaterial(material) {
  if (!material) return
  material.map?.dispose?.()
  material.dispose?.()
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}
</script>

<style scoped>
.blog-page {
  width: 100%;
  height: calc(100vh - var(--blog-header-height, 118px));
  min-height: 360px;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.photo-cylinder {
  position: relative;
  width: 90%;
  height: 95%;
  flex: none;
  overflow: hidden;
}

.photo-cylinder :deep(canvas) {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
