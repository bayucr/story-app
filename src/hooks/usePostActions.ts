import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import type { Post } from '@/types'
import { fileToPostImage, getImageErrorMessage } from '@/utils/image'
import type { DeletedPost, RemovePostResult } from '@/hooks/usePosts'
import type { PostSaveResult } from '@/utils/postStorage'

interface PostActionsDeps {
  addPost: (image: string, caption: string) => PostSaveResult
  updatePost: (post: Post) => PostSaveResult
  removePost: (id: string) => RemovePostResult
  restorePost: (deleted: DeletedPost) => PostSaveResult
  /** Called after a post is shared successfully (e.g. to navigate to the feed). */
  onShared?: () => void
}

/** Post creation flow (pick image, draft, share), editing and deletion, with user feedback. */
const UNDO_DURATION_MS = 6000

export function usePostActions({
  addPost,
  updatePost,
  removePost,
  restorePost,
  onShared,
}: PostActionsDeps) {
  const [creating, setCreating] = useState(false)
  const [draft, setDraft] = useState<string | null>(null)

  /** Processes the chosen file and opens the compose dialog. */
  const startCreate = async (file: File) => {
    setCreating(true)
    try {
      setDraft(await fileToPostImage(file))
    } catch (err) {
      toast.error(getImageErrorMessage(err))
    } finally {
      setCreating(false)
    }
  }

  const share = (caption: string) => {
    if (!draft) return
    const result = addPost(draft, caption)
    if (result.ok) {
      setDraft(null)
      onShared?.()
      toast.success('Post shared.')
    } else if (result.reason === 'limit') {
      toast.error('You have reached the limit of 30 posts. Delete one to share a new post.')
    } else if (result.reason === 'quota') {
      toast.error('Storage is full. Delete a post or story and try again.')
    } else {
      toast.error('Could not save the post. Local storage is unavailable.')
    }
  }

  // Stable: used in the child's effect dependencies (keyboard listener).
  const cancelDraft = useCallback(() => setDraft(null), [])

  const edit = (post: Post) => {
    const result = updatePost(post)
    if (!result.ok) {
      toast.error(
        result.reason === 'quota'
          ? 'Storage is full. Could not save your change.'
          : 'Could not save your change. Local storage is unavailable.',
      )
    }
  }

  const remove = (id: string) => {
    const result = removePost(id)
    if (result.ok) {
      const deleted = result.deleted
      toast.success('Post deleted.', {
        duration: UNDO_DURATION_MS,
        action: deleted
          ? {
              label: 'Undo',
              onClick: () => {
                const restored = restorePost(deleted)
                if (restored.ok) toast.success('Post restored.')
                else if (restored.reason === 'limit') toast.error('Could not restore: post limit reached.')
                else toast.error('Could not restore the post. Storage may be full.')
              },
            }
          : undefined,
      })
    } else {
      toast.error('Could not delete the post. Local storage is unavailable.')
    }
  }

  return { creating, draft, startCreate, share, cancelDraft, edit, remove }
}
