import type { Post, Inventory } from '@/types'
import PostItem from './PostItem'

interface PostListProps {
  posts: Post[]
  inventory: Inventory
}

export default function PostList({ posts, inventory }: PostListProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No messages yet. Start the conversation!
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