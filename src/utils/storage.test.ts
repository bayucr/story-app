import { beforeEach, describe, expect, it, vi } from 'vitest'
import { STORAGE_KEY, type Story } from '@/types'
import { loadStories, restoreStory, saveStories } from './storage'

const story: Story = {
  id: 'a',
  image: 'data:image/jpeg;base64,AAAA',
  createdAt: 1,
  expiresAt: 2,
}

beforeEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

describe('storage', () => {
  it('returns an empty list when nothing is stored', () => {
    expect(loadStories()).toEqual([])
  })

  it('round-trips stories', () => {
    expect(saveStories([story])).toEqual({ ok: true })
    expect(loadStories()).toEqual([story])
  })

  it('discards corrupted JSON safely', () => {
    localStorage.setItem(STORAGE_KEY, '{not json')
    expect(loadStories()).toEqual([])
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('discards data that is not an array', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ foo: 1 }))
    expect(loadStories()).toEqual([])
  })

  it('filters out invalid entries but keeps valid ones', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([story, { id: 'bad' }, { ...story, id: 'b', image: 'http://x/y.png' }]),
    )
    expect(loadStories()).toEqual([story])
  })

  it('reports quota errors instead of throwing', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('full', 'QuotaExceededError')
    })
    expect(saveStories([story])).toEqual({ ok: false, reason: 'quota' })
  })

  it('restores a deleted story at its old position', () => {
    const far = 10_000_000_000_000
    const a = { ...story, id: 'a', expiresAt: far }
    const b = { ...story, id: 'b', expiresAt: far }
    const c = { ...story, id: 'c', expiresAt: far }
    saveStories([a, c])
    const { result, stories } = restoreStory(b, 1)
    expect(result).toEqual({ ok: true })
    expect(stories.map((s) => s.id)).toEqual(['a', 'b', 'c'])
    expect(loadStories().map((s) => s.id)).toEqual(['a', 'b', 'c'])
  })

  it('does not restore an expired story', () => {
    saveStories([])
    const { result, stories } = restoreStory({ ...story, expiresAt: 5 }, 0, 10)
    expect(result.ok).toBe(false)
    expect(stories).toEqual([])
    expect(loadStories()).toEqual([])
  })

  it('does not duplicate a story that already exists when restoring', () => {
    const far = 10_000_000_000_000
    const a = { ...story, id: 'a', expiresAt: far }
    saveStories([a])
    const { stories } = restoreStory(a, 0)
    expect(stories).toHaveLength(1)
  })

  it('reports other storage failures as unavailable', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    expect(saveStories([story])).toEqual({ ok: false, reason: 'unavailable' })
  })
})
