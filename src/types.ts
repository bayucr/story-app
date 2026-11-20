export interface Story {
  id: string
  /** base64 data URL (JPEG) */
  image: string
  createdAt: number
  expiresAt: number
  /** Optional text shown over the image */
  caption?: string
}

export interface Comment {
  id: string
  text: string
  createdAt: number
}

/** Post metadata. The image lives under its own storage key (see postStorage). */
export interface Post {
  id: string
  createdAt: number
  caption: string
  likes: number
  liked: boolean
  saved: boolean
  comments: Comment[]
}

export const POSTS_KEY = 'posts'
export const POST_IMAGE_PREFIX = 'post-image:'
export const MAX_POSTS = 30
export const MAX_POST_IMAGE_WIDTH = 720
export const MAX_POST_IMAGE_HEIGHT = 1280
export const MAX_POST_CAPTION_LENGTH = 500
export const MAX_COMMENT_LENGTH = 300
export const STORY_TTL_MS = 24 * 60 * 60 * 1000
export const MAX_IMAGE_WIDTH = 1080
export const MAX_IMAGE_HEIGHT = 1920
export const MAX_CAPTION_LENGTH = 120
export const STORAGE_KEY = 'stories'
export const STORY_DURATION_MS = 5000
