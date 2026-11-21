import { useCallback, useState } from 'react'
import { AnimatePresence, MotionConfig } from 'motion/react'
import { Toaster } from 'sonner'
import { AppShell } from '@/components/AppShell'
import { ComposeDialog } from '@/components/ComposeDialog'
import { PostDetailDialog } from '@/components/PostDetailDialog'
import { StoryViewer } from '@/components/StoryViewer'
import { useHashRoute } from '@/hooks/useHashRoute'
import { usePostActions } from '@/hooks/usePostActions'
import { usePosts } from '@/hooks/usePosts'
import { useProfile } from '@/hooks/useProfile'
import { useStories } from '@/hooks/useStories'
import { useStoryActions } from '@/hooks/useStoryActions'
import { useViewedStories } from '@/hooks/useViewedStories'
import { HomePage } from '@/pages/HomePage'
import { ProfilePage } from '@/pages/ProfilePage'
import { MAX_POST_CAPTION_LENGTH } from '@/types'

export default function App() {
  // Data
  const { stories, addStory, removeStory, restoreStory } = useStories()
  const { viewedIds, markViewed } = useViewedStories(stories)
  const { posts, addPost, updatePost, removePost, restorePost } = usePosts()
  const { profile, updateProfile } = useProfile()

  // Routing
  const { route, navigate } = useHashRoute()

  // Story viewer
  const [openStoryIndex, setOpenStoryIndex] = useState<number | null>(null)
  // Stable: used in the viewer's effect dependencies.
  const closeStory = useCallback(() => setOpenStoryIndex(null), [])

  // Post detail
  const [openPostId, setOpenPostId] = useState<string | null>(null)
  const openPost = openPostId ? posts.find((p) => p.id === openPostId) : undefined
  // Stable: used in the dialog's effect dependencies.
  const closePost = useCallback(() => setOpenPostId(null), [])

  // Story creation and deletion
  const storyActions = useStoryActions({ addStory, removeStory, restoreStory })

  // Post creation, editing and deletion
  const postActions = usePostActions({
    addPost,
    updatePost,
    removePost,
    restorePost,
    onShared: () => {
      if (route !== '/') navigate('/')
    },
  })

  return (
    <MotionConfig reducedMotion="user">
      <AppShell
        route={route}
        onNavigate={navigate}
        profile={profile}
        onCreate={postActions.startCreate}
        creating={postActions.creating}
      >
        {route === '/profile' ? (
          <ProfilePage
            profile={profile}
            onSave={updateProfile}
            stories={stories}
            posts={posts}
            viewedIds={viewedIds}
            onOpenStory={setOpenStoryIndex}
            onOpenPost={setOpenPostId}
          />
        ) : (
          <HomePage
            stories={stories}
            posts={posts}
            profile={profile}
            viewedIds={viewedIds}
            uploading={storyActions.uploading}
            onAdd={storyActions.startUpload}
            onOpenStory={setOpenStoryIndex}
            onDeletePost={postActions.remove}
            onUpdatePost={postActions.edit}
          />
        )}
      </AppShell>

      <AnimatePresence>
        {openStoryIndex !== null && stories.length > 0 && (
          <StoryViewer
            stories={stories}
            profile={profile}
            startIndex={openStoryIndex}
            onClose={closeStory}
            onView={markViewed}
            onDelete={storyActions.deleteStory}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {storyActions.draft && (
          <ComposeDialog
            image={storyActions.draft}
            onPost={storyActions.publish}
            onCancel={storyActions.cancelDraft}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {openPost && (
          <PostDetailDialog
            post={openPost}
            profile={profile}
            onClose={closePost}
            onDelete={postActions.remove}
            onUpdate={postActions.edit}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {postActions.draft && (
          <ComposeDialog
            image={postActions.draft}
            title="New post"
            submitLabel="Share"
            maxLength={MAX_POST_CAPTION_LENGTH}
            onPost={postActions.share}
            onCancel={postActions.cancelDraft}
          />
        )}
      </AnimatePresence>

      <Toaster theme="dark" position="top-center" richColors closeButton />
    </MotionConfig>
  )
}
