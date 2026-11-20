import { useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { X } from 'lucide-react'
import { PostCard } from './PostCard'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import type { Post } from '@/types'
import type { Profile } from '@/utils/profile'

interface PostDetailDialogProps {
  post: Post
  profile: Profile
  onClose: () => void
  onDelete: (id: string) => void
  onUpdate: (post: Post) => void
}

export function PostDetailDialog({ post, profile, onClose, onDelete, onUpdate }: PostDetailDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  useFocusTrap(dialogRef)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  return (
    <motion.div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Post"
      className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-black/80 backdrop-blur-sm sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <motion.div
        className="safe-top safe-bottom relative my-auto w-full max-w-[470px] bg-neutral-950 sm:rounded-2xl sm:border sm:border-neutral-800"
        initial={{ scale: 0.95, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
      >
        <div className="flex justify-end px-2 pt-2">
          <button
            type="button"
            aria-label="Close post"
            onClick={onClose}
            className="rounded-full p-1.5 text-neutral-300 transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-ig-pink"
          >
            <X className="size-6" aria-hidden />
          </button>
        </div>
        <PostCard
          post={post}
          profile={profile}
          onDelete={(id) => {
            onDelete(id)
            onClose()
          }}
          onUpdate={onUpdate}
        />
      </motion.div>
    </motion.div>
  )
}
