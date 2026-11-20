import { MAX_CAPTION_LENGTH, STORY_TTL_MS, type Story } from '@/types'

export function createStory(image: string, caption?: string, now: number = Date.now()): Story {
  const trimmed = caption?.trim().slice(0, MAX_CAPTION_LENGTH)
  return {
    id: typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${now}-${Math.random().toString(36).slice(2, 10)}`,
    image,
    createdAt: now,
    expiresAt: now + STORY_TTL_MS,
    ...(trimmed ? { caption: trimmed } : {}),
  }
}

export function isExpired(story: Story, now: number = Date.now()): boolean {
  return story.expiresAt <= now
}

export function removeExpired(stories: Story[], now: number = Date.now()): Story[] {
  return stories.filter((s) => !isExpired(s, now))
}

/** Milliseconds until the next story expires, or null when there are none. */
export function msUntilNextExpiry(stories: Story[], now: number = Date.now()): number | null {
  if (stories.length === 0) return null
  return Math.max(0, Math.min(...stories.map((s) => s.expiresAt)) - now)
}
