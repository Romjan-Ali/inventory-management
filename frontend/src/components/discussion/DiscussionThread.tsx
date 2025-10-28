// frontend/src/components/discussion/DiscussionThread.tsx
import { useState, useEffect, useRef } from 'react'
import type { Inventory } from '@/types'
import { useGetPostsQuery } from '@/features/posts/postsApi'
import { usePostWebSocket } from '@/hooks/usePostWebSocket'
import PostList from './PostList'
import PostForm from './PostForm'
import LoadingSpinner from '../common/LoadingSpinner'

interface DiscussionThreadProps {
  inventory: Inventory
}

export default function DiscussionThread({ inventory }: DiscussionThreadProps) {
  const [page, setPage] = useState(1)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const { data: postsData, isLoading, error } = useGetPostsQuery({
    inventoryId: inventory.id,
    page,
    limit: 50,
  })

  // Add debugging
  useEffect(() => {
    console.log('Posts data updated:', postsData)
  }, [postsData])

  // Use the WebSocket hook for real-time cache updates
  usePostWebSocket(inventory.id)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (postsData?.posts && postsData.posts.length > 0) {
      scrollToBottom()
    }
  }, [postsData?.posts])

  return (
    <div className="flex flex-col h-[600px] border-t">
      {/* Debug info - remove in production */}
      <div className="text-xs text-gray-500 p-2 bg-gray-100">
        Posts count: {postsData?.posts?.length || 0} | 
        Loading: {isLoading ? 'Yes' : 'No'} | 
        Error: {error ? 'Yes' : 'No'}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : (
          <PostList
            posts={postsData?.posts || []}
            inventory={inventory}
          />
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 border-t p-4">
        <PostForm inventory={inventory} />
      </div>
    </div>
  )
}