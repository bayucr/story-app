import { describe, expect, it } from 'vitest'
import { MAX_CAPTION_LENGTH, STORY_TTL_MS, type Story } from '@/types'
import { createStory, isExpired, msUntilNextExpiry, removeExpired } from './expiry'
import { fitWithin } from './image'

const make = (expiresAt: number): Story => ({
  id: String(expiresAt),
  image: 'data:image/jpeg;base64,AAAA',
  createdAt: 0,
  expiresAt,
})

describe('expiry', () => {
  it('creates a story that expires after 24 hours', () => {
    const s = createStory('data:image/jpeg;base64,AAAA', undefined, 1000)
    expect(s.createdAt).toBe(1000)
    expect(s.expiresAt).toBe(1000 + STORY_TTL_MS)
    expect(s.id).toBeTruthy()
    expect(s.caption).toBeUndefined()
  })

  it('trims captions and treats blank ones as missing', () => {
    expect(createStory('data:image/jpeg;base64,AAAA', '  hello  ', 1).caption).toBe('hello')
    expect(createStory('data:image/jpeg;base64,AAAA', '   ', 1)).not.toHaveProperty('caption')
  })

  it('truncates captions to the maximum length', () => {
    const s = createStory('data:image/jpeg;base64,AAAA', 'a'.repeat(500), 1)
    expect(s.caption?.length).toBe(MAX_CAPTION_LENGTH)
  })

  it('detects expiry exactly at the boundary', () => {
    const s = make(5000)
    expect(isExpired(s, 4999)).toBe(false)
    expect(isExpired(s, 5000)).toBe(true)
    expect(isExpired(s, 5001)).toBe(true)
  })

  it('removes only expired stories', () => {
    const list = [make(100), make(200), make(300)]
    expect(removeExpired(list, 200).map((s) => s.expiresAt)).toEqual([300])
  })

  it('computes time until next expiry', () => {
    expect(msUntilNextExpiry([])).toBeNull()
    expect(msUntilNextExpiry([make(500), make(300)], 100)).toBe(200)
    expect(msUntilNextExpiry([make(50)], 100)).toBe(0)
  })
})

describe('fitWithin', () => {
  it('does not upscale small images', () => {
    expect(fitWithin(500, 800)).toEqual({ width: 500, height: 800 })
  })

  it('keeps images already at the limit', () => {
    expect(fitWithin(1080, 1920)).toEqual({ width: 1080, height: 1920 })
  })

  it('scales a tall image by height', () => {
    expect(fitWithin(2160, 3840)).toEqual({ width: 1080, height: 1920 })
  })

  it('scales a wide image by width', () => {
    const r = fitWithin(4000, 2000)
    expect(r.width).toBe(1080)
    expect(r.height).toBe(540)
  })

  it('never exceeds the bounds and keeps aspect ratio', () => {
    const r = fitWithin(3000, 6000)
    expect(r.width).toBeLessThanOrEqual(1080)
    expect(r.height).toBeLessThanOrEqual(1920)
    expect(r.width / r.height).toBeCloseTo(0.5, 2)
  })

  it('handles invalid sizes', () => {
    expect(fitWithin(0, 100)).toEqual({ width: 0, height: 0 })
  })
})
