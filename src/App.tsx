import { useCallback, useState } from 'react'
import { AnimatePresence, MotionConfig } from 'motion/react'
import { Toaster, toast } from 'sonner'
import { ComposeDialog } from '@/components/ComposeDialog'
import { StoryBar } from '@/components/StoryBar'
import { StoryGrid } from '@/components/StoryGrid'
import { StoryViewer } from '@/components/StoryViewer'
import { useStories } from '@/hooks/useStories'
import { useViewedStories } from '@/hooks/useViewedStories'
import { fileToStoryImage, ImageError } from '@/utils/image'

export default function App() {
  const { stories, addStory, removeStory } = useStories()
  const { viewedIds, markViewed } = useViewedStories(stories)
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [uploading, setUploading] = useState(false)
  const [draft, setDraft] = useState<string | null>(null)

  const handleAdd = useCallback(
    async (file: File) => {
      setUploading(true)
      try {
        const image = await fileToStoryImage(file)
        setDraft(image)
      } catch (err) {
        toast.error(err instanceof ImageError ? err.message : 'Something went wrong. Please try again.')
      } finally {
        setUploading(false)
      }
    },
    [],
  )

  const handlePost = useCallback(
    (caption: string) => {
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
    },
    [addStory, draft],
  )

  const handleCancelDraft = useCallback(() => setDraft(null), [])

  const handleClose = useCallback(() => setOpenIndex(null), [])

  const handleDelete = useCallback(
    (id: string) => {
      const result = removeStory(id)
      if (result.ok) {
        toast.success('Story deleted.')
      } else {
        toast.error('Could not delete the story. Local storage is unavailable.')
      }
    },
    [removeStory],
  )

  return (
    <MotionConfig reducedMotion="user">
    <div className="min-h-full bg-neutral-950">
      <StoryBar
        stories={stories}
        viewedIds={viewedIds}
        loading={uploading}
        onAdd={handleAdd}
        onOpen={setOpenIndex}
      />

      <main>
        {stories.length === 0 ? (
          <div className="mx-auto flex max-w-3xl flex-col items-center px-6 py-16 text-center">
            <h1 className="text-xl font-semibold">No stories yet</h1>
            <p className="mt-2 max-w-sm text-sm text-neutral-400">
              Tap the + button to share a photo. Stories disappear automatically after 24 hours.
            </p>
          </div>
        ) : (
          <StoryGrid stories={stories} viewedIds={viewedIds} onOpen={setOpenIndex} />
        )}
      </main>

      <AnimatePresence>
        {openIndex !== null && stories.length > 0 && (
          <StoryViewer
            stories={stories}
            startIndex={openIndex}
            onClose={handleClose}
            onView={markViewed}
            onDelete={handleDelete}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {draft && (
          <ComposeDialog image={draft} onPost={handlePost} onCancel={handleCancelDraft} />
        )}
      </AnimatePresence>

      <Toaster theme="dark" position="top-center" richColors closeButton />
    </div>
    </MotionConfig>
  )
}
