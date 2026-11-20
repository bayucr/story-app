import { cn } from '@/utils/cn'
import type { Story } from '@/types'

interface StoryItemProps {
  story: Story
  viewed: boolean
  onOpen: () => void
}

function timeAgo(createdAt: number, now: number = Date.now()): string {
  const minutes = Math.floor((now - createdAt) / 60_000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  return `${Math.floor(minutes / 60)}h ago`
}

export function StoryItem({ story, viewed, onOpen }: StoryItemProps) {
  const label = timeAgo(story.createdAt)

  return (
    <div className="flex w-[76px] shrink-0 flex-col items-center gap-1.5">
      <button
        type="button"
        aria-label={`View story posted ${label}`}
        onClick={onOpen}
        className={cn(
          'flex size-[72px] items-center justify-center rounded-full p-[3px] transition active:scale-95',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ig-pink',
          viewed ? 'bg-neutral-600' : 'story-ring',
        )}
      >
        <span className="block size-full rounded-full bg-neutral-950 p-[2px]">
          <img
            src={story.image}
            alt=""
            draggable={false}
            className="size-full rounded-full object-cover"
          />
        </span>
      </button>
      <span className="text-xs text-neutral-400">{label}</span>
    </div>
  )
}
