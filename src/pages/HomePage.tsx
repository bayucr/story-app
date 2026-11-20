import { ImageIcon } from 'lucide-react'
import { PostCard } from '@/components/PostCard'
import { StoryBar } from '@/components/StoryBar'
import type { Post, Story } from '@/types'
import type { Profile } from '@/utils/profile'

interface HomePageProps {
  stories: Story[]
  posts: Post[]
  profile: Profile
  viewedIds: Set<string>
  uploading: boolean
  onAdd: (file: File) => void
  onOpenStory: (index: number) => void
  onDeletePost: (id: string) => void
}

export function HomePage({
  stories,
  posts,
  profile,
  viewedIds,
  uploading,
  onAdd,
  onOpenStory,
  onDeletePost,
}: HomePageProps) {
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

      <section aria-label="Feed">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-20 text-center">
            <span className="flex size-16 items-center justify-center rounded-full border-2 border-neutral-700 text-neutral-400">
              <ImageIcon className="size-7" aria-hidden />
            </span>
            <h1 className="mt-4 text-lg font-semibold">No posts yet</h1>
            <p className="mt-1 max-w-xs text-sm text-neutral-400">
              Tap Create to share your first post.
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} profile={profile} onDelete={onDeletePost} />
          ))
        )}
      </section>
    </main>
  )
}
