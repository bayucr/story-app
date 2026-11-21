import { MAX_CAPTION_LENGTH, STORAGE_KEY, type Story } from '@/types'

function isStory(value: unknown): value is Story {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v.id === 'string' &&
    typeof v.image === 'string' &&
    v.image.startsWith('data:image/') &&
    typeof v.createdAt === 'number' &&
    typeof v.expiresAt === 'number' &&
    (v.caption === undefined ||
      (typeof v.caption === 'string' && v.caption.length <= MAX_CAPTION_LENGTH))
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

/**
 * Puts a previously deleted story back at its old position (used by undo).
 * Returns the save result and the resulting list (unchanged when restoring failed or the story expired).
 */
export function restoreStory(
  story: Story,
  index: number,
  now: number = Date.now(),
): { result: SaveResult; stories: Story[] } {
  const existing = loadStories()
  if (existing.some((s) => s.id === story.id)) return { result: { ok: true }, stories: existing }
  if (story.expiresAt <= now) return { result: { ok: false, reason: 'unavailable' }, stories: existing }
  const next = [...existing]
  next.splice(Math.min(Math.max(index, 0), next.length), 0, story)
  const result = saveStories(next)
  return { result, stories: result.ok ? next : existing }
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
