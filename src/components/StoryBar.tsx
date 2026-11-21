import { AddStoryButton } from './AddStoryButton'
import { StoryItem } from './StoryItem'
import type { Story } from '@/types'
import type { Profile } from '@/utils/profile'

interface StoryBarProps {
  stories: Story[]
  profile: Profile
  viewedIds: Set<string>
  loading: boolean
  onAdd: (file: File) => void
  onOpen: (index: number) => void
}

export function StoryBar({ stories, profile, viewedIds, loading, onAdd, onOpen }: StoryBarProps) {
  return (
    <nav aria-label="Stories" className="border-b border-neutral-900">
      <ul className="no-scrollbar flex gap-2 overflow-x-auto px-3 py-3">
        <li className="shrink-0">
          <AddStoryButton name={profile.name} avatar={profile.avatar} onSelect={onAdd} loading={loading} />
        </li>
        {stories.map((story, index) => (
          <li key={story.id} className="shrink-0">
            <StoryItem
              story={story}
              username={profile.username}
              viewed={viewedIds.has(story.id)}
              onOpen={() => onOpen(index)}
            />
          </li>
        ))}
      </ul>
    </nav>
  )
}
