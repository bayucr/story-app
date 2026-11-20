import { useRef } from 'react'
import { Loader2, Plus } from 'lucide-react'
import { Avatar } from './Avatar'
import { cn } from '@/utils/cn'

interface AddStoryButtonProps {
  name: string
  onSelect: (file: File) => void
  loading?: boolean
}

export function AddStoryButton({ name, onSelect, loading = false }: AddStoryButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="flex w-[76px] shrink-0 flex-col items-center gap-1.5">
      <button
        type="button"
        aria-label="Add story"
        disabled={loading}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'relative flex size-[72px] items-center justify-center rounded-full p-[3px]',
          'transition active:scale-95',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ig-pink',
          'disabled:cursor-not-allowed disabled:opacity-60',
        )}
      >
        <Avatar name={name} size={66} className="bg-neutral-800 [background:var(--color-neutral-800)]" />
        <span
          className={cn(
            'absolute right-0 bottom-0 flex size-6 items-center justify-center rounded-full',
            'border-2 border-neutral-950 bg-ig-blue text-white',
          )}
        >
          {loading ? (
            <Loader2 className="size-3.5 animate-spin" aria-hidden />
          ) : (
            <Plus className="size-3.5" strokeWidth={3} aria-hidden />
          )}
        </span>
      </button>
      <span className="text-xs text-neutral-300">Your story</span>
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
