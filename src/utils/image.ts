import { MAX_IMAGE_HEIGHT, MAX_IMAGE_WIDTH } from '@/types'

export const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024
const JPEG_QUALITY = 0.8

export class ImageError extends Error {}

/** Scales (width, height) down to fit within max bounds, keeping aspect ratio. Never upscales. */
export function fitWithin(
  width: number,
  height: number,
  maxWidth: number = MAX_IMAGE_WIDTH,
  maxHeight: number = MAX_IMAGE_HEIGHT,
): { width: number; height: number } {
  if (width <= 0 || height <= 0) return { width: 0, height: 0 }
  const scale = Math.min(1, maxWidth / width, maxHeight / height)
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  }
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new ImageError('Could not read this image. Try a different file.'))
    }
    img.src = url
  })
}

/** Validates, resizes (max 1080x1920) and converts an image file to a base64 JPEG data URL. */
export async function fileToStoryImage(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new ImageError('Please choose an image file.')
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new ImageError('Image is too large. Please choose one under 15 MB.')
  }

  const img = await loadImage(file)
  const { width, height } = fitWithin(img.naturalWidth, img.naturalHeight)
  if (!width || !height) {
    throw new ImageError('Could not read this image. Try a different file.')
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new ImageError('Your browser cannot process images.')

  // JPEG has no alpha channel: paint a white background for transparent PNG/WebP.
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)
  ctx.drawImage(img, 0, 0, width, height)

  return canvas.toDataURL('image/jpeg', JPEG_QUALITY)
}
