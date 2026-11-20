import { beforeEach, describe, expect, it } from 'vitest'
import { VIEWED_KEY, loadViewed, pruneViewed, saveViewed } from './viewed'

beforeEach(() => {
  localStorage.clear()
})

describe('viewed', () => {
  it('returns an empty set when nothing is stored', () => {
    expect(loadViewed().size).toBe(0)
  })

  it('round-trips ids', () => {
    saveViewed(new Set(['a', 'b']))
    expect([...loadViewed()].sort()).toEqual(['a', 'b'])
  })

  it('discards corrupted JSON safely', () => {
    localStorage.setItem(VIEWED_KEY, '{oops')
    expect(loadViewed().size).toBe(0)
    expect(localStorage.getItem(VIEWED_KEY)).toBeNull()
  })

  it('discards data that is not an array', () => {
    localStorage.setItem(VIEWED_KEY, JSON.stringify({ a: 1 }))
    expect(loadViewed().size).toBe(0)
  })

  it('ignores non-string entries', () => {
    localStorage.setItem(VIEWED_KEY, JSON.stringify(['a', 1, null, 'b']))
    expect([...loadViewed()].sort()).toEqual(['a', 'b'])
  })

  it('prunes ids that no longer belong to an active story', () => {
    const result = pruneViewed(new Set(['a', 'b', 'c']), ['b', 'c', 'd'])
    expect([...result].sort()).toEqual(['b', 'c'])
  })
})
