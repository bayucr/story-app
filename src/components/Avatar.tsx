import { cn } from '@/utils/cn'

interface AvatarProps {
  name: string
  src?: string
  size?: number
  className?: string
}

/** Profile photo when available, otherwise an initial on a gradient background. */
export function Avatar({ name, src, size = 40, className }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt=""
        aria-hidden
        draggable={false}
        style={{ width: size, height: size }}
        className={cn('inline-block shrink-0 rounded-full bg-neutral-800 object-cover select-none', className)}
      />
    )
  }

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
