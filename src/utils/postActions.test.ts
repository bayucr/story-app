import { describe, expect, it } from 'vitest'
import { MAX_COMMENT_LENGTH, MAX_POST_CAPTION_LENGTH } from '@/types'
import { createPost } from './postStorage'
import { addComment, editCaption, likePost, removeComment, toggleLike, toggleSave } from './postActions'

const base = () => createPost('hello', 1)

describe('postActions', () => {
  it('toggles like on and off without mutating the original', () => {
    const p = base()
    const liked = toggleLike(p)
    expect(liked.liked).toBe(true)
    expect(liked.likes).toBe(1)
    expect(p.liked).toBe(false)
    const unliked = toggleLike(liked)
    expect(unliked.liked).toBe(false)
    expect(unliked.likes).toBe(0)
  })

  it('never lets likes go below zero', () => {
    const p = { ...base(), liked: true, likes: 0 }
    expect(toggleLike(p).likes).toBe(0)
  })

  it('likePost only likes and never unlikes', () => {
    const liked = likePost(base())
    expect(liked.liked).toBe(true)
    expect(likePost(liked)).toBe(liked)
    expect(liked.likes).toBe(1)
  })

  it('toggles save', () => {
    const p = base()
    expect(toggleSave(p).saved).toBe(true)
    expect(toggleSave(toggleSave(p)).saved).toBe(false)
  })

  it('adds a trimmed comment and rejects blank text', () => {
    const p = base()
    const next = addComment(p, '  nice  ', 5)
    expect(next?.comments).toHaveLength(1)
    expect(next?.comments[0].text).toBe('nice')
    expect(next?.comments[0].createdAt).toBe(5)
    expect(p.comments).toHaveLength(0)
    expect(addComment(p, '   ')).toBeNull()
  })

  it('truncates long comments', () => {
    const next = addComment(base(), 'a'.repeat(1000), 1)
    expect(next?.comments[0].text.length).toBe(MAX_COMMENT_LENGTH)
  })

  it('edits the caption with trimming and without mutating the original', () => {
    const p = base()
    const next = editCaption(p, '  new caption  ')
    expect(next.caption).toBe('new caption')
    expect(p.caption).toBe('hello')
  })

  it('returns the same post when the caption is unchanged', () => {
    const p = base()
    expect(editCaption(p, 'hello')).toBe(p)
    expect(editCaption(p, '  hello  ')).toBe(p)
  })

  it('allows clearing the caption and truncates long ones', () => {
    expect(editCaption(base(), '   ').caption).toBe('')
    expect(editCaption(base(), 'a'.repeat(900)).caption.length).toBe(MAX_POST_CAPTION_LENGTH)
  })

  it('removes a comment by id', () => {
    const withComment = addComment(base(), 'x', 1)!
    const id = withComment.comments[0].id
    expect(removeComment(withComment, id).comments).toHaveLength(0)
    expect(removeComment(withComment, 'nope').comments).toHaveLength(1)
  })
})
