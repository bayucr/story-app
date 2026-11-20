import { useRef } from 'react'
import { Loader2, Plus } from 'lucide-react'
import { cn } from '@/utils/cn'

interface AddStoryButtonProps {
  onSelect: (file: File) => void
  loading?: boolean
}

export function AddStoryButton({ onSelect, loading = false }: AddStoryButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="flex w-[76px] shrink-0 flex-col items-center gap-1.5">
      <button
        type="button"
        aria-label="Add story"
        disabled={loading}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'relative flex size-[68px] items-center justify-center rounded-full',
          'border-2 border-dashed border-neutral-600 bg-neutral-900 text-neutral-200',
          'transition hover:border-neutral-400 hover:bg-neutral-800 active:scale-95',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ig-pink',
          'disabled:cursor-not-allowed disabled:opacity-60',
        )}
      >
        {loading ? (
          <Loader2 className="size-7 animate-spin" aria-hidden />
        ) : (
          <Plus className="size-7" strokeWidth={2.25} aria-hidden />
        )}
      </button>
      <span className="text-xs text-neutral-400">Add story</span>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          e.target.value = ''
          if (file) onSelect(file)
        }}
      />
    </div>
  )
}
