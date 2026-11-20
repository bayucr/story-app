import { useCallback, useEffect, useRef, useState } from 'react'
import { STORAGE_KEY, type Story } from '@/types'
import { createStory, msUntilNextExpiry, removeExpired } from '@/utils/expiry'
import { loadStories, saveStories, type SaveResult } from '@/utils/storage'

/** Longest delay setTimeout can handle safely (~24.8 days). */
const MAX_TIMEOUT_MS = 2 ** 31 - 1

function loadFresh(): Story[] {
  const all = loadStories()
  const fresh = removeExpired(all)
  if (fresh.length !== all.length) saveStories(fresh)
  return fresh
}

export function useStories() {
  const [stories, setStories] = useState<Story[]>(loadFresh)
  const storiesRef = useRef(stories)
  storiesRef.current = stories

  /** Drops expired stories from state and storage. */
  const prune = useCallback(() => {
    const current = storiesRef.current
    const fresh = removeExpired(current)
    if (fresh.length !== current.length) {
      saveStories(fresh)
      setStories(fresh)
    }
  }, [])

  // Schedule a prune exactly when the next story expires.
  useEffect(() => {
    const delay = msUntilNextExpiry(stories)
    if (delay === null) return
    const id = window.setTimeout(prune, Math.min(delay + 50, MAX_TIMEOUT_MS))
    return () => window.clearTimeout(id)
  }, [stories, prune])

  // Re-check when the tab becomes visible again (timers may be throttled while hidden).
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') prune()
    }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', onVisible)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', onVisible)
    }
  }, [prune])

  // Keep multiple tabs in sync.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY || e.key === null) setStories(loadFresh())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  /** Adds a story (newest first). Returns the save result so the UI can report quota errors. */
  const addStory = useCallback((image: string, caption?: string): SaveResult => {
    const next = [createStory(image, caption), ...removeExpired(storiesRef.current)]
    const result = saveStories(next)
    if (result.ok) setStories(next)
    return result
  }, [])

  /** Removes a story by id. Returns the save result so the UI can report failures. */
  const removeStory = useCallback((id: string): SaveResult => {
    const next = storiesRef.current.filter((s) => s.id !== id)
    const result = saveStories(next)
    if (result.ok) setStories(next)
    return result
  }, [])

  return { stories, addStory, removeStory }
}
