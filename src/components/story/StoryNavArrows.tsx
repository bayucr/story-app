import { ChevronLeft, ChevronRight } from 'lucide-react'

interface StoryNavArrowsProps {
  isFirst: boolean
  isLast: boolean
  onPrevious: () => void
  onNext: () => void
  /** Marks the pointer gesture as started on a control so the viewer's tap handler ignores it. */
  guardTap: (e: { stopPropagation: () => void }) => void
}

const arrowClass =
  'absolute top-1/2 hidden -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white sm:block'

/** Visible previous/next buttons for desktop. Touch users swipe or tap. */
export function StoryNavArrows({ isFirst, isLast, onPrevious, onNext, guardTap }: StoryNavArrowsProps) {
  return (
    <>
      {!isFirst && (
        <button
          type="button"
          aria-label="Previous story"
          onPointerDown={guardTap}
          onClick={onPrevious}
          className={`${arrowClass} left-2`}
        >
          <ChevronLeft className="size-6" aria-hidden />
        </button>
      )}
      <button
        type="button"
        aria-label={isLast ? 'Close story viewer' : 'Next story'}
        onPointerDown={guardTap}
        onClick={onNext}
        className={`${arrowClass} right-2`}
      >
        <ChevronRight className="size-6" aria-hidden />
      </button>
    </>
  )
}
