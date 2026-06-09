const positionKey = (key) => `${key}:position`
const restoreKey = (key) => `${key}:restore`
const snapshotKey = (key) => `${key}:snapshot`

function getWindowScrollPosition() {
  const scrollingElement = document.scrollingElement || document.documentElement || document.body

  return {
    x: Math.max(window.scrollX || 0, scrollingElement?.scrollLeft || 0, document.body?.scrollLeft || 0),
    y: Math.max(window.scrollY || 0, scrollingElement?.scrollTop || 0, document.body?.scrollTop || 0),
  }
}

function getMaxWindowScrollTop() {
  const scrollingElement = document.scrollingElement || document.documentElement || document.body
  return Math.max(0, (scrollingElement?.scrollHeight || 0) - window.innerHeight)
}

function scheduleWindowScrollRestore(left, top, attempt = 0) {
  const maxAttempts = 12

  requestAnimationFrame(() => {
    const maxScrollTop = getMaxWindowScrollTop()
    const targetTop = Math.min(top, maxScrollTop)

    window.scrollTo({ left, top: targetTop, behavior: 'auto' })

    const currentTop = getWindowScrollPosition().y
    const pageIsTallEnough = maxScrollTop >= top

    if (attempt >= maxAttempts || (pageIsTallEnough && Math.abs(currentTop - targetTop) <= 2)) return

    window.setTimeout(() => {
      scheduleWindowScrollRestore(left, top, attempt + 1)
    }, 50)
  })
}

export function rememberWindowScrollForReturn(key) {
  if (typeof window === 'undefined' || typeof sessionStorage === 'undefined' || !key) return

  const position = getWindowScrollPosition()

  sessionStorage.setItem(positionKey(key), JSON.stringify({
    x: position.x,
    y: position.y,
    savedAt: Date.now(),
  }))
  sessionStorage.setItem(restoreKey(key), '1')
}

export function rememberPageSnapshotForReturn(key, snapshot) {
  if (typeof sessionStorage === 'undefined' || !key) return

  try {
    sessionStorage.setItem(snapshotKey(key), JSON.stringify({
      data: snapshot,
      savedAt: Date.now(),
    }))
  } catch {
    sessionStorage.removeItem(snapshotKey(key))
  }

  rememberWindowScrollForReturn(key)
}

export function hasWindowScrollRestoreMark(key) {
  if (typeof sessionStorage === 'undefined' || !key) return false
  return sessionStorage.getItem(restoreKey(key)) === '1'
}

export function readPageSnapshotForReturn(key) {
  if (typeof sessionStorage === 'undefined' || !key) return null

  try {
    return JSON.parse(sessionStorage.getItem(snapshotKey(key)) || '{}')?.data ?? null
  } catch {
    sessionStorage.removeItem(snapshotKey(key))
    return null
  }
}

export function restoreWindowScrollIfMarked(key) {
  if (typeof window === 'undefined' || typeof sessionStorage === 'undefined' || !key) return false
  if (sessionStorage.getItem(restoreKey(key)) !== '1') return false

  sessionStorage.removeItem(restoreKey(key))

  try {
    const position = JSON.parse(sessionStorage.getItem(positionKey(key)) || '{}')
    const left = Number.isFinite(position.x) ? position.x : 0
    const top = Number.isFinite(position.y) ? position.y : 0

    scheduleWindowScrollRestore(left, top)
    return true
  } catch {
    sessionStorage.removeItem(positionKey(key))
    return false
  }
}
