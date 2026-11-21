import {
  MAX_COMMENT_LENGTH,
  MAX_POST_CAPTION_LENGTH,
  MAX_POSTS,
  POSTS_KEY,
  POST_IMAGE_PREFIX,
  type Comment,
  type Post,
} from '@/types'

export type PostSaveResult =
  | { ok: true }
  | { ok: false; reason: 'quota' | 'unavailable' | 'limit' }

function isQuotaError(err: unknown): boolean {
  return (
    err instanceof DOMException &&
    (err.name === 'QuotaExceededError' ||
      err.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      err.code === 22 ||
      err.code === 1014)
  )
}

function isComment(value: unknown): value is Comment {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v.id === 'string' &&
    typeof v.text === 'string' &&
    v.text.length <= MAX_COMMENT_LENGTH &&
    typeof v.createdAt === 'number'
  )
}

function isPost(value: unknown): value is Post {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v.id === 'string' &&
    typeof v.createdAt === 'number' &&
    typeof v.caption === 'string' &&
    v.caption.length <= MAX_POST_CAPTION_LENGTH &&
    typeof v.likes === 'number' &&
    v.likes >= 0 &&
    typeof v.liked === 'boolean' &&
    typeof v.saved === 'boolean' &&
    Array.isArray(v.comments) &&
    v.comments.every(isComment)
  )
}

function imageKey(id: string): string {
  return POST_IMAGE_PREFIX + id
}

/** Reads post metadata (newest first as stored). Corrupted data is discarded safely. */
export function loadPosts(): Post[] {
  try {
    const raw = localStorage.getItem(POSTS_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      localStorage.removeItem(POSTS_KEY)
      return []
    }
    return parsed.filter(isPost)
  } catch {
    try {
      localStorage.removeItem(POSTS_KEY)
    } catch {
      /* storage unavailable */
    }
    return []
  }
}

/** Reads one post image (base64 data URL), or null when it is missing or invalid. */
export function loadPostImage(id: string): string | null {
  try {
    const value = localStorage.getItem(imageKey(id))
    return value && value.startsWith('data:image/') ? value : null
  } catch {
    return null
  }
}

function writePosts(posts: Post[]): PostSaveResult {
  try {
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts))
    return { ok: true }
  } catch (err) {
    return { ok: false, reason: isQuotaError(err) ? 'quota' : 'unavailable' }
  }
}

/**
 * Saves a new post (image first, then metadata). If the metadata write fails,
 * the image is removed again so no orphan is left behind.
 */
export function savePost(post: Post, image: string): PostSaveResult {
  const existing = loadPosts()
  if (existing.length >= MAX_POSTS) return { ok: false, reason: 'limit' }

  try {
    localStorage.setItem(imageKey(post.id), image)
  } catch (err) {
    return { ok: false, reason: isQuotaError(err) ? 'quota' : 'unavailable' }
  }

  const result = writePosts([post, ...existing])
  if (!result.ok) {
    try {
      localStorage.removeItem(imageKey(post.id))
    } catch {
      /* nothing more to do */
    }
  }
  return result
}

/** Replaces the metadata of one existing post (like, save, comments). */
export function updatePost(updated: Post): PostSaveResult {
  const existing = loadPosts()
  if (!existing.some((p) => p.id === updated.id)) return { ok: false, reason: 'unavailable' }
  return writePosts(existing.map((p) => (p.id === updated.id ? updated : p)))
}

/** Deletes a post and its image. */
export function deletePost(id: string): PostSaveResult {
  const result = writePosts(loadPosts().filter((p) => p.id !== id))
  if (result.ok) {
    try {
      localStorage.removeItem(imageKey(id))
    } catch {
      /* image key stays, but it is harmless */
    }
  }
  return result
}

/**
 * Puts a previously deleted post back (image first, then metadata) at its old position.
 * Used by undo. Rolls the image back if the metadata write fails.
 */
export function restorePost(post: Post, image: string, index: number): PostSaveResult {
  const existing = loadPosts()
  if (existing.some((p) => p.id === post.id)) return { ok: true }
  if (existing.length >= MAX_POSTS) return { ok: false, reason: 'limit' }

  try {
    localStorage.setItem(imageKey(post.id), image)
  } catch (err) {
    return { ok: false, reason: isQuotaError(err) ? 'quota' : 'unavailable' }
  }

  const next = [...existing]
  next.splice(Math.min(Math.max(index, 0), next.length), 0, post)
  const result = writePosts(next)
  if (!result.ok) {
    try {
      localStorage.removeItem(imageKey(post.id))
    } catch {
      /* nothing more to do */
    }
  }
  return result
}

/** Removes post images that no longer have metadata (e.g. after an interrupted write). */
export function cleanupOrphanImages(): number {
  try {
    const ids = new Set(loadPosts().map((p) => p.id))
    const orphans: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(POST_IMAGE_PREFIX) && !ids.has(key.slice(POST_IMAGE_PREFIX.length))) {
        orphans.push(key)
      }
    }
    orphans.forEach((key) => localStorage.removeItem(key))
    return orphans.length
  } catch {
    return 0
  }
}

export function createPost(caption: string, now: number = Date.now()): Post {
  return {
    id:
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${now}-${Math.random().toString(36).slice(2, 10)}`,
    createdAt: now,
    caption: caption.trim().slice(0, MAX_POST_CAPTION_LENGTH),
    likes: 0,
    liked: false,
    saved: false,
    comments: [],
  }
}
