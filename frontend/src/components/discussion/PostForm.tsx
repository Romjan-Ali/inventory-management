// frontend/src/components/discussion/PostForm.tsx
import { useState } from 'react'
import type { Inventory } from '@/types'
import { useCreatePostMutation } from '@/features/posts/postsApi'
import { Send } from 'lucide-react'
import LoadingSpinner from '../common/LoadingSpinner'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

interface PostFormProps {
  inventory: Inventory
}

export default function PostForm({ inventory }: PostFormProps) {
  const { t } = useTranslation()
  const [content, setContent] = useState('')
  const [createPost, { isLoading }] = useCreatePostMutation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim() || isLoading) return

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

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={t('typeYourMessage')}
        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary"
        disabled={isLoading}
      />
      <button
        type="submit"
        disabled={!content.trim() || isLoading}
        className="inline-flex items-center gap-2 rounded-lg px-4 py-2 bg-primary dark:bg-secondary dark:hover:bg-secondary/80 text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
      >
        {isLoading ? (
          <LoadingSpinner size="sm" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </button>
    </form>
  )
}