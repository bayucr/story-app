import { Pause, Play, X } from 'lucide-react'
import { Avatar } from '../Avatar'
import type { Story } from '@/types'
import type { Profile } from '@/utils/profile'
import { expiryLabel, timeAgo } from '@/utils/time'

interface StoryHeaderProps {
  stories: Story[]
  story: Story
  index: number
  progress: number
  profile: Profile
  userPaused: boolean
  onTogglePause: () => void
  onClose: () => void
  /** Marks the pointer gesture as started on a control so the viewer's tap handler ignores it. */
  guardTap: (e: { stopPropagation: () => void }) => void
}

const controlClass =
  'pointer-events-auto rounded-full p-1.5 text-white transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white'

export function StoryHeader({
  stories,
  story,
  index,
  progress,
  profile,
  userPaused,
  onTogglePause,
  onClose,
  guardTap,
}: StoryHeaderProps) {
  return (
    <>
      {/* Top gradient for readability */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/60 to-transparent" />

      <div className="safe-top pointer-events-none absolute inset-x-0 top-0 px-3 pt-3">
        {/* Progress bars */}
        <div className="flex gap-1" aria-hidden>
          {stories.map((s, i) => (
            <div key={s.id} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/30">
              <div
                className="h-full origin-left rounded-full bg-white"
                style={{ transform: `scaleX(${i < index ? 1 : i === index ? progress : 0})` }}
              />
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex min-w-0 items-center gap-2.5 text-white drop-shadow">
            <Avatar name={profile.name} src={profile.avatar} size={32} />
            <div className="flex min-w-0 flex-col leading-tight">
              <div className="flex items-baseline gap-2">
                <span className="truncate text-sm font-semibold">{profile.username}</span>
                <span className="shrink-0 text-sm text-white/70">{timeAgo(story.createdAt)}</span>
              </div>
              <span className="text-xs text-white/70">{expiryLabel(story.expiresAt)}</span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              aria-label={userPaused ? 'Play story' : 'Pause story'}
              aria-pressed={userPaused}
              onPointerDown={guardTap}
              onClick={onTogglePause}
              className={controlClass}
            >
              {userPaused ? <Play className="size-6" aria-hidden /> : <Pause className="size-6" aria-hidden />}
            </button>
            <button
              type="button"
              aria-label="Close story"
              onPointerDown={guardTap}
              onClick={onClose}
              className={controlClass}
            >
              <X className="size-6" aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
