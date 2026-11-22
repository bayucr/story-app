import { useEffect, useRef } from 'react'

interface StoryKeyboardHandlers {
  onNext: () => void
  onPrevious: () => void
  onClose: () => void
  onTogglePause: () => void
}

/** Arrow keys navigate, Escape closes, Space toggles pause (unless typing or on a button). */
export function useStoryKeyboard(handlers: StoryKeyboardHandlers): void {
  const ref = useRef(handlers)
  ref.current = handlers

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const typing = target?.tagName === 'TEXTAREA' || target?.tagName === 'INPUT'
      const h = ref.current
      if (e.key === 'ArrowRight') h.onNext()
      else if (e.key === 'ArrowLeft') h.onPrevious()
      else if (e.key === 'Escape') h.onClose()
      else if (e.key === ' ' && !typing && target?.tagName !== 'BUTTON') {
        e.preventDefault()
        h.onTogglePause()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}
