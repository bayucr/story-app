import { useCallback, useEffect, useRef, useState } from 'react'
import { POSTS_KEY, type Post } from '@/types'
import {
  cleanupOrphanImages,
  createPost,
  deletePost,
  loadPostImage,
  loadPosts,
  restorePost as persistRestore,
  savePost,
  updatePost as persistUpdate,
  type PostSaveResult,
} from '@/utils/postStorage'

function loadInitial(): Post[] {
  cleanupOrphanImages()
  return loadPosts()
}

/** Everything needed to bring a deleted post back (used by undo). */
export interface DeletedPost {
  post: Post
  image: string
  index: number
}

export type RemovePostResult =
  | { ok: true; deleted: DeletedPost | null }
  | { ok: false; reason: 'quota' | 'unavailable' | 'limit' }

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>(loadInitial)
  const postsRef = useRef(posts)
  postsRef.current = posts

  // Keep multiple tabs in sync.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === POSTS_KEY || e.key === null) setPosts(loadPosts())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  /** Adds a post (newest first). Returns the save result so the UI can report problems. */
  const addPost = useCallback((image: string, caption: string): PostSaveResult => {
    const post = createPost(caption)
    const result = savePost(post, image)
    if (result.ok) setPosts([post, ...postsRef.current])
    return result
  }, [])

  /** Replaces a post's metadata (like, save, comments). */
  const updatePost = useCallback((updated: Post): PostSaveResult => {
    const result = persistUpdate(updated)
    if (result.ok) {
      setPosts(postsRef.current.map((p) => (p.id === updated.id ? updated : p)))
    }
    return result
  }, [])

  /** Deletes a post and returns a snapshot so the caller can offer undo. */
  const removePost = useCallback((id: string): RemovePostResult => {
    const index = postsRef.current.findIndex((p) => p.id === id)
    const post = postsRef.current[index]
    // Read the image before it is removed from storage.
    const image = post ? loadPostImage(id) : null
    const result = deletePost(id)
    if (!result.ok) return result
    setPosts(postsRef.current.filter((p) => p.id !== id))
    return { ok: true, deleted: post && image ? { post, image, index } : null }
  }, [])

  /** Puts a deleted post back at its old position (undo). */
  const restorePost = useCallback((deleted: DeletedPost): PostSaveResult => {
    const result = persistRestore(deleted.post, deleted.image, deleted.index)
    if (result.ok) setPosts(loadPosts())
    return result
  }, [])

  return { posts, addPost, updatePost, removePost, restorePost }
}
