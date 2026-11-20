import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { MAX_CAPTION_LENGTH } from '@/types'
import { cn } from '@/utils/cn'

interface ComposeDialogProps {
  image: string
  onPost: (caption: string) => void
  onCancel: () => void
}

export function ComposeDialog({ image, onPost, onCancel }: ComposeDialogProps) {
  const [caption, setCaption] = useState('')
  const dialogRef = useRef<HTMLDivElement>(null)
  useFocusTrap(dialogRef)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  const remaining = MAX_CAPTION_LENGTH - caption.length

  return (
    <motion.div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="New story"
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 p-0 backdrop-blur-sm sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel()
      }}
    >
      <motion.div
        className="safe-top safe-bottom flex h-full w-full flex-col gap-3 bg-neutral-950 p-4 sm:h-auto sm:max-h-[92dvh] sm:max-w-sm sm:rounded-2xl sm:border sm:border-neutral-800"
        initial={{ scale: 0.95, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
      >
        <h2 className="text-base font-semibold">New story</h2>

        <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-xl bg-neutral-900 sm:flex-none">
          <img
            src={image}
            alt="Story preview"
            draggable={false}
            className="max-h-full w-full object-contain sm:max-h-[55dvh]"
          />
        </div>

        <div>
          <label htmlFor="story-caption" className="sr-only">
            Caption
          </label>
          <textarea
            id="story-caption"
            value={caption}
            maxLength={MAX_CAPTION_LENGTH}
            rows={2}
            autoFocus
            placeholder="Add a caption (optional)"
            onChange={(e) => setCaption(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) onPost(caption)
            }}
            className="w-full resize-none rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-ig-pink focus:outline-none"
          />
          <p
            className={cn(
              'mt-1 text-right text-xs',
              remaining <= 20 ? 'text-ig-orange' : 'text-neutral-500',
            )}
          >
            {remaining} left
          </p>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full px-4 py-2 text-sm font-medium text-neutral-300 transition hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onPost(caption)}
            className="rounded-full bg-ig-pink px-5 py-2 text-sm font-semibold text-white transition hover:brightness-110 active:scale-95"
          >
            Post
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
