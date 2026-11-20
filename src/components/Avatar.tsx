import { cn } from '@/utils/cn'

interface AvatarProps {
  name: string
  size?: number
  className?: string
}

/** Initial-based avatar with a gradient background. Image upload comes later. */
export function Avatar({ name, size = 40, className }: AvatarProps) {
  const initial = (name.trim()[0] ?? '?').toUpperCase()
  return (
    <span
      aria-hidden
      style={{ width: size, height: size, fontSize: Math.round(size * 0.42) }}
      className={cn(
        'story-ring inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white select-none',
        className,
      )}
    >
      {initial}
    </span>
  )
}
