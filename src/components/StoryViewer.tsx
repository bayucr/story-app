import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, type PanInfo } from 'motion/react'
import { ChevronLeft, ChevronRight, Pause, Play, Trash2, X } from 'lucide-react'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { Avatar } from './Avatar'
import type { Profile } from '@/utils/profile'
import { STORY_DURATION_MS, type Story } from '@/types'
import { cn } from '@/utils/cn'
import { timeAgo } from '@/utils/time'

interface StoryViewerProps {
  stories: Story[]
  profile: Profile
  startIndex: number
  onClose: () => void
  onView: (id: string) => void
  onDelete: (id: string) => void
}

const SWIPE_DISTANCE = 60
const SWIPE_VELOCITY = 500
const CLOSE_DISTANCE = 120

export function StoryViewer({ stories, profile, startIndex, onClose, onView, onDelete }: StoryViewerProps) {
  const [index, setIndex] = useState(startIndex)
  const [progress, setProgress] = useState(0)
  const [confirming, setConfirming] = useState(false)
  const [userPaused, setUserPaused] = useState(false)
  const userPausedRef = useRef(false)
  const dialogRef = useRef<HTMLDivElement>(null)
  useFocusTrap(dialogRef)
  const confirmingRef = useRef(false)
  const hiddenRef = useRef(false)
  const resyncRef = useRef(false)

  const safeIndex = Math.min(index, stories.length - 1)
  const story: Story | undefined = stories[safeIndex]
  const storyId = story?.id

  const containerRef = useRef<HTMLDivElement>(null)
  const pausedRef = useRef(false)
  const elapsedRef = useRef(0)
  const indexRef = useRef(safeIndex)
  const countRef = useRef(stories.length)
  indexRef.current = safeIndex
  countRef.current = stories.length

  const closeRef = useRef(onClose)
  closeRef.current = onClose

  /** Moves by delta stories. Past the last story closes; before the first restarts it. */
  const go = useCallback((delta: number) => {
    const target = indexRef.current + delta
    if (target >= countRef.current) {
      closeRef.current()
    } else if (target < 0) {
      elapsedRef.current = 0
    } else {
      setIndex(target)
    }
  }, [])

  const goRef = useRef(go)
  goRef.current = go

  // Close when every story has expired while viewing.
  useEffect(() => {
    if (stories.length === 0) onClose()
  }, [stories.length, onClose])

  // Mark as viewed.
  useEffect(() => {
    if (storyId) onView(storyId)
  }, [storyId, onView])

  // Cancel a pending delete confirmation when the visible story changes.
  useEffect(() => {
    confirmingRef.current = false
    pausedRef.current = false
    setConfirming(false)
  }, [storyId])

  // Progress timer + auto-advance.
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
      if (!pausedRef.current && !hiddenRef.current && !userPausedRef.current) {
        elapsedRef.current += dt
      }
      const p = Math.min(1, elapsedRef.current / STORY_DURATION_MS)
      setProgress(p)
      if (p >= 1) {
        goRef.current(1)
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [storyId])

  // Keyboard controls.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const typing = target?.tagName === 'TEXTAREA' || target?.tagName === 'INPUT'
      if (e.key === 'ArrowRight') goRef.current(1)
      else if (e.key === 'ArrowLeft') goRef.current(-1)
      else if (e.key === 'Escape') closeRef.current()
      else if (e.key === ' ' && !typing && target?.tagName !== 'BUTTON') {
        e.preventDefault()
        toggleUserPauseRef.current()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

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

  // Lock page scroll while open.
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  const toggleUserPause = () => {
    userPausedRef.current = !userPausedRef.current
    setUserPaused(userPausedRef.current)
  }
  const toggleUserPauseRef = useRef(toggleUserPause)
  toggleUserPauseRef.current = toggleUserPause

  /** Marks the current pointer gesture as started on a control so the tap handler ignores it. */
  const controlTapRef = useRef(false)
  const guardTap = (e: { stopPropagation: () => void }) => {
    e.stopPropagation()
    controlTapRef.current = true
    window.setTimeout(() => {
      controlTapRef.current = false
    }, 400)
  }

  const pause = () => {
    pausedRef.current = true
  }
  const resume = () => {
    pausedRef.current = confirmingRef.current
  }

  const requestDelete = () => {
    confirmingRef.current = true
    pausedRef.current = true
    setConfirming(true)
  }

  const cancelDelete = () => {
    confirmingRef.current = false
    pausedRef.current = false
    setConfirming(false)
  }

  const confirmDelete = () => {
    if (!story) return
    confirmingRef.current = false
    pausedRef.current = false
    setConfirming(false)
    onDelete(story.id)
  }

  const handleDragEnd = (_: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
    resume()
    const { offset, velocity } = info
    const vertical = Math.abs(offset.y) > Math.abs(offset.x)
    if (vertical) {
      if (offset.y > CLOSE_DISTANCE || velocity.y > SWIPE_VELOCITY) onClose()
      return
    }
    if (offset.x < -SWIPE_DISTANCE || velocity.x < -SWIPE_VELOCITY) go(1)
    else if (offset.x > SWIPE_DISTANCE || velocity.x > SWIPE_VELOCITY) go(-1)
  }

  const handleTap = (event: MouseEvent | TouchEvent | PointerEvent, info: { point: { x: number } }) => {
    if (controlTapRef.current) {
      controlTapRef.current = false
      return
    }
    if ((event.target as HTMLElement | null)?.closest('button')) return
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    go(info.point.x < rect.left + rect.width * 0.33 ? -1 : 1)
  }

  if (!story) return null

  return (
    <motion.div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Story viewer"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black sm:bg-black/90 sm:backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <motion.div
        ref={containerRef}
        className={cn(
          'relative h-full w-full touch-none overflow-hidden bg-neutral-900 select-none',
          'sm:h-[calc(100dvh-2rem)] sm:max-h-[920px] sm:w-auto sm:aspect-[9/16] sm:rounded-2xl sm:shadow-2xl',
        )}
        initial={{ scale: 0.92, y: 24 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        drag
        dragDirectionLock
        dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
        dragElastic={{ top: 0, bottom: 0.6, left: 0.25, right: 0.25 }}
        onPointerDown={pause}
        onPointerUp={resume}
        onPointerCancel={resume}
        onDragStart={pause}
        onDragEnd={handleDragEnd}
        onTap={handleTap}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={story.id}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Blurred backdrop fills the empty space around non-9:16 images */}
            <img
              src={story.image}
              alt=""
              aria-hidden
              draggable={false}
              className="absolute inset-0 size-full scale-125 object-cover blur-2xl brightness-50"
            />
            <img
              src={story.image}
              alt={story.caption ? `Story photo: ${story.caption}` : 'Story photo'}
              draggable={false}
              className="relative size-full object-contain"
            />
          </motion.div>
        </AnimatePresence>

        {/* Screen reader announcement when the story changes */}
        <p className="sr-only" role="status" aria-live="polite">
          {`Story ${safeIndex + 1} of ${stories.length}, posted ${timeAgo(story.createdAt)}`}
        </p>

        {/* Top gradient for readability */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/60 to-transparent" />

        {/* Progress bars */}
        <div className="safe-top pointer-events-none absolute inset-x-0 top-0 px-3 pt-3">
          <div className="flex gap-1" aria-hidden>
            {stories.map((s, i) => (
              <div key={s.id} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/30">
                <div
                  className="h-full origin-left rounded-full bg-white"
                  style={{
                    transform: `scaleX(${i < safeIndex ? 1 : i === safeIndex ? progress : 0})`,
                  }}
                />
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-white drop-shadow">
              <Avatar name={profile.name} src={profile.avatar} size={32} />
              <span className="text-sm font-semibold">{profile.username}</span>
              <span className="text-sm text-white/70">{timeAgo(story.createdAt)}</span>
            </div>
            <div className="pointer-events-auto flex items-center gap-1">
            <button
              type="button"
              aria-label={userPaused ? 'Play story' : 'Pause story'}
              aria-pressed={userPaused}
              onPointerDown={guardTap}
              onClick={toggleUserPause}
              className="rounded-full p-1.5 text-white transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white"
            >
              {userPaused ? <Play className="size-6" aria-hidden /> : <Pause className="size-6" aria-hidden />}
            </button>
            <button
              type="button"
              aria-label="Close story"
              onPointerDown={guardTap}
              onClick={onClose}
              className="pointer-events-auto rounded-full p-1.5 text-white transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white"
            >
              <X className="size-6" aria-hidden />
            </button>
            </div>
          </div>
        </div>

        {/* Desktop navigation arrows (touch users swipe or tap) */}
        {safeIndex > 0 && (
          <button
            type="button"
            aria-label="Previous story"
            onPointerDown={guardTap}
            onClick={() => go(-1)}
            className="absolute top-1/2 left-2 hidden -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white sm:block"
          >
            <ChevronLeft className="size-6" aria-hidden />
          </button>
        )}
        <button
          type="button"
          aria-label={safeIndex === stories.length - 1 ? 'Close story viewer' : 'Next story'}
          onPointerDown={guardTap}
          onClick={() => go(1)}
          className="absolute top-1/2 right-2 hidden -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white sm:block"
        >
          <ChevronRight className="size-6" aria-hidden />
        </button>

        {/* Caption */}
        {story.caption && (
          <div className="pointer-events-none absolute inset-x-0 bottom-16 px-4 pr-16">
            <p className="inline-block max-w-full rounded-xl bg-black/55 px-3 py-2 text-sm leading-snug break-words whitespace-pre-wrap text-white backdrop-blur-sm">
              {story.caption}
            </p>
          </div>
        )}

        {/* Delete controls */}
        <div className="safe-bottom pointer-events-none absolute inset-x-0 bottom-0 flex justify-end bg-gradient-to-t from-black/60 to-transparent p-4 pt-12">
          {confirming ? (
            <div
              role="alertdialog"
              aria-label="Delete this story?"
              className="pointer-events-auto flex items-center gap-2 rounded-full bg-neutral-900/90 py-1.5 pr-1.5 pl-4 text-sm text-white backdrop-blur"
              onPointerDown={guardTap}
            >
              <span>Delete this story?</span>
              <button
                type="button"
                onClick={cancelDelete}
                className="rounded-full px-3 py-1.5 font-medium text-neutral-200 transition hover:bg-white/15"
              >
                Cancel
              </button>
              <button
                type="button"
                autoFocus
                onClick={confirmDelete}
                className="rounded-full bg-red-600 px-3 py-1.5 font-medium text-white transition hover:bg-red-500"
              >
                Delete
              </button>
            </div>
          ) : (
            <button
              type="button"
              aria-label="Delete story"
              onPointerDown={guardTap}
              onClick={requestDelete}
              className="pointer-events-auto rounded-full bg-black/40 p-2.5 text-white backdrop-blur transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white"
            >
              <Trash2 className="size-5" aria-hidden />
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
