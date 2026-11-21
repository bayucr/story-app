import { useMemo } from 'react'
import { cn } from '@/utils/cn'
import { formatMB, getStorageUsage } from '@/utils/storageUsage'

interface StorageMeterProps {
  /** Data that lives in localStorage; usage is recalculated whenever any of it changes. */
  stories: unknown
  posts: unknown
  profile: unknown
}

const BAR_COLOR = {
  ok: 'bg-ig-blue',
  warning: 'bg-ig-orange',
  critical: 'bg-red-500',
} as const

export function StorageMeter({ stories, posts, profile }: StorageMeterProps) {
  // The props are not read: they only signal that storage contents may have changed.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const usage = useMemo(() => getStorageUsage(), [stories, posts, profile])
  const percent = Math.round(usage.ratio * 100)
  const used = formatMB(usage.usedChars)
  const total = formatMB(usage.quotaChars)

  return (
    <div className="mx-4 mb-4 sm:mx-6">
      <div className="mb-1 flex items-baseline justify-between text-xs text-neutral-400">
        <span id="storage-meter-label">Storage</span>
        <span>
          ~{used} / {total} MB
        </span>
      </div>
      <div
        role="meter"
        aria-labelledby="storage-meter-label"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-valuetext={`About ${used} of ${total} megabytes used`}
        className="h-1.5 overflow-hidden rounded-full bg-neutral-800"
      >
        <div
          className={cn('h-full rounded-full transition-all', BAR_COLOR[usage.level])}
          style={{ width: `${percent}%` }}
        />
      </div>
      {usage.level !== 'ok' && (
        <p className="mt-1 text-xs text-neutral-400">
          {usage.level === 'critical'
            ? 'Storage is almost full. Delete a post or story to free up space.'
            : 'Storage is getting full.'}
        </p>
      )}
    </div>
  )
}
