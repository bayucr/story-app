import { beforeEach, describe, expect, it, vi } from 'vitest'
import { STORAGE_KEY, type Story } from '@/types'
import { loadStories, saveStories } from './storage'

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

  it('reports other storage failures as unavailable', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    expect(saveStories([story])).toEqual({ ok: false, reason: 'unavailable' })
  })
})
