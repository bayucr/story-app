export const VIEWED_KEY = 'viewedStories'

/** Reads viewed story ids from localStorage. Invalid data is discarded safely. */
export function loadViewed(): Set<string> {
  try {
    const raw = localStorage.getItem(VIEWED_KEY)
    if (!raw) return new Set()
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      localStorage.removeItem(VIEWED_KEY)
      return new Set()
    }
    return new Set(parsed.filter((v): v is string => typeof v === 'string'))
  } catch {
    try {
      localStorage.removeItem(VIEWED_KEY)
    } catch {
      /* storage unavailable */
    }
    return new Set()
  }
}

/** Persists viewed ids. Failures are ignored: viewed state is a convenience, not critical data. */
export function saveViewed(ids: Set<string>): void {
  try {
    localStorage.setItem(VIEWED_KEY, JSON.stringify([...ids]))
  } catch {
    /* quota or unavailable: keep the in-memory state only */
  }
}

/** Keeps only ids that still belong to an active story. */
export function pruneViewed(ids: Set<string>, activeIds: string[]): Set<string> {
  const active = new Set(activeIds)
  return new Set([...ids].filter((id) => active.has(id)))
}
