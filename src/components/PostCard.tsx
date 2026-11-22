import { useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Bookmark, Heart, MessageCircle, Pencil, Trash2, X } from 'lucide-react'
import { Avatar } from './Avatar'
import { MAX_COMMENT_LENGTH, MAX_POST_CAPTION_LENGTH, type Post } from '@/types'
import {
  addComment,
  editCaption,
  likePost,
  removeComment,
  toggleLike,
  toggleSave,
} from '@/utils/postActions'
import { loadPostImage } from '@/utils/postStorage'
import { timeAgo } from '@/utils/time'
import { cn } from '@/utils/cn'
import type { Profile } from '@/utils/profile'

interface PostCardProps {
  post: Post
  profile: Profile
  onDelete: (id: string) => void
  onUpdate: (post: Post) => void
}

const DOUBLE_TAP_MS = 300

export function PostCard({ post, profile, onDelete, onUpdate }: PostCardProps) {
  const image = useMemo(() => loadPostImage(post.id), [post.id])
  const [showComments, setShowComments] = useState(false)
  const [comment, setComment] = useState('')
  const [heartBurst, setHeartBurst] = useState(0)
  const [editing, setEditing] = useState(false)
  const [captionDraft, setCaptionDraft] = useState('')
  const lastTapRef = useRef(0)
  const commentInputRef = useRef<HTMLInputElement>(null)

  const handleImageTap = () => {
    const now = Date.now()
    if (now - lastTapRef.current < DOUBLE_TAP_MS) {
      lastTapRef.current = 0
      setHeartBurst((n) => n + 1)
      const next = likePost(post)
      if (next !== post) onUpdate(next)
    } else {
      lastTapRef.current = now
    }
  }

  const submitComment = () => {
    const next = addComment(post, comment)
    if (!next) return
    onUpdate(next)
    setComment('')
  }

  const startEditCaption = () => {
    setCaptionDraft(post.caption)
    setEditing(true)
  }

  const saveCaption = () => {
    const next = editCaption(post, captionDraft)
    if (next !== post) onUpdate(next)
    setEditing(false)
  }

  const openComments = () => {
    setShowComments(true)
    window.setTimeout(() => commentInputRef.current?.focus(), 0)
  }

  const actionClass =
    'rounded-full p-1.5 transition hover:bg-white/10 active:scale-90 focus-visible:outline-2 focus-visible:outline-ig-pink'

  return (
    <article aria-label={`Post by ${profile.username}`} className="border-b border-neutral-900 pb-4">
      <header className="flex items-center gap-3 px-3 py-3">
        <Avatar name={profile.name} src={profile.avatar} size={32} />
        <div className="flex min-w-0 flex-1 items-baseline gap-2">
          <span className="truncate text-sm font-semibold">{profile.username}</span>
          <span className="shrink-0 text-sm text-neutral-500">{timeAgo(post.createdAt)}</span>
        </div>
        <button
          type="button"
          aria-label="Edit caption"
          onClick={startEditCaption}
          disabled={editing}
          className="rounded-full p-1.5 text-neutral-400 transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-ig-pink disabled:opacity-40"
        >
          <Pencil className="size-5" aria-hidden />
        </button>
        <button
          type="button"
          aria-label="Delete post"
          onClick={() => onDelete(post.id)}
          className="rounded-full p-1.5 text-neutral-400 transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-ig-pink"
        >
          <Trash2 className="size-5" aria-hidden />
        </button>
      </header>

      <div className="relative select-none" onClick={handleImageTap}>
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
        <AnimatePresence>
          {heartBurst > 0 && (
            <motion.span
              key={heartBurst}
              aria-hidden
              className="pointer-events-none absolute inset-0 flex items-center justify-center text-white drop-shadow-lg"
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: [0.4, 1.2, 1], opacity: [0, 1, 1] }}
              exit={{ opacity: 0, scale: 1.3 }}
              transition={{ duration: 0.45 }}
              onAnimationComplete={() => setHeartBurst(0)}
            >
              <Heart className="size-24 fill-white" />
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center px-2 pt-2">
        <button
          type="button"
          aria-label={post.liked ? 'Unlike' : 'Like'}
          aria-pressed={post.liked}
          onClick={() => onUpdate(toggleLike(post))}
          className={cn(actionClass, post.liked ? 'text-red-500' : 'text-white')}
        >
          <Heart className={cn('size-6', post.liked && 'fill-current')} aria-hidden />
        </button>
        <button type="button" aria-label="Comment" onClick={openComments} className={cn(actionClass, 'text-white')}>
          <MessageCircle className="size-6" aria-hidden />
        </button>
        <button
          type="button"
          aria-label={post.saved ? 'Remove from saved' : 'Save'}
          aria-pressed={post.saved}
          onClick={() => onUpdate(toggleSave(post))}
          className={cn(actionClass, 'ml-auto text-white')}
        >
          <Bookmark className={cn('size-6', post.saved && 'fill-current')} aria-hidden />
        </button>
      </div>

      <div className="px-3 pt-1 text-sm">
        <p className="font-semibold">
          {post.likes} {post.likes === 1 ? 'like' : 'likes'}
        </p>

        {editing ? (
          <form
            className="mt-2"
            onSubmit={(e) => {
              e.preventDefault()
              saveCaption()
            }}
          >
            <label htmlFor={`caption-${post.id}`} className="sr-only">
              Caption
            </label>
            <textarea
              id={`caption-${post.id}`}
              value={captionDraft}
              maxLength={MAX_POST_CAPTION_LENGTH}
              rows={3}
              autoFocus
              placeholder="Write a caption..."
              onChange={(e) => setCaptionDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.stopPropagation()
                  setEditing(false)
                } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault()
                  saveCaption()
                }
              }}
              className="w-full resize-none rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-ig-pink focus:outline-none"
            />
            <div className="mt-1 flex items-center justify-between">
              <span className="text-xs text-neutral-500">
                {MAX_POST_CAPTION_LENGTH - captionDraft.length} left
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="rounded-full px-3 py-1 text-sm text-neutral-300 transition hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-ig-pink px-4 py-1 text-sm font-semibold text-white transition hover:brightness-110 active:scale-95"
                >
                  Save
                </button>
              </div>
            </div>
          </form>
        ) : (
          post.caption && (
            <p className="mt-1 break-words whitespace-pre-wrap">
              <span className="mr-2 font-semibold">{profile.username}</span>
              {post.caption}
            </p>
          )
        )}

        {post.comments.length > 0 && !showComments && (
          <button
            type="button"
            onClick={() => setShowComments(true)}
            className="mt-1 text-neutral-500 transition hover:text-neutral-300"
          >
            View {post.comments.length === 1 ? '1 comment' : `all ${post.comments.length} comments`}
          </button>
        )}

        {showComments && (
          <ul className="mt-2 flex flex-col gap-1.5">
            {post.comments.map((c) => (
              <li key={c.id} className="group flex items-start gap-2">
                <p className="min-w-0 flex-1 break-words whitespace-pre-wrap">
                  <span className="mr-2 font-semibold">{profile.username}</span>
                  {c.text}
                </p>
                <button
                  type="button"
                  aria-label="Delete comment"
                  onClick={() => onUpdate(removeComment(post, c.id))}
                  className="shrink-0 rounded-full p-1 text-neutral-500 transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-ig-pink"
                >
                  <X className="size-4" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}

        {showComments && (
          <form
            className="mt-3 flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              submitComment()
            }}
          >
            <label htmlFor={`comment-${post.id}`} className="sr-only">
              Add a comment
            </label>
            <input
              id={`comment-${post.id}`}
              ref={commentInputRef}
              value={comment}
              maxLength={MAX_COMMENT_LENGTH}
              autoComplete="off"
              placeholder="Add a comment..."
              onChange={(e) => setComment(e.target.value)}
              className="min-w-0 flex-1 bg-transparent py-1 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!comment.trim()}
              className="text-sm font-semibold text-ig-blue transition hover:text-white disabled:opacity-40"
            >
              Post
            </button>
          </form>
        )}
      </div>
    </article>
  )
}
