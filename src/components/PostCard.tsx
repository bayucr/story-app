import { useMemo, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Avatar } from './Avatar'
import type { Post } from '@/types'
import { loadPostImage } from '@/utils/postStorage'
import { timeAgo } from '@/utils/time'
import type { Profile } from '@/utils/profile'

interface PostCardProps {
  post: Post
  profile: Profile
  onDelete: (id: string) => void
}

export function PostCard({ post, profile, onDelete }: PostCardProps) {
  const image = useMemo(() => loadPostImage(post.id), [post.id])
  const [confirming, setConfirming] = useState(false)

  return (
    <article aria-label={`Post by ${profile.username}`} className="border-b border-neutral-900 pb-4">
      <header className="flex items-center gap-3 px-3 py-3">
        <Avatar name={profile.name} size={32} />
        <div className="flex min-w-0 flex-1 items-baseline gap-2">
          <span className="truncate text-sm font-semibold">{profile.username}</span>
          <span className="shrink-0 text-sm text-neutral-500">{timeAgo(post.createdAt)}</span>
        </div>
        {confirming ? (
          <div role="alertdialog" aria-label="Delete this post?" className="flex items-center gap-1 text-sm">
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="rounded-full px-3 py-1 text-neutral-300 transition hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="button"
              autoFocus
              onClick={() => onDelete(post.id)}
              className="rounded-full bg-red-600 px-3 py-1 font-medium text-white transition hover:bg-red-500"
            >
              Delete
            </button>
          </div>
        ) : (
          <button
            type="button"
            aria-label="Delete post"
            onClick={() => setConfirming(true)}
            className="rounded-full p-1.5 text-neutral-400 transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-ig-pink"
          >
            <Trash2 className="size-5" aria-hidden />
          </button>
        )}
      </header>

      {image ? (
        <img
          src={image}
          alt={post.caption ? `Post photo: ${post.caption}` : 'Post photo'}
          draggable={false}
          loading="lazy"
          className="max-h-[80dvh] w-full bg-neutral-900 object-contain"
        />
      ) : (
        <div className="flex aspect-square w-full items-center justify-center bg-neutral-900 text-sm text-neutral-500">
          Image unavailable
        </div>
      )}

      {post.caption && (
        <p className="px-3 pt-3 text-sm break-words whitespace-pre-wrap">
          <span className="mr-2 font-semibold">{profile.username}</span>
          {post.caption}
        </p>
      )}
    </article>
  )
}
