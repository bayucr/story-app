import { useCallback, useEffect, useRef, useState } from 'react'
import { POSTS_KEY, type Post } from '@/types'
import {
  cleanupOrphanImages,
  createPost,
  deletePost,
  loadPosts,
  savePost,
  updatePost as persistUpdate,
  type PostSaveResult,
} from '@/utils/postStorage'

function loadInitial(): Post[] {
  cleanupOrphanImages()
  return loadPosts()
}

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

  const removePost = useCallback((id: string): PostSaveResult => {
    const result = deletePost(id)
    if (result.ok) setPosts(postsRef.current.filter((p) => p.id !== id))
    return result
  }, [])

  return { posts, addPost, updatePost, removePost }
}
