import { useMemo } from 'react'
import { Bookmark, Camera, Heart, MessageCircle } from 'lucide-react'
import { EmptyState } from './EmptyState'
import type { Post } from '@/types'
import { loadPostImage } from '@/utils/postStorage'

interface PostGridProps {
  posts: Post[]
  variant: 'posts' | 'saved'
  onOpen: (id: string) => void
}

function PostThumb({ post, onOpen }: { post: Post; onOpen: (id: string) => void }) {
  const image = useMemo(() => loadPostImage(post.id), [post.id])

  return (
    <button
      type="button"
      onClick={() => onOpen(post.id)}
      aria-label={`Open post: ${post.likes} likes, ${post.comments.length} comments`}
      className="group relative block aspect-square w-full overflow-hidden bg-neutral-900 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ig-pink"
    >
      {image ? (
        <img
          src={image}
          alt=""
          draggable={false}
          loading="lazy"
          className="size-full animate-[fade-in_0.3s_ease-out] object-cover"
        />
      ) : (
        <span className="flex size-full items-center justify-center text-xs text-neutral-500">
          Unavailable
        </span>
      )}
      <span className="pointer-events-none absolute inset-0 flex items-center justify-center gap-4 bg-black/50 text-sm font-semibold text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
        <span className="flex items-center gap-1">
          <Heart className="size-5 fill-white" aria-hidden />
          {post.likes}
        </span>
        <span className="flex items-center gap-1">
          <MessageCircle className="size-5 fill-white" aria-hidden />
          {post.comments.length}
        </span>
      </span>
    </button>
  )
}

export function PostGrid({ posts, variant, onOpen }: PostGridProps) {
  if (posts.length === 0) {
    return variant === 'saved' ? (
      <EmptyState
        icon={Bookmark}
        title="No saved posts"
        message="Tap the bookmark on a post to save it here."
      />
    ) : (
      <EmptyState icon={Camera} title="No posts yet" message="Use Create to share your first post." />
    )
  }

  return (
    <ul className="grid grid-cols-3 gap-0.5">
      {posts.map((post) => (
        <li key={post.id}>
          <PostThumb post={post} onOpen={onOpen} />
        </li>
      ))}
    </ul>
  )
}
