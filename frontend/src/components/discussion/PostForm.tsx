// frontend/src/components/discussion/PostForm.tsx
import { useState } from 'react'
import type { Inventory } from '@/types'
import { useCreatePostMutation } from '@/features/posts/postsApi'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import LoadingSpinner from '../common/LoadingSpinner'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useAppSelector } from '@/app/hooks'

interface PostFormProps {
  inventory: Inventory
}

export default function PostForm({ inventory }: PostFormProps) {
  const { t } = useTranslation()
  const { user: currentUser } = useAppSelector((state) => state.auth)
  const [content, setContent] = useState('')
  const [createPost, { isLoading }] = useCreatePostMutation()

  // Check if user can post (authenticated users only)
  const canPost = !!currentUser

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim() || isLoading || !canPost) return

    try {
      await createPost({
        inventoryId: inventory.id,
        content: content.trim(),
      }).unwrap()
      setContent('')
      toast.success(t('postCreated'))
    } catch (error) {
      console.error('Failed to create post:', error)
      toast.error(t('failedToCreatePost'))
    }
  }

  if (!canPost) {
    return (
      <Card>
        <CardContent className="p-4 text-center text-muted-foreground">
          {t('loginToParticipate')}
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={t('typeYourMessage')}
        disabled={isLoading}
        className="flex-1"
      />
      <Button
        type="submit"
        disabled={!content.trim() || isLoading}
        size="sm"
      >
        {isLoading ? (
          <LoadingSpinner size="sm" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </Button>
    </form>
  )
}