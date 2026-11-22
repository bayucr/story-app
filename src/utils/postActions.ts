import { MAX_COMMENT_LENGTH, MAX_POST_CAPTION_LENGTH, type Comment, type Post } from '@/types'

/** Toggles like. Likes never go below zero. */
export function toggleLike(post: Post): Post {
  return post.liked
    ? { ...post, liked: false, likes: Math.max(0, post.likes - 1) }
    : { ...post, liked: true, likes: post.likes + 1 }
}

/** Likes only (never unlikes). Used by double-tap. */
export function likePost(post: Post): Post {
  return post.liked ? post : toggleLike(post)
}

export function toggleSave(post: Post): Post {
  return { ...post, saved: !post.saved }
}

/** Adds a trimmed comment. Returns null for blank text. */
export function addComment(post: Post, text: string, now: number = Date.now()): Post | null {
  const trimmed = text.trim().slice(0, MAX_COMMENT_LENGTH)
  if (!trimmed) return null
  const comment: Comment = {
    id:
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${now}-${Math.random().toString(36).slice(2, 10)}`,
    text: trimmed,
    createdAt: now,
  }
  return { ...post, comments: [...post.comments, comment] }
}

export function removeComment(post: Post, commentId: string): Post {
  return { ...post, comments: post.comments.filter((c) => c.id !== commentId) }
}

/** Replaces the caption (trimmed, truncated). Returns the same post when nothing changed. */
export function editCaption(post: Post, caption: string): Post {
  const next = caption.trim().slice(0, MAX_POST_CAPTION_LENGTH)
  return next === post.caption ? post : { ...post, caption: next }
}
