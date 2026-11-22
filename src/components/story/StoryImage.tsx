import { AnimatePresence, motion } from 'motion/react'
import type { Story } from '@/types'

interface StoryImageProps {
  story: Story
}

/** Story photo with a blurred backdrop that fills the space around non-9:16 images. */
export function StoryImage({ story }: StoryImageProps) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.div
        key={story.id}
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <img
          src={story.image}
          alt=""
          aria-hidden
          draggable={false}
          className="absolute inset-0 size-full scale-125 object-cover blur-2xl brightness-50"
        />
        <img
          src={story.image}
          alt={story.caption ? `Story photo: ${story.caption}` : 'Story photo'}
          draggable={false}
          className="relative size-full object-contain"
        />
      </motion.div>
    </AnimatePresence>
  )
}
