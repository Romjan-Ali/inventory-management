import type { Post, Inventory } from '@/types'
import PostItem from './PostItem'
import { useTranslation } from 'react-i18next'

interface PostListProps {
  posts: Post[]
  inventory: Inventory
}

export default function PostList({ posts, inventory }: PostListProps) {
  const { t } = useTranslation()
  if (posts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {t('noMessages')}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostItem
          key={post.id}
          post={post}
          inventory={inventory}
        />
      ))}
    </div>
  )
}