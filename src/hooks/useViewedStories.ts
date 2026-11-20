import { useCallback, useEffect, useState } from 'react'
import type { Story } from '@/types'
import { VIEWED_KEY, loadViewed, pruneViewed, saveViewed } from '@/utils/viewed'

export function useViewedStories(stories: Story[]) {
  const [viewedIds, setViewedIds] = useState<Set<string>>(loadViewed)

  // Drop ids of stories that were deleted or expired so the list does not grow forever.
  useEffect(() => {
    setViewedIds((prev) => {
      const next = pruneViewed(
        prev,
        stories.map((s) => s.id),
      )
      if (next.size === prev.size) return prev
      saveViewed(next)
      return next
    })
  }, [stories])

  // Keep multiple tabs in sync.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === VIEWED_KEY || e.key === null) setViewedIds(loadViewed())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const markViewed = useCallback((id: string) => {
    setViewedIds((prev) => {
      if (prev.has(id)) return prev
      const next = new Set(prev).add(id)
      saveViewed(next)
      return next
    })
  }, [])

  return { viewedIds, markViewed }
}
