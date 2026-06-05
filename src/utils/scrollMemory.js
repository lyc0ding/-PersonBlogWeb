const positionKey = (key) => `${key}:position`
const restoreKey = (key) => `${key}:restore`
const snapshotKey = (key) => `${key}:snapshot`

export function rememberWindowScrollForReturn(key) {
  if (typeof window === 'undefined' || typeof sessionStorage === 'undefined' || !key) return

  sessionStorage.setItem(positionKey(key), JSON.stringify({
    x: window.scrollX,
    y: window.scrollY,
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
  if (typeof window === 'undefined' || typeof sessionStorage === 'undefined' || !key) return
  if (sessionStorage.getItem(restoreKey(key)) !== '1') return

  sessionStorage.removeItem(restoreKey(key))

  try {
    const position = JSON.parse(sessionStorage.getItem(positionKey(key)) || '{}')
    const left = Number.isFinite(position.x) ? position.x : 0
    const top = Number.isFinite(position.y) ? position.y : 0

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo({ left, top, behavior: 'auto' })
      })
    })
  } catch {
    sessionStorage.removeItem(positionKey(key))
  }
}
