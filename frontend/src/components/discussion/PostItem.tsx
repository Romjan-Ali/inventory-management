import { useState } from 'react'
import type { Post, Inventory } from '@/types'
import { useAppSelector } from '@/app/hooks'
import { useDeletePostMutation } from '@/features/posts/postsApi'
import { formatDate } from '@/lib/utils'
import { User, Trash2, MoreVertical } from 'lucide-react'
import LoadingSpinner from '../common/LoadingSpinner'
import { useTranslation } from 'react-i18next'

interface PostItemProps {
  post: Post
  inventory: Inventory
}

export default function PostItem({ post, inventory }: PostItemProps) {
  const { t } = useTranslation()
  const { user: currentUser } = useAppSelector((state) => state.auth)
  const [deletePost, { isLoading }] = useDeletePostMutation()
  const [showMenu, setShowMenu] = useState(false)

  const canDelete = 
    currentUser?.id === post.userId ||
    currentUser?.id === inventory.creatorId ||
    currentUser?.isAdmin

  const handleDelete = async () => {
    try {
      await deletePost(post.id).unwrap()
    } catch (error) {
      console.error('Failed to delete post:', error)
    }
    setShowMenu(false)
  }

  return (
    <div className="flex gap-3 group">
      {/* Avatar */}
      <div className="shrink-0">
        {post.user.avatar ? (
          <img
            src={post.user.avatar}
            alt={post.user.name}
            className="h-8 w-8 rounded-full"
          />
        ) : (
          <User className="h-8 w-8 rounded-full bg-gray-200 p-1.5" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-medium text-sm">{post.user.name}</span>
          <span className="text-xs text-muted-foreground">
            {formatDate(post.createdAt.toString())}
          </span>
        </div>
        <p className="text-sm mt-1 whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Actions */}
      {canDelete && (
        <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-32 rounded-md border bg-white shadow-lg z-10">
                <button
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-red-50 disabled:opacity-50"
                >
                  {isLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                  <Trash2 className="h-4 w-4" />
                  )}
                  {t('delete')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}