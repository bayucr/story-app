/** Estimated localStorage quota in characters (browsers typically allow ~5M characters). */
export const STORAGE_QUOTA_CHARS = 5 * 1024 * 1024

export type UsageLevel = 'ok' | 'warning' | 'critical'

export interface StorageUsage {
  usedChars: number
  quotaChars: number
  /** 0 to 1 */
  ratio: number
  level: UsageLevel
}

/** Sums key and value lengths of every entry. Returns 0 when storage is unavailable. */
export function measureStorageChars(storage: Storage = localStorage): number {
  try {
    let total = 0
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i)
      if (key === null) continue
      total += key.length + (storage.getItem(key)?.length ?? 0)
    }
    return total
  } catch {
    return 0
  }
}

export function levelFor(ratio: number): UsageLevel {
  if (ratio >= 0.95) return 'critical'
  if (ratio >= 0.8) return 'warning'
  return 'ok'
}

export function getStorageUsage(
  storage: Storage = localStorage,
  quotaChars: number = STORAGE_QUOTA_CHARS,
): StorageUsage {
  const usedChars = measureStorageChars(storage)
  const ratio = Math.min(1, usedChars / quotaChars)
  return { usedChars, quotaChars, ratio, level: levelFor(ratio) }
}

/** Formats a character count as megabytes with one decimal, e.g. "3.2". */
export function formatMB(chars: number): string {
  return (chars / (1024 * 1024)).toFixed(1)
}
