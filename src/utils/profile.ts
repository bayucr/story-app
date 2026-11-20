export const PROFILE_KEY = 'profile'
export const MAX_USERNAME_LENGTH = 30
export const MAX_NAME_LENGTH = 40
export const MAX_BIO_LENGTH = 150

export interface Profile {
  username: string
  name: string
  bio: string
}

export const DEFAULT_PROFILE: Profile = {
  username: 'you',
  name: 'Your Name',
  bio: '',
}

/** Lowercase letters, digits, dot and underscore only; trimmed to the max length. */
export function sanitizeUsername(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9._]/g, '')
    .slice(0, MAX_USERNAME_LENGTH)
}

/** Normalizes user input. Empty username or name fall back to the defaults. */
export function normalizeProfile(input: Partial<Profile>): Profile {
  const username = sanitizeUsername(input.username ?? '')
  const name = (input.name ?? '').trim().slice(0, MAX_NAME_LENGTH)
  const bio = (input.bio ?? '').trim().slice(0, MAX_BIO_LENGTH)
  return {
    username: username || DEFAULT_PROFILE.username,
    name: name || DEFAULT_PROFILE.name,
    bio,
  }
}

/** Reads the profile from localStorage. Invalid data falls back to the default profile. */
export function loadProfile(): Profile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    if (!raw) return DEFAULT_PROFILE
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      localStorage.removeItem(PROFILE_KEY)
      return DEFAULT_PROFILE
    }
    const v = parsed as Record<string, unknown>
    return normalizeProfile({
      username: typeof v.username === 'string' ? v.username : undefined,
      name: typeof v.name === 'string' ? v.name : undefined,
      bio: typeof v.bio === 'string' ? v.bio : undefined,
    })
  } catch {
    try {
      localStorage.removeItem(PROFILE_KEY)
    } catch {
      /* storage unavailable */
    }
    return DEFAULT_PROFILE
  }
}

/** Persists the profile. Returns false when storage is unavailable or full. */
export function saveProfile(profile: Profile): boolean {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
    return true
  } catch {
    return false
  }
}
