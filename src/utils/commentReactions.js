const REACTIONS_KEY = 'personblog_comment_reactions'
const MY_REACTIONS_KEY = 'personblog_comment_my_reactions'
const VISITOR_KEY = 'personblog_comment_visitor_id'

export const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🔥', '👏', '✨']

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function getVisitorId() {
  let id = localStorage.getItem(VISITOR_KEY)
  if (!id) {
    id = `v_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
    localStorage.setItem(VISITOR_KEY, id)
  }
  return id
}

export function getReactionState(commentId) {
  const id = String(commentId)
  const all = readJson(REACTIONS_KEY, {})
  const mine = readJson(MY_REACTIONS_KEY, {})
  const visitorId = getVisitorId()
  const counts = all[id] || {}
  const myEmoji = mine[`${id}:${visitorId}`] || ''

  return {
    counts,
    myEmoji,
    list: REACTION_EMOJIS
      .map((emoji) => ({ emoji, count: counts[emoji] || 0 }))
      .filter((item) => item.count > 0),
  }
}

export function toggleReaction(commentId, emoji) {
  const id = String(commentId)
  const visitorId = getVisitorId()
  const all = readJson(REACTIONS_KEY, {})
  const mine = readJson(MY_REACTIONS_KEY, {})
  const mineKey = `${id}:${visitorId}`
  const counts = { ...(all[id] || {}) }
  const previous = mine[mineKey] || ''

  if (previous === emoji) {
    counts[emoji] = Math.max(0, (counts[emoji] || 0) - 1)
    if (!counts[emoji]) delete counts[emoji]
    delete mine[mineKey]
  } else {
    if (previous) {
      counts[previous] = Math.max(0, (counts[previous] || 0) - 1)
      if (!counts[previous]) delete counts[previous]
    }
    counts[emoji] = (counts[emoji] || 0) + 1
    mine[mineKey] = emoji
  }

  all[id] = counts
  writeJson(REACTIONS_KEY, all)
  writeJson(MY_REACTIONS_KEY, mine)
  return getReactionState(commentId)
}
