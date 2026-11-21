import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import type { DeletedStory, RemoveStoryResult } from '@/hooks/useStories'
import type { SaveResult } from '@/utils/storage'
import { fileToStoryImage, getImageErrorMessage } from '@/utils/image'

interface StoryActionsDeps {
  addStory: (image: string, caption?: string) => SaveResult
  removeStory: (id: string) => RemoveStoryResult
  restoreStory: (deleted: DeletedStory) => SaveResult
}

const UNDO_DURATION_MS = 6000

/** Story creation flow (pick image, draft, publish) and story deletion, with user feedback. */
export function useStoryActions({ addStory, removeStory, restoreStory }: StoryActionsDeps) {
  const [uploading, setUploading] = useState(false)
  const [draft, setDraft] = useState<string | null>(null)

  /** Processes the chosen file and opens the compose dialog. */
  const startUpload = async (file: File) => {
    setUploading(true)
    try {
      setDraft(await fileToStoryImage(file))
    } catch (err) {
      toast.error(getImageErrorMessage(err))
    } finally {
      setUploading(false)
    }
  }

  const publish = (caption: string) => {
    if (!draft) return
    const result = addStory(draft, caption)
    if (result.ok) {
      setDraft(null)
      toast.success('Story posted. It will disappear in 24 hours.')
    } else if (result.reason === 'quota') {
      toast.error('Storage is full. Wait for older stories to expire and try again.')
    } else {
      toast.error('Could not save the story. Local storage is unavailable.')
    }
  }

  // Stable: used in the child's effect dependencies (keyboard listener).
  const cancelDraft = useCallback(() => setDraft(null), [])

  const deleteStory = (id: string) => {
    const result = removeStory(id)
    if (result.ok) {
      const deleted = result.deleted
      toast.success('Story deleted.', {
        duration: UNDO_DURATION_MS,
        action: deleted
          ? {
              label: 'Undo',
              onClick: () => {
                const restored = restoreStory(deleted)
                if (restored.ok) toast.success('Story restored.')
                else toast.error('Could not restore the story.')
              },
            }
          : undefined,
      })
    } else {
      toast.error('Could not delete the story. Local storage is unavailable.')
    }
  }

  return { uploading, draft, startUpload, publish, cancelDraft, deleteStory }
}
