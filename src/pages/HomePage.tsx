import { ImageIcon } from 'lucide-react'
import { StoryBar } from '@/components/StoryBar'
import type { Story } from '@/types'
import type { Profile } from '@/utils/profile'

interface HomePageProps {
  stories: Story[]
  profile: Profile
  viewedIds: Set<string>
  uploading: boolean
  onAdd: (file: File) => void
  onOpenStory: (index: number) => void
}

export function HomePage({ stories, profile, viewedIds, uploading, onAdd, onOpenStory }: HomePageProps) {
  return (
    <main className="mx-auto w-full max-w-[470px] md:max-w-xl">
      <StoryBar
        stories={stories}
        profile={profile}
        viewedIds={viewedIds}
        loading={uploading}
        onAdd={onAdd}
        onOpen={onOpenStory}
      />

      {/* Feed placeholder: replaced by post cards in a later stage */}
      <section aria-label="Feed" className="flex flex-col items-center px-6 py-20 text-center">
        <span className="flex size-16 items-center justify-center rounded-full border-2 border-neutral-700 text-neutral-400">
          <ImageIcon className="size-7" aria-hidden />
        </span>
        <h1 className="mt-4 text-lg font-semibold">No posts yet</h1>
        <p className="mt-1 max-w-xs text-sm text-neutral-400">
          Posts will show up here. For now, share a story with the + button above.
        </p>
      </section>
    </main>
  )
}
