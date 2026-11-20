/** Time remaining before expiry, e.g. "5h 12m left", "8m left", "Expiring". */
export function timeLeft(expiresAt: number, now: number = Date.now()): string {
  const minutes = Math.max(0, Math.ceil((expiresAt - now) / 60_000))
  if (minutes < 1) return 'Expiring'
  if (minutes < 60) return `${minutes}m left`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h}h left` : `${h}h ${m}m left`
}

/** Human-friendly relative time, e.g. "Just now", "12m ago", "3h ago". */
export function timeAgo(createdAt: number, now: number = Date.now()): string {
  const minutes = Math.max(0, Math.floor((now - createdAt) / 60_000))
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}
