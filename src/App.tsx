import { useCallback, useState } from 'react'
import { AnimatePresence } from 'motion/react'
import { Toaster, toast } from 'sonner'
import { StoryBar } from '@/components/StoryBar'
import { StoryViewer } from '@/components/StoryViewer'
import { useStories } from '@/hooks/useStories'
import { fileToStoryImage, ImageError } from '@/utils/image'

export default function App() {
  const { stories, addStory } = useStories()
  const [viewedIds, setViewedIds] = useState<Set<string>>(() => new Set())
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleAdd = useCallback(
    async (file: File) => {
      setUploading(true)
      try {
        const image = await fileToStoryImage(file)
        const result = addStory(image)
        if (result.ok) {
          toast.success('Story posted. It will disappear in 24 hours.')
        } else if (result.reason === 'quota') {
          toast.error('Storage is full. Wait for older stories to expire and try again.')
        } else {
          toast.error('Could not save the story. Local storage is unavailable.')
        }
      } catch (err) {
        toast.error(err instanceof ImageError ? err.message : 'Something went wrong. Please try again.')
      } finally {
        setUploading(false)
      }
    },
    [addStory],
  )

  const handleView = useCallback((id: string) => {
    setViewedIds((prev) => (prev.has(id) ? prev : new Set(prev).add(id)))
  }, [])

  const handleClose = useCallback(() => setOpenIndex(null), [])

  return (
    <div className="min-h-full bg-neutral-950">
      <StoryBar
        stories={stories}
        viewedIds={viewedIds}
        loading={uploading}
        onAdd={handleAdd}
        onOpen={setOpenIndex}
      />

      <main className="mx-auto flex max-w-3xl flex-col items-center px-6 py-16 text-center">
        {stories.length === 0 ? (
          <>
            <h1 className="text-xl font-semibold">No stories yet</h1>
            <p className="mt-2 max-w-sm text-sm text-neutral-400">
              Tap the + button to share a photo. Stories disappear automatically after 24 hours.
            </p>
          </>
        ) : (
          <p className="text-sm text-neutral-400">
            {stories.length} active {stories.length === 1 ? 'story' : 'stories'}. Tap one to view, swipe to browse.
          </p>
        )}
      </main>

      <AnimatePresence>
        {openIndex !== null && stories.length > 0 && (
          <StoryViewer
            stories={stories}
            startIndex={openIndex}
            onClose={handleClose}
            onView={handleView}
          />
        )}
      </AnimatePresence>

      <Toaster theme="dark" position="top-center" richColors closeButton />
    </div>
  )
}
