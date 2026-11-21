import { describe, expect, it } from 'vitest'
import { expiryLabel, timeAgo, timeLeft } from './time'

const MIN = 60_000
const HOUR = 60 * MIN

describe('timeLeft', () => {
  it('formats hours and minutes', () => {
    expect(timeLeft(5 * HOUR + 12 * MIN, 0)).toBe('5h 12m left')
  })

  it('omits minutes on a whole hour', () => {
    expect(timeLeft(3 * HOUR, 0)).toBe('3h left')
  })

  it('formats minutes only under an hour', () => {
    expect(timeLeft(8 * MIN, 0)).toBe('8m left')
  })

  it('rounds partial minutes up', () => {
    expect(timeLeft(8 * MIN - 1000, 0)).toBe('8m left')
  })

  it('returns Expiring when already expired, and rounds any remainder up to 1m', () => {
    expect(timeLeft(0, 100)).toBe('Expiring')
    expect(timeLeft(1, 0)).toBe('1m left')
  })
})

describe('expiryLabel', () => {
  it('builds a full sentence', () => {
    expect(expiryLabel(5 * HOUR + 12 * MIN, 0)).toBe('Disappears in 5h 12m')
    expect(expiryLabel(8 * MIN, 0)).toBe('Disappears in 8m')
  })

  it('says Expiring soon when time is up', () => {
    expect(expiryLabel(0, 100)).toBe('Expiring soon')
  })
})

describe('timeAgo', () => {
  it('formats minutes, hours and days', () => {
    expect(timeAgo(0, 10_000)).toBe('Just now')
    expect(timeAgo(0, 12 * MIN)).toBe('12m ago')
    expect(timeAgo(0, 3 * HOUR)).toBe('3h ago')
    expect(timeAgo(0, 48 * HOUR)).toBe('2d ago')
  })
})
