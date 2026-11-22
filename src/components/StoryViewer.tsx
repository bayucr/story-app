import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, type PanInfo } from 'motion/react'
import { StoryFooter } from './story/StoryFooter'
import { StoryHeader } from './story/StoryHeader'
import { StoryImage } from './story/StoryImage'
import { StoryNavArrows } from './story/StoryNavArrows'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'
import { useStoryKeyboard } from '@/hooks/useStoryKeyboard'
import { useStoryTimer } from '@/hooks/useStoryTimer'
import { STORY_DURATION_MS, type Story } from '@/types'
import { cn } from '@/utils/cn'
import type { Profile } from '@/utils/profile'
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
/** Window in which a tap right after pressing a control is ignored by the tap handler. */
const CONTROL_TAP_GUARD_MS = 400

export function StoryViewer({ stories, profile, startIndex, onClose, onView, onDelete }: StoryViewerProps) {
  const [index, setIndex] = useState(startIndex)
  const dialogRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  useFocusTrap(dialogRef)
  useLockBodyScroll()

  const safeIndex = Math.min(index, stories.length - 1)
  const story: Story | undefined = stories[safeIndex]
  const storyId = story?.id

  // Latest values for callbacks that must keep a stable identity.
  const indexRef = useRef(safeIndex)
  const countRef = useRef(stories.length)
  indexRef.current = safeIndex
  countRef.current = stories.length
  const closeRef = useRef(onClose)
  closeRef.current = onClose

  const timerRestartRef = useRef<() => void>(() => {})

  /** Moves by delta stories. Past the last story closes; before the first restarts it. */
  const go = useCallback((delta: number) => {
    const target = indexRef.current + delta
    if (target >= countRef.current) closeRef.current()
    else if (target < 0) timerRestartRef.current()
    else setIndex(target)
  }, [])

  const next = useCallback(() => go(1), [go])
  const previous = useCallback(() => go(-1), [go])

  const timer = useStoryTimer({ storyId, durationMs: STORY_DURATION_MS, onComplete: next })
  timerRestartRef.current = timer.restart

  useStoryKeyboard({
    onNext: next,
    onPrevious: previous,
    onClose,
    onTogglePause: timer.toggleUserPause,
  })

  // Close when every story has expired while viewing.
  useEffect(() => {
    if (stories.length === 0) onClose()
  }, [stories.length, onClose])

  // Mark as viewed.
  useEffect(() => {
    if (storyId) onView(storyId)
  }, [storyId, onView])

  /** Marks the current pointer gesture as started on a control so the tap handler ignores it. */
  const controlTapRef = useRef(false)
  const guardTap = (e: { stopPropagation: () => void }) => {
    e.stopPropagation()
    controlTapRef.current = true
    window.setTimeout(() => {
      controlTapRef.current = false
    }, CONTROL_TAP_GUARD_MS)
  }

  const handleDragEnd = (_: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
    timer.release()
    const { offset, velocity } = info
    const vertical = Math.abs(offset.y) > Math.abs(offset.x)
    if (vertical) {
      if (offset.y > CLOSE_DISTANCE || velocity.y > SWIPE_VELOCITY) onClose()
      return
    }
    if (offset.x < -SWIPE_DISTANCE || velocity.x < -SWIPE_VELOCITY) next()
    else if (offset.x > SWIPE_DISTANCE || velocity.x > SWIPE_VELOCITY) previous()
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
        onPointerDown={timer.hold}
        onPointerUp={timer.release}
        onPointerCancel={timer.release}
        onDragStart={timer.hold}
        onDragEnd={handleDragEnd}
        onTap={handleTap}
      >
        <StoryImage story={story} />

        {/* Screen reader announcement when the story changes */}
        <p className="sr-only" role="status" aria-live="polite">
          {`Story ${safeIndex + 1} of ${stories.length}, posted ${timeAgo(story.createdAt)}`}
        </p>

        <StoryHeader
          stories={stories}
          story={story}
          index={safeIndex}
          progress={timer.progress}
          profile={profile}
          userPaused={timer.userPaused}
          onTogglePause={timer.toggleUserPause}
          onClose={onClose}
          guardTap={guardTap}
        />

        <StoryNavArrows
          isFirst={safeIndex === 0}
          isLast={safeIndex === stories.length - 1}
          onPrevious={previous}
          onNext={next}
          guardTap={guardTap}
        />

        <StoryFooter story={story} onDelete={() => onDelete(story.id)} guardTap={guardTap} />
      </motion.div>
    </motion.div>
  )
}
