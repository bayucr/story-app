import { describe, expect, it } from 'vitest'
import {
  STORAGE_QUOTA_CHARS,
  formatMB,
  getStorageUsage,
  levelFor,
  measureStorageChars,
} from './storageUsage'

function fakeStorage(entries: Record<string, string>): Storage {
  const keys = Object.keys(entries)
  return {
    get length() {
      return keys.length
    },
    key: (i: number) => keys[i] ?? null,
    getItem: (k: string) => entries[k] ?? null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
  } as Storage
}

describe('measureStorageChars', () => {
  it('returns 0 for empty storage', () => {
    expect(measureStorageChars(fakeStorage({}))).toBe(0)
  })

  it('sums key and value lengths', () => {
    expect(measureStorageChars(fakeStorage({ ab: 'cde', f: 'gh' }))).toBe(2 + 3 + 1 + 2)
  })

  it('returns 0 when storage throws', () => {
    const broken = {
      get length(): number {
        throw new Error('blocked')
      },
    } as unknown as Storage
    expect(measureStorageChars(broken)).toBe(0)
  })
})

describe('levelFor', () => {
  it('maps ratios to levels at the boundaries', () => {
    expect(levelFor(0)).toBe('ok')
    expect(levelFor(0.79)).toBe('ok')
    expect(levelFor(0.8)).toBe('warning')
    expect(levelFor(0.94)).toBe('warning')
    expect(levelFor(0.95)).toBe('critical')
    expect(levelFor(1)).toBe('critical')
  })
})

describe('getStorageUsage', () => {
  it('computes ratio and level against a custom quota', () => {
    const usage = getStorageUsage(fakeStorage({ k: 'x'.repeat(89) }), 100)
    expect(usage.usedChars).toBe(90)
    expect(usage.ratio).toBeCloseTo(0.9)
    expect(usage.level).toBe('warning')
  })

  it('caps the ratio at 1', () => {
    const usage = getStorageUsage(fakeStorage({ k: 'x'.repeat(500) }), 100)
    expect(usage.ratio).toBe(1)
    expect(usage.level).toBe('critical')
  })

  it('uses the default quota', () => {
    expect(getStorageUsage(fakeStorage({})).quotaChars).toBe(STORAGE_QUOTA_CHARS)
  })
})

describe('formatMB', () => {
  it('formats with one decimal', () => {
    expect(formatMB(0)).toBe('0.0')
    expect(formatMB(1024 * 1024)).toBe('1.0')
    expect(formatMB(3.2 * 1024 * 1024)).toBe('3.2')
  })
})
