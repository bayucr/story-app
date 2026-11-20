export interface Story {
  id: string
  /** base64 data URL (JPEG) */
  image: string
  createdAt: number
  expiresAt: number
  /** Optional text shown over the image */
  caption?: string
}

export const STORY_TTL_MS = 24 * 60 * 60 * 1000
export const MAX_IMAGE_WIDTH = 1080
export const MAX_IMAGE_HEIGHT = 1920
export const MAX_CAPTION_LENGTH = 120
export const STORAGE_KEY = 'stories'
export const STORY_DURATION_MS = 5000
