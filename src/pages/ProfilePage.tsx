import { useState } from 'react'
import { toast } from 'sonner'
import { Avatar } from '@/components/Avatar'
import { StoryGrid } from '@/components/StoryGrid'
import {
  MAX_BIO_LENGTH,
  MAX_NAME_LENGTH,
  MAX_USERNAME_LENGTH,
  sanitizeUsername,
  type Profile,
} from '@/utils/profile'
import type { Story } from '@/types'

interface ProfilePageProps {
  profile: Profile
  onSave: (profile: Profile) => boolean
  stories: Story[]
  viewedIds: Set<string>
  onOpenStory: (index: number) => void
}

const inputClass =
  'w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-ig-pink focus:outline-none'

export function ProfilePage({ profile, onSave, stories, viewedIds, onOpenStory }: ProfilePageProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<Profile>(profile)

  const startEdit = () => {
    setDraft(profile)
    setEditing(true)
  }

  const submit = () => {
    if (onSave(draft)) {
      setEditing(false)
      toast.success('Profile updated.')
    } else {
      toast.error('Could not save the profile. Local storage is unavailable.')
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl">
      <header className="flex items-start gap-5 px-4 py-6 sm:gap-10 sm:px-6">
        <Avatar name={profile.name} size={88} className="sm:size-[120px]" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="truncate text-xl font-semibold">{profile.username}</h1>
            {!editing && (
              <button
                type="button"
                onClick={startEdit}
                className="rounded-lg bg-white/10 px-4 py-1.5 text-sm font-semibold transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-ig-pink"
              >
                Edit profile
              </button>
            )}
          </div>

          <p className="mt-3 text-sm">
            <span className="font-semibold">{stories.length}</span>{' '}
            {stories.length === 1 ? 'active story' : 'active stories'}
          </p>

          {!editing && (
            <div className="mt-3 text-sm">
              <p className="font-semibold">{profile.name}</p>
              {profile.bio && <p className="mt-0.5 break-words whitespace-pre-wrap text-neutral-300">{profile.bio}</p>}
            </div>
          )}
        </div>
      </header>

      {editing && (
        <form
          className="mx-4 mb-6 flex flex-col gap-3 rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 sm:mx-6"
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
        >
          <div>
            <label htmlFor="profile-username" className="mb-1 block text-xs text-neutral-400">
              Username
            </label>
            <input
              id="profile-username"
              className={inputClass}
              value={draft.username}
              maxLength={MAX_USERNAME_LENGTH}
              autoComplete="off"
              autoCapitalize="none"
              onChange={(e) => setDraft({ ...draft, username: sanitizeUsername(e.target.value) })}
            />
            <p className="mt-1 text-xs text-neutral-500">Letters, numbers, dot and underscore.</p>
          </div>
          <div>
            <label htmlFor="profile-name" className="mb-1 block text-xs text-neutral-400">
              Name
            </label>
            <input
              id="profile-name"
              className={inputClass}
              value={draft.name}
              maxLength={MAX_NAME_LENGTH}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="profile-bio" className="mb-1 block text-xs text-neutral-400">
              Bio
            </label>
            <textarea
              id="profile-bio"
              rows={3}
              className={`${inputClass} resize-none`}
              value={draft.bio}
              maxLength={MAX_BIO_LENGTH}
              onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
            />
            <p className="mt-1 text-right text-xs text-neutral-500">
              {MAX_BIO_LENGTH - draft.bio.length} left
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-full px-4 py-2 text-sm font-medium text-neutral-300 transition hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-full bg-ig-pink px-5 py-2 text-sm font-semibold text-white transition hover:brightness-110 active:scale-95"
            >
              Save
            </button>
          </div>
        </form>
      )}

      <div className="border-t border-neutral-800">
        {stories.length === 0 ? (
          <p className="px-6 py-16 text-center text-sm text-neutral-400">
            No active stories. Share one from the Home page.
          </p>
        ) : (
          <StoryGrid stories={stories} viewedIds={viewedIds} onOpen={onOpenStory} />
        )}
      </div>
    </main>
  )
}
