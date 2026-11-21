import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MAX_POSTS, POSTS_KEY, POST_IMAGE_PREFIX } from '@/types'
import {
  cleanupOrphanImages,
  createPost,
  deletePost,
  loadPostImage,
  loadPosts,
  restorePost,
  savePost,
  updatePost,
} from './postStorage'

const IMG = 'data:image/jpeg;base64,AAAA'

beforeEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

describe('createPost', () => {
  it('trims and truncates the caption and starts with zero likes', () => {
    const p = createPost('  hello  ', 1)
    expect(p.caption).toBe('hello')
    expect(p.likes).toBe(0)
    expect(p.liked).toBe(false)
    expect(p.comments).toEqual([])
    expect(createPost('a'.repeat(900), 1).caption.length).toBe(500)
  })
})

describe('postStorage', () => {
  it('returns an empty list when nothing is stored', () => {
    expect(loadPosts()).toEqual([])
  })

  it('round-trips a post and its image', () => {
    const p = createPost('hi', 1)
    expect(savePost(p, IMG)).toEqual({ ok: true })
    expect(loadPosts()).toEqual([p])
    expect(loadPostImage(p.id)).toBe(IMG)
  })

  it('stores newest posts first', () => {
    const a = createPost('a', 1)
    const b = createPost('b', 2)
    savePost(a, IMG)
    savePost(b, IMG)
    expect(loadPosts().map((p) => p.caption)).toEqual(['b', 'a'])
  })

  it('refuses new posts beyond the limit', () => {
    for (let i = 0; i < MAX_POSTS; i++) savePost(createPost(`p${i}`, i), IMG)
    expect(savePost(createPost('extra', 999), IMG)).toEqual({ ok: false, reason: 'limit' })
    expect(loadPosts().length).toBe(MAX_POSTS)
  })

  it('discards corrupted JSON safely', () => {
    localStorage.setItem(POSTS_KEY, '{oops')
    expect(loadPosts()).toEqual([])
    expect(localStorage.getItem(POSTS_KEY)).toBeNull()
  })

  it('filters out invalid entries', () => {
    const p = createPost('ok', 1)
    localStorage.setItem(POSTS_KEY, JSON.stringify([p, { id: 'bad' }, { ...p, id: 'x', likes: -1 }]))
    expect(loadPosts()).toEqual([p])
  })

  it('reports quota errors and removes the image when the image write fails', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('full', 'QuotaExceededError')
    })
    const p = createPost('x', 1)
    expect(savePost(p, IMG)).toEqual({ ok: false, reason: 'quota' })
    expect(loadPostImage(p.id)).toBeNull()
  })

  it('removes the image again when the metadata write fails', () => {
    const p = createPost('x', 1)
    const real = Storage.prototype.setItem
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (this: Storage, key: string, value: string) {
      if (key === POSTS_KEY) throw new DOMException('full', 'QuotaExceededError')
      return real.call(this, key, value)
    })
    expect(savePost(p, IMG)).toEqual({ ok: false, reason: 'quota' })
    expect(localStorage.getItem(POST_IMAGE_PREFIX + p.id)).toBeNull()
  })

  it('updates an existing post and rejects unknown ones', () => {
    const p = createPost('x', 1)
    savePost(p, IMG)
    expect(updatePost({ ...p, likes: 1, liked: true })).toEqual({ ok: true })
    expect(loadPosts()[0].likes).toBe(1)
    expect(updatePost(createPost('ghost', 2)).ok).toBe(false)
  })

  it('deletes a post together with its image', () => {
    const p = createPost('x', 1)
    savePost(p, IMG)
    expect(deletePost(p.id)).toEqual({ ok: true })
    expect(loadPosts()).toEqual([])
    expect(loadPostImage(p.id)).toBeNull()
  })

  it('restores a deleted post with its image at the old position', () => {
    const a = createPost('a', 1)
    const b = createPost('b', 2)
    const c = createPost('c', 3)
    savePost(a, IMG)
    savePost(b, IMG)
    savePost(c, IMG)
    // stored order: c, b, a
    deletePost(b.id)
    expect(loadPosts().map((p) => p.caption)).toEqual(['c', 'a'])
    expect(restorePost(b, IMG, 1)).toEqual({ ok: true })
    expect(loadPosts().map((p) => p.caption)).toEqual(['c', 'b', 'a'])
    expect(loadPostImage(b.id)).toBe(IMG)
  })

  it('does not duplicate a post that already exists when restoring', () => {
    const p = createPost('x', 1)
    savePost(p, IMG)
    expect(restorePost(p, IMG, 0)).toEqual({ ok: true })
    expect(loadPosts()).toHaveLength(1)
  })

  it('refuses to restore beyond the post limit', () => {
    for (let i = 0; i < MAX_POSTS; i++) savePost(createPost(`p${i}`, i), IMG)
    expect(restorePost(createPost('extra', 999), IMG, 0)).toEqual({ ok: false, reason: 'limit' })
  })

  it('cleans up orphan images', () => {
    const p = createPost('x', 1)
    savePost(p, IMG)
    localStorage.setItem(POST_IMAGE_PREFIX + 'orphan', IMG)
    expect(cleanupOrphanImages()).toBe(1)
    expect(loadPostImage('orphan')).toBeNull()
    expect(loadPostImage(p.id)).toBe(IMG)
  })
})
