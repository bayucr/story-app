import { Trash2 } from 'lucide-react'
import type { Story } from '@/types'

interface StoryFooterProps {
  story: Story
  onDelete: () => void
  /** Marks the pointer gesture as started on a control so the viewer's tap handler ignores it. */
  guardTap: (e: { stopPropagation: () => void }) => void
}

/** Caption over the image and the delete button at the bottom. */
export function StoryFooter({ story, onDelete, guardTap }: StoryFooterProps) {
  return (
    <>
      {story.caption && (
        <div className="pointer-events-none absolute inset-x-0 bottom-16 px-4 pr-16">
          <p className="inline-block max-w-full rounded-xl bg-black/55 px-3 py-2 text-sm leading-snug break-words whitespace-pre-wrap text-white backdrop-blur-sm">
            {story.caption}
          </p>
        </div>
      )}

      <div className="safe-bottom pointer-events-none absolute inset-x-0 bottom-0 flex justify-end bg-gradient-to-t from-black/60 to-transparent p-4 pt-12">
        <button
          type="button"
          aria-label="Delete story"
          onPointerDown={guardTap}
          onClick={onDelete}
          className="pointer-events-auto rounded-full bg-black/40 p-2.5 text-white backdrop-blur transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white"
        >
          <Trash2 className="size-5" aria-hidden />
        </button>
      </div>
    </>
  )
}
