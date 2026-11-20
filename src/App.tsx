import { useCallback, useState } from 'react'
import { AnimatePresence, MotionConfig } from 'motion/react'
import { Toaster, toast } from 'sonner'
import { AppShell } from '@/components/AppShell'
import { ComposeDialog } from '@/components/ComposeDialog'
import { PostDetailDialog } from '@/components/PostDetailDialog'
import { StoryViewer } from '@/components/StoryViewer'
import { useHashRoute } from '@/hooks/useHashRoute'
import { usePosts } from '@/hooks/usePosts'
import { useProfile } from '@/hooks/useProfile'
import { useStories } from '@/hooks/useStories'
import { useViewedStories } from '@/hooks/useViewedStories'
import { HomePage } from '@/pages/HomePage'
import { ProfilePage } from '@/pages/ProfilePage'
import { MAX_POST_CAPTION_LENGTH, type Post } from '@/types'
import { fileToPostImage, fileToStoryImage, ImageError } from '@/utils/image'

export default function App() {
  const { stories, addStory, removeStory } = useStories()
  const { viewedIds, markViewed } = useViewedStories(stories)
  const { route, navigate } = useHashRoute()
  const { profile, updateProfile } = useProfile()
  const { posts, addPost, updatePost, removePost } = usePosts()
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [uploading, setUploading] = useState(false)
  const [draft, setDraft] = useState<string | null>(null)
  const [postDraft, setPostDraft] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [openPostId, setOpenPostId] = useState<string | null>(null)
  const openPost = openPostId ? posts.find((p) => p.id === openPostId) : undefined

  const handleAdd = useCallback(async (file: File) => {
    setUploading(true)
    try {
      const image = await fileToStoryImage(file)
      setDraft(image)
    } catch (err) {
      toast.error(err instanceof ImageError ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setUploading(false)
    }
  }, [])

  const handlePost = useCallback(
    (caption: string) => {
      if (!draft) return
      const result = addStory(draft, caption)
      if (result.ok) {
        setDraft(null)
        toast.success('Story posted. It will disappear in 24 hours.')
      } else if (result.reason === 'quota') {
        toast.error('Storage is full. Wait for older stories to expire and try again.')
      } else {
        toast.error('Could not save the story. Local storage is unavailable.')
      }
    },
    [addStory, draft],
  )

  const handleCancelDraft = useCallback(() => setDraft(null), [])

  const handleCreate = useCallback(async (file: File) => {
    setCreating(true)
    try {
      setPostDraft(await fileToPostImage(file))
    } catch (err) {
      toast.error(err instanceof ImageError ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setCreating(false)
    }
  }, [])

  const handleSharePost = useCallback(
    (caption: string) => {
      if (!postDraft) return
      const result = addPost(postDraft, caption)
      if (result.ok) {
        setPostDraft(null)
        if (route !== '/') navigate('/')
        toast.success('Post shared.')
      } else if (result.reason === 'limit') {
        toast.error('You have reached the limit of 30 posts. Delete one to share a new post.')
      } else if (result.reason === 'quota') {
        toast.error('Storage is full. Delete a post or story and try again.')
      } else {
        toast.error('Could not save the post. Local storage is unavailable.')
      }
    },
    [addPost, postDraft, route, navigate],
  )

  const handleCancelPostDraft = useCallback(() => setPostDraft(null), [])

  const handleDeletePost = useCallback(
    (id: string) => {
      const result = removePost(id)
      if (result.ok) {
        toast.success('Post deleted.')
      } else {
        toast.error('Could not delete the post. Local storage is unavailable.')
      }
    },
    [removePost],
  )

  const handleUpdatePost = useCallback(
    (post: Post) => {
      const result = updatePost(post)
      if (!result.ok) {
        toast.error(
          result.reason === 'quota'
            ? 'Storage is full. Could not save your change.'
            : 'Could not save your change. Local storage is unavailable.',
        )
      }
    },
    [updatePost],
  )

  const handleClosePost = useCallback(() => setOpenPostId(null), [])

  const handleClose = useCallback(() => setOpenIndex(null), [])

  const handleDelete = useCallback(
    (id: string) => {
      const result = removeStory(id)
      if (result.ok) {
        toast.success('Story deleted.')
      } else {
        toast.error('Could not delete the story. Local storage is unavailable.')
      }
    },
    [removeStory],
  )

  return (
    <MotionConfig reducedMotion="user">
      <AppShell
        route={route}
        onNavigate={navigate}
        profile={profile}
        onCreate={handleCreate}
        creating={creating}
      >
        {route === '/profile' ? (
          <ProfilePage
            profile={profile}
            onSave={updateProfile}
            stories={stories}
            posts={posts}
            viewedIds={viewedIds}
            onOpenStory={setOpenIndex}
            onOpenPost={setOpenPostId}
          />
        ) : (
          <HomePage
            stories={stories}
            posts={posts}
            profile={profile}
            viewedIds={viewedIds}
            uploading={uploading}
            onAdd={handleAdd}
            onOpenStory={setOpenIndex}
            onDeletePost={handleDeletePost}
            onUpdatePost={handleUpdatePost}
          />
        )}
      </AppShell>

      <AnimatePresence>
        {openIndex !== null && stories.length > 0 && (
          <StoryViewer
            stories={stories}
            profile={profile}
            startIndex={openIndex}
            onClose={handleClose}
            onView={markViewed}
            onDelete={handleDelete}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {draft && <ComposeDialog image={draft} onPost={handlePost} onCancel={handleCancelDraft} />}
      </AnimatePresence>

      <AnimatePresence>
        {openPost && (
          <PostDetailDialog
            post={openPost}
            profile={profile}
            onClose={handleClosePost}
            onDelete={handleDeletePost}
            onUpdate={handleUpdatePost}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {postDraft && (
          <ComposeDialog
            image={postDraft}
            title="New post"
            submitLabel="Share"
            maxLength={MAX_POST_CAPTION_LENGTH}
            onPost={handleSharePost}
            onCancel={handleCancelPostDraft}
          />
        )}
      </AnimatePresence>

      <Toaster theme="dark" position="top-center" richColors closeButton />
    </MotionConfig>
  )
}
