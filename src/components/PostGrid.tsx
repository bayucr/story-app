import { useMemo } from 'react'
import { Heart, MessageCircle } from 'lucide-react'
import type { Post } from '@/types'
import { loadPostImage } from '@/utils/postStorage'

interface PostGridProps {
  posts: Post[]
  emptyMessage: string
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
          className="size-full object-cover"
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

export function PostGrid({ posts, emptyMessage, onOpen }: PostGridProps) {
  if (posts.length === 0) {
    return <p className="px-6 py-16 text-center text-sm text-neutral-400">{emptyMessage}</p>
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
