const PROFILE_KEY = 'personblog_comment_profile'
const PROFILES_KEY = 'personblog_comment_profiles'

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

export function loadCommentProfile() {
  const legacy = {
    nickname: localStorage.getItem('personblog_comment_nickname') || '',
    email: localStorage.getItem('personblog_comment_email') || '',
    website: localStorage.getItem('personblog_comment_website') || '',
    avatar: localStorage.getItem('personblog_comment_avatar') || '',
  }
  const saved = readJson(PROFILE_KEY, null)
  if (!saved) {
    return { ...legacy }
  }
  return {
    nickname: saved.nickname ?? legacy.nickname,
    email: saved.email ?? legacy.email,
    website: saved.website ?? legacy.website,
    avatar: saved.avatar ?? legacy.avatar,
  }
}

export function saveCommentProfile(profile = {}) {
  const payload = {
    nickname: String(profile.nickname || '').trim(),
    email: String(profile.email || '').trim().toLowerCase(),
    website: String(profile.website || '').trim(),
    avatar: String(profile.avatar || '').trim(),
  }

  writeJson(PROFILE_KEY, payload)

  if (payload.nickname) localStorage.setItem('personblog_comment_nickname', payload.nickname)
  if (payload.email) localStorage.setItem('personblog_comment_email', payload.email)
  if (payload.website) localStorage.setItem('personblog_comment_website', payload.website)
  localStorage.setItem('personblog_comment_avatar', payload.avatar)

  if (payload.email) {
    const profiles = readJson(PROFILES_KEY, {})
    profiles[payload.email] = {
      ...profiles[payload.email],
      ...payload,
      updatedAt: Date.now(),
    }
    writeJson(PROFILES_KEY, profiles)
  }

  return payload
}

export function getProfileByEmail(email = '') {
  const key = String(email || '').trim().toLowerCase()
  if (!key) return null
  const profiles = readJson(PROFILES_KEY, {})
  return profiles[key] || null
}

export function resolveCommentAvatar(item = {}) {
  const direct = String(item.avatar || '').trim()
  if (direct) return direct

  const profile = getProfileByEmail(item.email)
  return String(profile?.avatar || '').trim()
}
