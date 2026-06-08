import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

const VISIBLE = 'visible'
const HIDING = 'hiding'
const HIDDEN = 'hidden'
const RETURNING = 'returning'
const STORAGE_KEY = 'personblog-pet-display-state'

function readStoredState() {
  if (typeof window === 'undefined') return VISIBLE
  const saved = window.localStorage.getItem(STORAGE_KEY)
  return saved === HIDDEN ? HIDDEN : VISIBLE
}

function persistState(state) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, state === HIDDEN ? HIDDEN : VISIBLE)
}

export const usePetStore = defineStore('pet', () => {
  const displayState = ref(readStoredState())

  const visible = computed(() => displayState.value !== HIDDEN)
  const hidden = computed(() => displayState.value === HIDDEN)
  const hiding = computed(() => displayState.value === HIDING)
  const returning = computed(() => displayState.value === RETURNING)

  function startHide() {
    if (hiding.value || hidden.value) return false
    persistState(HIDDEN)
    displayState.value = HIDING
    return true
  }

  function finishHide() {
    if (displayState.value === HIDING) {
      displayState.value = HIDDEN
      persistState(HIDDEN)
    }
  }

  function startReturn() {
    if (!hidden.value && visible.value) return false
    persistState(VISIBLE)
    displayState.value = RETURNING
    return true
  }

  function finishReturn() {
    if (displayState.value === RETURNING) {
      displayState.value = VISIBLE
      persistState(VISIBLE)
    }
  }

  function show() {
    displayState.value = VISIBLE
    persistState(VISIBLE)
  }

  function hide() {
    displayState.value = HIDDEN
    persistState(HIDDEN)
  }

  function settleTransition() {
    if (displayState.value === HIDING) {
      displayState.value = HIDDEN
      persistState(HIDDEN)
    } else if (displayState.value === RETURNING) {
      displayState.value = VISIBLE
      persistState(VISIBLE)
    }
  }

  return {
    displayState,
    visible,
    hidden,
    hiding,
    returning,
    startHide,
    finishHide,
    startReturn,
    finishReturn,
    show,
    hide,
    settleTransition,
  }
})
