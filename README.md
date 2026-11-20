# Stories

A client-side "Story" feature inspired by Instagram and WhatsApp. Users post a photo that is shown in a story bar and disappears automatically after 24 hours. There is no backend: everything lives in the browser's `localStorage`.

## Features

- Story bar at the top with a **+** button and a horizontally scrollable list of stories
- Upload an image; it is resized, converted to a base64 JPEG and saved in `localStorage`
- Images are constrained to a maximum of **1080 x 1920** (aspect ratio kept, never upscaled)
- Stories expire after **24 hours** and are removed automatically
- Fullscreen story viewer with progress bars and 5 second auto-advance
- Swipe left/right to browse, swipe down to close
- Tap left/right to navigate, press and hold to pause
- Keyboard support: Left Arrow, Right Arrow, `Esc`
- Responsive: fullscreen on mobile, 9:16 portrait card on desktop
- Clear error toasts for invalid files and full storage

## Tech stack

- [Vite](https://vite.dev) + [React](https://react.dev) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com)
- [Motion](https://motion.dev) for animation and swipe gestures
- [lucide-react](https://lucide.dev) for icons
- [sonner](https://sonner.emilkowal.ski) for toasts
- [Vitest](https://vitest.dev) for unit tests

## Getting started

Requires Node.js 18 or newer.

```bash
npm install
npm run dev
```

Other scripts:

```bash
npm run build     # typecheck and production build
npm run preview   # preview the production build
npm test          # run unit tests
```

## How it works

### Storage

Stories are saved under the `stories` key in `localStorage` as an array of:

```ts
interface Story {
  id: string
  image: string      // base64 data URL (JPEG)
  createdAt: number  // epoch ms
  expiresAt: number  // createdAt + 24h
}
```

Corrupted or invalid data is discarded safely instead of crashing the app.

### Expiry

Expired stories are removed:

1. when the app loads,
2. by a timer scheduled for the exact moment the next story expires,
3. when the tab becomes visible or focused again (browsers throttle timers in background tabs),
4. when another tab changes the data (`storage` event).

### Image processing

The selected file is validated (must be an image, max 15 MB), drawn onto a canvas scaled to fit within 1080 x 1920, and exported as JPEG at 0.8 quality. Compression matters because `localStorage` is limited to roughly 5 MB.

## Project structure

```
src/
|-- main.tsx
|-- App.tsx
|-- styles.css
|-- types.ts
|-- components/
|   |-- AddStoryButton.tsx
|   |-- StoryBar.tsx
|   |-- StoryItem.tsx
|   `-- StoryViewer.tsx
|-- hooks/
|   `-- useStories.ts
`-- utils/
    |-- cn.ts
    |-- expiry.ts
    |-- image.ts
    `-- storage.ts
```

## Limitations

- `localStorage` holds about 5 MB, so only a handful of images fit. When it is full, the app shows an error until older stories expire.
- Data is per browser and per device; there is no sync or account system.
- The "viewed" state lasts for the current session only.
