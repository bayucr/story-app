import { useCallback, useEffect, useRef, useState } from 'react'

interface StoryTimerOptions {
  /** The timer restarts whenever this changes. */
  storyId: string | undefined
  durationMs: number
  /** Called once when the current story's time is up. */
  onComplete: () => void
}

/**
 * Progress timer for one story at a time. Pauses while the pointer is held,
 * while the tab is hidden, and when the user pauses manually.
 */
export function useStoryTimer({ storyId, durationMs, onComplete }: StoryTimerOptions) {
  const [progress, setProgress] = useState(0)
  const [userPaused, setUserPaused] = useState(false)

  const elapsedRef = useRef(0)
  const holdRef = useRef(false)
  const hiddenRef = useRef(false)
  const resyncRef = useRef(false)
  const userPausedRef = useRef(false)

  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  // Progress + auto-advance.
  useEffect(() => {
    if (!storyId) return
    elapsedRef.current = 0
    setProgress(0)
    let last = performance.now()
    let raf = 0
    const tick = (now: number) => {
      // Cap dt so a long frame never skips ahead; after the tab was hidden,
      // restart the clock so the time spent away is not counted.
      let dt = Math.min(now - last, 100)
      if (resyncRef.current) {
        resyncRef.current = false
        dt = 0
      }
      last = now
      if (!holdRef.current && !hiddenRef.current && !userPausedRef.current) {
        elapsedRef.current += dt
      }
      const p = Math.min(1, elapsedRef.current / durationMs)
      setProgress(p)
      if (p >= 1) {
        onCompleteRef.current()
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [storyId, durationMs])

  // Pause while the tab is hidden and resume from the same position when it returns.
  useEffect(() => {
    const onVisibility = () => {
      const hidden = document.visibilityState === 'hidden'
      hiddenRef.current = hidden
      if (!hidden) resyncRef.current = true
    }
    onVisibility()
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  /** Pauses while the pointer is held down or dragging. */
  const hold = useCallback(() => {
    holdRef.current = true
  }, [])

  const release = useCallback(() => {
    holdRef.current = false
  }, [])

  /** Starts the current story over from zero. */
  const restart = useCallback(() => {
    elapsedRef.current = 0
  }, [])

  const toggleUserPause = useCallback(() => {
    userPausedRef.current = !userPausedRef.current
    setUserPaused(userPausedRef.current)
  }, [])

  return { progress, userPaused, toggleUserPause, hold, release, restart }
}
