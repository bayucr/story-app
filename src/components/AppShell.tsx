import { useRef, type ReactNode } from 'react'
import { Home, PlusSquare, User } from 'lucide-react'
import { Avatar } from './Avatar'
import type { Route } from '@/hooks/useHashRoute'
import type { Profile } from '@/utils/profile'
import { cn } from '@/utils/cn'

interface AppShellProps {
  route: Route
  onNavigate: (to: Route) => void
  profile: Profile
  onCreate: (file: File) => void
  creating?: boolean
  children: ReactNode
}

const ITEMS: { to: Route; label: string; icon: typeof Home }[] = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/profile', label: 'Profile', icon: User },
]

export function AppShell({ route, onNavigate, profile, onCreate, creating = false, children }: AppShellProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const openPicker = () => inputRef.current?.click()

  return (
    <div className="min-h-full bg-neutral-950 md:pl-60">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          e.target.value = ''
          if (file) onCreate(file)
        }}
      />

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-neutral-800 bg-neutral-950 px-3 py-6 md:flex">
        <p className="story-ring mb-8 bg-clip-text px-3 text-2xl font-bold tracking-tight text-transparent">
          Stories
        </p>
        <nav aria-label="Main" className="flex flex-col gap-1">
          {ITEMS.map(({ to, label, icon: Icon }) => {
            const active = route === to
            return (
              <button
                key={to}
                type="button"
                aria-current={active ? 'page' : undefined}
                onClick={() => onNavigate(to)}
                className={cn(
                  'flex items-center gap-4 rounded-lg px-3 py-3 text-left text-base transition hover:bg-white/10',
                  'focus-visible:outline-2 focus-visible:outline-ig-pink',
                  active ? 'font-semibold text-white' : 'text-neutral-300',
                )}
              >
                {to === '/profile' ? (
                  <Avatar name={profile.name} size={26} />
                ) : (
                  <Icon className="size-6" strokeWidth={active ? 2.5 : 2} aria-hidden />
                )}
                {label}
              </button>
            )
          })}
          <button
            type="button"
            disabled={creating}
            onClick={openPicker}
            className="flex items-center gap-4 rounded-lg px-3 py-3 text-left text-base text-neutral-300 transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-ig-pink disabled:opacity-60"
          >
            <PlusSquare className="size-6" aria-hidden />
            Create
          </button>
        </nav>
      </aside>

      {/* Mobile header */}
      <header className="safe-top sticky top-0 z-30 border-b border-neutral-800 bg-neutral-950/90 backdrop-blur md:hidden">
        <p className="story-ring bg-clip-text px-4 py-3 text-xl font-bold tracking-tight text-transparent">
          Stories
        </p>
      </header>

      <div className="pb-16 md:pb-0">{children}</div>

      {/* Mobile bottom navigation */}
      <nav
        aria-label="Main"
        className="safe-bottom fixed inset-x-0 bottom-0 z-30 flex border-t border-neutral-800 bg-neutral-950/95 backdrop-blur md:hidden"
      >
        {ITEMS.map(({ to, label, icon: Icon }) => {
          const active = route === to
          return (
            <button
              key={to}
              type="button"
              aria-label={label}
              aria-current={active ? 'page' : undefined}
              onClick={() => onNavigate(to)}
              className={cn(
                'flex flex-1 items-center justify-center py-3 transition',
                'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ig-pink',
                active ? 'text-white' : 'text-neutral-500',
              )}
            >
              {to === '/profile' ? (
                <Avatar name={profile.name} size={26} />
              ) : (
                <Icon className="size-6" strokeWidth={active ? 2.5 : 2} aria-hidden />
              )}
            </button>
          )
        })}
        <button
          type="button"
          aria-label="Create post"
          disabled={creating}
          onClick={openPicker}
          className="order-1 flex flex-1 items-center justify-center py-3 text-neutral-500 transition focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ig-pink disabled:opacity-60"
        >
          <PlusSquare className="size-6" aria-hidden />
        </button>
      </nav>
    </div>
  )
}
