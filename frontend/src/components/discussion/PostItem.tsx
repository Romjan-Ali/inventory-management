// frontend/src/components/discussion/PostItem.tsx
import type { Post, Inventory } from '@/types'
import { useAppSelector } from '@/app/hooks'
import { useDeletePostMutation } from '@/features/posts/postsApi'
import { formatDate } from '@/lib/utils'
import { User, Trash2, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import LoadingSpinner from '../common/LoadingSpinner'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import ReactMarkdown from 'react-markdown'
import { Link } from 'react-router-dom'

interface PostItemProps {
  post: Post
  inventory: Inventory
}

export default function PostItem({ post, inventory }: PostItemProps) {
  const { t } = useTranslation()
  const { user: currentUser } = useAppSelector((state) => state.auth)
  const [deletePost, { isLoading }] = useDeletePostMutation()

  const canDelete = 
    currentUser?.id === post.userId ||
    currentUser?.id === inventory.creatorId ||
    currentUser?.isAdmin

  const handleDelete = async () => {
    try {
      await deletePost(post.id).unwrap()
      toast.success(t('postDeleted'))
    } catch (error) {
      console.error('Failed to delete post:', error)
      toast.error(t('failedToDeletePost'))
    }
  }

  return (
    <div className="flex gap-4 group hover:bg-muted/50 p-4 rounded-lg transition-colors">
      {/* Avatar */}
      <Link to={`/user/${post.user.id}`} className="shrink-0">
        <Avatar className="h-10 w-10">
          <AvatarImage src={post.user.avatar || ''} alt={post.user.name} />
          <AvatarFallback>
            <User className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      </Link>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-2">
          <Link 
            to={`/user/${post.user.id}`}
            className="font-medium text-sm hover:underline"
          >
            {post.user.name}
          </Link>
          <span className="text-xs text-muted-foreground">
            {formatDate(post.createdAt.toString())}
          </span>
        </div>
        
        {/* Markdown Content */}
        <div className="text-sm prose prose-sm max-w-none dark:prose-invert">
          <ReactMarkdown>
            {post.content}
          </ReactMarkdown>
        </div>
      </div>

      {/* Actions */}
      {canDelete && (
        <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={handleDelete}
                disabled={isLoading}
                className="text-destructive focus:text-destructive"
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                {t('delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  )
}