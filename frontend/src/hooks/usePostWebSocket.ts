// frontend/src/hooks/usePostWebSocket.ts
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { postsApi } from '@/features/posts/postsApi'
import type { Post } from '@/types'
import { useWebSocket } from './useWebSocket'

interface PostWebSocketMessage {
  type: 'post:created' | 'post:deleted'
  data: Post | { id: string }
}

export function usePostWebSocket(inventoryId: string) {
  const dispatch = useDispatch()
  const { lastMessage } = useWebSocket(inventoryId)

  useEffect(() => {
    if (!lastMessage) return

    try {
      const message: PostWebSocketMessage = lastMessage
      
      const updateCache = postsApi.util.updateQueryData(
        'getPosts',
        { inventoryId, page: 1, limit: 50 },
        (draft) => {
          if (!draft || !draft.posts) return
          
          if (message.type === 'post:created') {
            const newPost = message.data as Post
            const exists = draft.posts.find(post => post.id === newPost.id)
            if (!exists) {
              draft.posts.unshift(newPost)
              if (draft.pagination?.total !== undefined) {
                draft.pagination.total += 1
              }
            }
          } else if (message.type === 'post:deleted') {
            const postId = (message.data as { id: string }).id
            const index = draft.posts.findIndex(post => post.id === postId)
            if (index !== -1) {
              draft.posts.splice(index, 1)
              if (draft.pagination?.total !== undefined) {
                draft.pagination.total = Math.max(0, draft.pagination.total - 1)
              }
            }
          }
        }
      )

      dispatch(updateCache)
      
    } catch (error) {
      console.error('Failed to process WebSocket message:', error)
    }
  }, [lastMessage, dispatch, inventoryId])
}