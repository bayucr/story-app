import { STORAGE_KEY, type Story } from '@/types'

function isStory(value: unknown): value is Story {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v.id === 'string' &&
    typeof v.image === 'string' &&
    v.image.startsWith('data:image/') &&
    typeof v.createdAt === 'number' &&
    typeof v.expiresAt === 'number'
  )
}

/** Reads stories from localStorage. Corrupted or invalid data is discarded safely. */
export function loadStories(): Story[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      localStorage.removeItem(STORAGE_KEY)
      return []
    }
    return parsed.filter(isStory)
  } catch {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* storage unavailable */
    }
    return []
  }
}

export type SaveResult = { ok: true } | { ok: false; reason: 'quota' | 'unavailable' }

function isQuotaError(err: unknown): boolean {
  return (
    err instanceof DOMException &&
    (err.name === 'QuotaExceededError' ||
      err.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      err.code === 22 ||
      err.code === 1014)
  )
}

/** Persists stories to localStorage and reports quota problems instead of throwing. */
export function saveStories(stories: Story[]): SaveResult {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stories))
    return { ok: true }
  } catch (err) {
    return { ok: false, reason: isQuotaError(err) ? 'quota' : 'unavailable' }
  }
}
