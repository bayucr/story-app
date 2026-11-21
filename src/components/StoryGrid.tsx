import { useEffect, useState } from 'react'
import { cn } from '@/utils/cn'
import { timeAgo, timeLeft } from '@/utils/time'
import type { Story } from '@/types'

interface StoryGridProps {
  stories: Story[]
  viewedIds: Set<string>
  onOpen: (index: number) => void
}

/** Returns the current time, refreshed every 30 seconds so relative labels stay accurate. */
function useNow(intervalMs = 30_000): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs)
    return () => window.clearInterval(id)
  }, [intervalMs])
  return now
}

export function StoryGrid({ stories, viewedIds, onOpen }: StoryGridProps) {
  const now = useNow()
  const nextExpiry = Math.min(...stories.map((s) => s.expiresAt))
  const count = stories.length

  return (
    <section aria-label="Active stories" className="mx-auto w-full max-w-3xl px-4 py-6">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h1 className="text-base font-semibold">
          {count} active {count === 1 ? 'story' : 'stories'}
        </h1>
        <p className="text-xs text-neutral-400">
          {timeLeft(nextExpiry, now) === 'Expiring'
            ? 'Next one expires soon'
            : `Next one disappears in ${timeLeft(nextExpiry, now).replace(' left', '')}`}
        </p>
      </div>

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {stories.map((story, index) => {
          const viewed = viewedIds.has(story.id)
          return (
            <li key={story.id}>
              <button
                type="button"
                onClick={() => onOpen(index)}
                aria-label={`Open story posted ${timeAgo(story.createdAt, now)}, ${timeLeft(story.expiresAt, now)}`}
                className={cn(
                  'group relative block aspect-[9/16] w-full overflow-hidden rounded-xl bg-neutral-900 ring-1 ring-neutral-800 transition',
                  'hover:ring-neutral-500 active:scale-[0.98]',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ig-pink',
                )}
              >
                <img
                  src={story.image}
                  alt=""
                  draggable={false}
                  loading="lazy"
                  className={cn(
                    'size-full object-cover transition group-hover:scale-105',
                    viewed && 'opacity-70',
                  )}
                />
                <span className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-start gap-0.5 bg-gradient-to-t from-black/80 to-transparent p-2.5 pt-8 text-left">
                  {story.caption && (
                    <span className="line-clamp-2 text-xs leading-snug text-white">{story.caption}</span>
                  )}
                  <span className="text-[11px] text-white/80">{timeAgo(story.createdAt, now)}</span>
                  <span className="text-[11px] font-medium text-ig-yellow">
                    {timeLeft(story.expiresAt, now)}
                  </span>
                </span>
                {!viewed && (
                  <span className="absolute top-2 right-2 rounded-full bg-ig-pink px-2 py-0.5 text-[10px] font-semibold text-white">
                    New
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
