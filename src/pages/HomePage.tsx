import { ImageIcon } from 'lucide-react'
import { EmptyState } from '@/components/EmptyState'
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
  onUpdatePost: (post: Post) => void
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
  onUpdatePost,
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
          <EmptyState
            icon={ImageIcon}
            title="No posts yet"
            message="Tap Create to share your first post."
          />
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              profile={profile}
              onDelete={onDeletePost}
              onUpdate={onUpdatePost}
            />
          ))
        )}
      </section>
    </main>
  )
}
