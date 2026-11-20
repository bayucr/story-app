import { cn } from '@/utils/cn'
import { timeAgo } from '@/utils/time'
import type { Story } from '@/types'

interface StoryItemProps {
  story: Story
  username: string
  viewed: boolean
  onOpen: () => void
}

export function StoryItem({ story, username, viewed, onOpen }: StoryItemProps) {
  const label = timeAgo(story.createdAt)

  return (
    <div className="flex w-[76px] shrink-0 flex-col items-center gap-1.5">
      <button
        type="button"
        aria-label={`View story by ${username}, posted ${label}`}
        title={label}
        onClick={onOpen}
        className={cn(
          'flex size-[72px] items-center justify-center rounded-full p-[3px] transition active:scale-95',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ig-pink',
          viewed ? 'bg-neutral-700' : 'story-ring',
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
      <span
        className={cn(
          'w-full truncate text-center text-xs',
          viewed ? 'text-neutral-500' : 'text-neutral-200',
        )}
      >
        {username}
      </span>
    </div>
  )
}
