import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

const ANIMATION_FRAMES = {
    rotate: [[0], [1], [2], [3], [5], [3, 'f'], [2, 'f'], [1, 'f']],
}

const ANGLES = [360, 45, 90, 135, 180, 225, 270, 315]
const DEFAULT_FRAME = 4
const BODY_FRAME_W = 96
const HEAD_FRAME_W = 62
const PET_SIZE = 96
const MARGIN = 24
const DEFAULT_MOVE_SPEED = 0.06

const PART_POSITIONS = [
    { leg1: { x: 26, y: 43 }, leg2: { x: 54, y: 43 }, leg3: { x: 26, y: 75 }, leg4: { x: 54, y: 75 }, tail: { x: 40, y: 70, z: 1 } },
    { leg1: { x: 33, y: 56 }, leg2: { x: 55, y: 56 }, leg3: { x: 12, y: 72 }, leg4: { x: 32, y: 74 }, tail: { x: 20, y: 64, z: 1 } },
    { leg1: { x: 59, y: 62 }, leg2: { x: 44, y: 60 }, leg3: { x: 25, y: 64 }, leg4: { x: 11, y: 61 }, tail: { x: 4, y: 44, z: 1 } },
    { leg1: { x: 39, y: 63 }, leg2: { x: 60, y: 56 }, leg3: { x: 12, y: 52 }, leg4: { x: 28, y: 50 }, tail: { x: 7, y: 21, z: 0 } },
    { leg1: { x: 23, y: 54 }, leg2: { x: 56, y: 54 }, leg3: { x: 24, y: 25 }, leg4: { x: 54, y: 25 }, tail: { x: 38, y: 2, z: 0 } },
    { leg1: { x: 21, y: 58 }, leg2: { x: 41, y: 64 }, leg3: { x: 53, y: 50 }, leg4: { x: 69, y: 53 }, tail: { x: 72, y: 22, z: 0 } },
    { leg1: { x: 22, y: 59 }, leg2: { x: 30, y: 64 }, leg3: { x: 56, y: 60 }, leg4: { x: 68, y: 62 }, tail: { x: 78, y: 40, z: 0 } },
    { leg1: { x: 47, y: 45 }, leg2: { x: 24, y: 53 }, leg3: { x: 68, y: 68 }, leg4: { x: 47, y: 73 }, tail: { x: 65, y: 65, z: 1 } },
]

const px = (n) => `${n}px`
const clamp = (v, min, max) => Math.min(Math.max(v, min), max)
const nearestN = (x, n) => (x === 0 ? 0 : (x - 1) + Math.abs(((x - 1) % n) - n))
const radToDeg = (rad) => Math.round(rad * (180 / Math.PI))

const setTranslate = (target, x, y) => {
    if (!target) return
    target.style.transform = `translate(${x || 0}, ${y || 0})`
}

const shouldFlipFrame = (frameIndex) => ANIMATION_FRAMES.rotate[frameIndex]?.[1] === 'f'

export function usePetDog(refs, options = {}) {
    const moveSpeed = Number.isFinite(options.moveSpeed)
        ? options.moveSpeed
        : DEFAULT_MOVE_SPEED

    const posX = ref(0)
    const posY = ref(0)
    const targetX = ref(0)
    const targetY = ref(0)
    const walking = ref(false)
    const armed = ref(false)
    const following = ref(false)
    const tipVisible = ref(false)
    const tipText = ref('汪')

    const sprite = {
        angle: 360,
        index: DEFAULT_FRAME,
        timer: { head: null, body: null },
        turning: false,
    }

    let rafId = 0
    let tipTimer = 0
    let idleTimer = 0
    let dragPointerId = null
    let dragOffsetX = 0
    let dragOffsetY = 0
    let dragStartX = 0
    let dragStartY = 0
    let dragDistance = 0
    let dragging = false

    const petStyle = computed(() => ({
        '--pet-current-x': `${posX.value}px`,
        '--pet-current-y': `${posY.value}px`,
        transform: `translate3d(${posX.value}px, ${posY.value}px, 0)`,
    }))

    const getBounds = () => {
        const el = refs.petEl
        const w = el?.offsetWidth ?? PET_SIZE
        const h = el?.offsetHeight ?? PET_SIZE
        return {
            maxX: Math.max(MARGIN, window.innerWidth - w - MARGIN),
            maxY: Math.max(MARGIN, window.innerHeight - h - MARGIN),
        }
    }

    const getPetCenter = () => {
        const el = refs.petEl
        const w = el?.offsetWidth ?? PET_SIZE
        const h = el?.offsetHeight ?? PET_SIZE
        return { x: posX.value + w / 2, y: posY.value + h / 2, w, h }
    }

    const angleToClient = (clientX, clientY) => {
        const { x, y } = getPetCenter()
        const angle = radToDeg(Math.atan2(y - clientY, x - clientX)) - 90
        const adjusted = angle < 0 ? angle + 360 : angle
        return nearestN(adjusted, 45)
    }

    const frameIndexFromAngle = (angle) => ANGLES.indexOf(angle)

    const showTip = (text, duration = 1400) => {
        tipText.value = text
        tipVisible.value = true
        window.clearTimeout(tipTimer)
        tipTimer = window.setTimeout(() => {
            tipVisible.value = false
        }, duration)
    }

    const restPet = (text = '') => {
        following.value = false
        armed.value = false
        walking.value = false
        targetX.value = posX.value
        targetY.value = posY.value
        stopLegs()
        refs.headWrapperEl?.classList.remove('happy')
        if (text) {
            showTip(text, 1100)
        }
    }

    const positionLegs = (frame) => {
        refs.legEls.forEach((el, i) => {
            const part = PART_POSITIONS[frame][`leg${i + 1}`]
            setTranslate(el, px(part.x), px(part.y))
        })
    }

    const moveLegs = () => {
        refs.legInnerEls.forEach((el, i) => {
            el.classList.toggle('walk-1', i === 0 || i === 3)
            el.classList.toggle('walk-2', i === 1 || i === 2)
        })
    }

    const stopLegs = () => {
        refs.legInnerEls.forEach((el) => {
            el.classList.remove('walk-1', 'walk-2')
        })
    }

    const positionTail = (frame) => {
        const { tail } = PART_POSITIONS[frame]
        setTranslate(refs.tailWrapperEl, px(tail.x), px(tail.y))
        refs.tailWrapperEl.style.zIndex = String(tail.z)
        refs.tailInnerEl?.classList.add('wag')
    }

    const applyFrame = (frameIndex) => {
        const frame = ANIMATION_FRAMES.rotate[frameIndex]
        if (!frame || !refs.bodyEl) return

        refs.bodyEl.style.transform = `translateX(${px(frame[0] * -BODY_FRAME_W)})`
        refs.headEl.style.transform = `translateX(${px(frame[0] * -HEAD_FRAME_W)})`
        refs.bodyWrapperEl?.classList.toggle('flip', shouldFlipFrame(frameIndex))
        refs.headWrapperEl.classList.toggle('flip', shouldFlipFrame(frameIndex))

        positionLegs(frameIndex)
        positionTail(frameIndex)
        sprite.angle = ANGLES[frameIndex]
        sprite.index = frameIndex
    }

    const animatePart = ({
        target, frameW, currentFrame, end, part, speed, direction,
    }) => {
        const offset = direction === 'clockwise' ? 1 : -1
        const frame = ANIMATION_FRAMES.rotate[currentFrame][0]

        target.style.transform = `translateX(${px(frame * -frameW)})`

        if (part === 'body') {
            positionLegs(currentFrame)
            moveLegs()
            positionTail(currentFrame)
        } else {
            refs.headWrapperEl.classList.add('happy')
        }

        sprite.angle = ANGLES[currentFrame]
        sprite.index = currentFrame
        refs.bodyWrapperEl?.classList.toggle('flip', shouldFlipFrame(currentFrame))
        refs.headWrapperEl.classList.toggle('flip', shouldFlipFrame(currentFrame))

        let next = currentFrame + offset
        if (next === -1) next = ANIMATION_FRAMES.rotate.length - 1
        if (next === ANIMATION_FRAMES.rotate.length) next = 0

        if (currentFrame !== end) {
            sprite.timer[part] = window.setTimeout(() => {
                animatePart({
                    target, frameW, currentFrame: next, end, part, speed, direction,
                })
            }, speed || 100)
        } else if (part === 'body') {
            sprite.turning = false
            window.setTimeout(() => stopLegs(), 200)
            window.setTimeout(() => refs.headWrapperEl.classList.remove('happy'), 4000)
        }
    }

    const turnToFrame = (end, direction = 'clockwise') => {
        const start = sprite.index
        if (start === end) return
        if (sprite.turning) return

        sprite.turning = true
        window.clearTimeout(sprite.timer.head)
        window.clearTimeout(sprite.timer.body)

        animatePart({
            target: refs.headEl,
            frameW: HEAD_FRAME_W,
            currentFrame: start,
            end,
            part: 'head',
            speed: 100,
            direction,
        })

        window.setTimeout(() => {
            animatePart({
                target: refs.bodyEl,
                frameW: BODY_FRAME_W,
                currentFrame: start,
                end,
                part: 'body',
                speed: 100,
                direction,
            })
        }, 200)
    }

    const faceClient = (clientX, clientY) => {
        const end = frameIndexFromAngle(angleToClient(clientX, clientY))
        if (end === -1 || end === sprite.index || sprite.turning) return
        const direction = end > sprite.index ? 'clockwise' : 'anit-clockwise'
        turnToFrame(end, direction)
    }

    const faceMovement = (dx, dy) => {
        const { x, y } = getPetCenter()
        const end = frameIndexFromAngle(
            nearestN(radToDeg(Math.atan2(dy, dx)) + 90, 45),
        )
        if (end !== -1 && end !== sprite.index && !sprite.turning) {
            applyFrame(end)
        }
    }

    const setTargetFromClient = (clientX, clientY) => {
        const { w, h } = getPetCenter()
        const { maxX, maxY } = getBounds()
        targetX.value = clamp(clientX - w / 2, MARGIN, maxX)
        targetY.value = clamp(clientY - h / 2, MARGIN, maxY)
    }

    const tick = () => {
        if (!dragging) {
            const dx = targetX.value - posX.value
            const dy = targetY.value - posY.value
            const dist = Math.hypot(dx, dy)

            walking.value = following.value && dist > 1.5

            if (walking.value) {
                moveLegs()
                faceMovement(dx, dy)
                posX.value += dx * moveSpeed
                posY.value += dy * moveSpeed
            } else if (following.value) {
                posX.value = targetX.value
                posY.value = targetY.value
                following.value = false
                stopLegs()
                turnToFrame(DEFAULT_FRAME)
                showTip('到了汪~', 1000)
            }
        }

        rafId = window.requestAnimationFrame(tick)
    }

    const onPetPointerDown = (event) => {
        event.preventDefault()
        event.stopPropagation()
        dragging = true
        dragPointerId = event.pointerId
        dragStartX = event.clientX
        dragStartY = event.clientY
        dragDistance = 0
        const rect = refs.petEl.getBoundingClientRect()
        dragOffsetX = event.clientX - rect.left
        dragOffsetY = event.clientY - rect.top
        refs.petEl.setPointerCapture?.(event.pointerId)
    }

    const handlePetTap = () => {
        if (dragDistance > 8) return

        if (following.value) {
            following.value = false
            armed.value = false
            targetX.value = posX.value
            targetY.value = posY.value
            stopLegs()
            showTip('汪，我先歇会', 1300)
            return
        }

        if (armed.value) {
            armed.value = false
            refs.headWrapperEl.classList.remove('happy')
            showTip('好的汪', 1200)
            return
        }

        armed.value = true
        refs.headWrapperEl.classList.add('happy')
        showTip('再点页面我就跑过去', 1600)
    }

    const onPointerMove = (event) => {
        if (dragging && event.pointerId === dragPointerId) {
            const { maxX, maxY } = getBounds()
            posX.value = clamp(event.clientX - dragOffsetX, MARGIN, maxX)
            posY.value = clamp(event.clientY - dragOffsetY, MARGIN, maxY)
            targetX.value = posX.value
            targetY.value = posY.value
            dragDistance = Math.hypot(event.clientX - dragStartX, event.clientY - dragStartY)
            return
        }

        if (!walking.value && !following.value) {
            faceClient(event.clientX, event.clientY)
        }
    }

    const onPointerUp = (event) => {
        if (!dragging || event.pointerId !== dragPointerId) return
        dragging = false
        dragPointerId = null
        handlePetTap()
    }

    const onPagePointerDown = (event) => {
        if (dragging || !armed.value) return
        if (refs.petEl?.contains(event.target)) return

        armed.value = false
        following.value = true
        refs.headWrapperEl.classList.remove('happy')
        setTargetFromClient(event.clientX, event.clientY)
        showTip('出发汪', 1000)
    }

    const handleResize = () => {
        const { maxX, maxY } = getBounds()
        posX.value = clamp(posX.value, MARGIN, maxX)
        posY.value = clamp(posY.value, MARGIN, maxY)
        targetX.value = clamp(targetX.value, MARGIN, maxX)
        targetY.value = clamp(targetY.value, MARGIN, maxY)
    }

    onMounted(async () => {
        await nextTick()
        const el = refs.petEl
        if (el) {
            const { left, top } = el.getBoundingClientRect()
            el.style.left = '0'
            el.style.top = '0'
            el.style.bottom = 'auto'
            posX.value = left
            posY.value = top
            targetX.value = left
            targetY.value = top
        }

        applyFrame(DEFAULT_FRAME)
        showTip('汪，点我互动', 1600)

        window.addEventListener('pointermove', onPointerMove, { passive: true })
        window.addEventListener('pointerup', onPointerUp, { passive: true })
        window.addEventListener('pointercancel', onPointerUp, { passive: true })
        window.addEventListener('pointerdown', onPagePointerDown, { capture: true, passive: true })
        window.addEventListener('resize', handleResize, { passive: true })

        rafId = window.requestAnimationFrame(tick)

        idleTimer = window.setInterval(() => {
            if (!walking.value && !following.value && !armed.value && Math.random() > 0.55) {
                showTip('汪~', 1100)
            }
        }, 7200)
    })

    onBeforeUnmount(() => {
        window.removeEventListener('pointermove', onPointerMove)
        window.removeEventListener('pointerup', onPointerUp)
        window.removeEventListener('pointercancel', onPointerUp)
        window.removeEventListener('pointerdown', onPagePointerDown, { capture: true })
        window.removeEventListener('resize', handleResize)
        window.clearTimeout(sprite.timer.head)
        window.clearTimeout(sprite.timer.body)
        if (rafId) window.cancelAnimationFrame(rafId)
        if (tipTimer) window.clearTimeout(tipTimer)
        if (idleTimer) window.clearInterval(idleTimer)
    })

    return {
        petStyle,
        walking,
        armed,
        following,
        tipVisible,
        tipText,
        onPetPointerDown,
        restPet,
        showTip,
    }
}
