import { AddStoryButton } from './AddStoryButton'
import { StoryItem } from './StoryItem'
import type { Story } from '@/types'

interface StoryBarProps {
  stories: Story[]
  viewedIds: Set<string>
  loading: boolean
  onAdd: (file: File) => void
  onOpen: (index: number) => void
}

export function StoryBar({ stories, viewedIds, loading, onAdd, onOpen }: StoryBarProps) {
  return (
    <nav
      aria-label="Stories"
      className="border-b border-neutral-800 bg-neutral-950/80 backdrop-blur"
    >
      <div className="safe-top mx-auto max-w-3xl">
        <ul className="no-scrollbar flex gap-3 overflow-x-auto px-4 py-4">
          <li className="shrink-0">
            <AddStoryButton onSelect={onAdd} loading={loading} />
          </li>
          {stories.map((story, index) => (
            <li key={story.id} className="shrink-0">
              <StoryItem
                story={story}
                viewed={viewedIds.has(story.id)}
                onOpen={() => onOpen(index)}
              />
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
