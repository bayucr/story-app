import { useEffect } from 'react'

/** Prevents the page behind a full-screen overlay from scrolling while mounted. */
export function useLockBodyScroll(): void {
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])
}
