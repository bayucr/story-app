import { beforeEach, describe, expect, it } from 'vitest'
import {
  DEFAULT_PROFILE,
  MAX_AVATAR_LENGTH,
  MAX_BIO_LENGTH,
  sanitizeAvatar,
  MAX_USERNAME_LENGTH,
  PROFILE_KEY,
  loadProfile,
  normalizeProfile,
  sanitizeUsername,
  saveProfile,
} from './profile'

beforeEach(() => {
  localStorage.clear()
})

describe('profile', () => {
  it('sanitizes usernames', () => {
    expect(sanitizeUsername('John Doe!_01.x')).toBe('johndoe_01.x')
    expect(sanitizeUsername('a'.repeat(100)).length).toBe(MAX_USERNAME_LENGTH)
  })

  it('falls back to defaults for empty username and name', () => {
    const p = normalizeProfile({ username: '!!!', name: '   ', bio: '  hi  ' })
    expect(p.username).toBe(DEFAULT_PROFILE.username)
    expect(p.name).toBe(DEFAULT_PROFILE.name)
    expect(p.bio).toBe('hi')
  })

  it('truncates a long bio', () => {
    expect(normalizeProfile({ bio: 'a'.repeat(500) }).bio.length).toBe(MAX_BIO_LENGTH)
  })

  it('accepts only reasonably sized image data URLs as avatar', () => {
    const ok = 'data:image/jpeg;base64,AAAA'
    expect(sanitizeAvatar(ok)).toBe(ok)
    expect(sanitizeAvatar('http://x/y.png')).toBeUndefined()
    expect(sanitizeAvatar(123)).toBeUndefined()
    expect(sanitizeAvatar('data:image/jpeg;base64,' + 'A'.repeat(MAX_AVATAR_LENGTH))).toBeUndefined()
  })

  it('keeps a valid avatar and drops an invalid one', () => {
    const ok = 'data:image/jpeg;base64,AAAA'
    expect(normalizeProfile({ avatar: ok }).avatar).toBe(ok)
    expect(normalizeProfile({ avatar: 'nope' })).not.toHaveProperty('avatar')
  })

  it('round-trips a profile with an avatar', () => {
    const p = { username: 'bayu', name: 'Bayu', bio: '', avatar: 'data:image/jpeg;base64,AAAA' }
    expect(saveProfile(p)).toBe(true)
    expect(loadProfile()).toEqual(p)
  })

  it('returns the default profile when nothing is stored', () => {
    expect(loadProfile()).toEqual(DEFAULT_PROFILE)
  })

  it('round-trips a profile', () => {
    const p = { username: 'bayu', name: 'Bayu', bio: 'hello' }
    expect(saveProfile(p)).toBe(true)
    expect(loadProfile()).toEqual(p)
  })

  it('discards corrupted data safely', () => {
    localStorage.setItem(PROFILE_KEY, '{oops')
    expect(loadProfile()).toEqual(DEFAULT_PROFILE)
    expect(localStorage.getItem(PROFILE_KEY)).toBeNull()
  })

  it('discards data that is not an object', () => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify([1, 2]))
    expect(loadProfile()).toEqual(DEFAULT_PROFILE)
  })
})
