// frontend/src/hooks/usePostWebSocket.ts
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import type { AnyAction, ThunkDispatch } from '@reduxjs/toolkit'
import { postsApi } from '@/features/posts/postsApi'
import type { Post } from '@/types'
import { useWebSocket } from './useWebSocket'

interface PostWebSocketMessage {
  type: 'post:created' | 'post:deleted' | 'post:updated'
  data: Post | { id: string }
}

// Define proper types for dispatch
type AppDispatch = ThunkDispatch<any, any, AnyAction>

export function usePostWebSocket(inventoryId: string) {
  const dispatch = useDispatch<AppDispatch>()
  const { lastMessage, readyState } = useWebSocket(`inventory:${inventoryId}`)

  useEffect(() => {
    if (!lastMessage || readyState !== WebSocket.OPEN) return

    try {
      const message: PostWebSocketMessage = JSON.parse(lastMessage.data)
      console.log('WebSocket message received:', message)
      
      switch (message.type) {
        case 'post:created':
          handlePostCreated(message.data as Post)
          break
        case 'post:deleted':
          handlePostDeleted((message.data as { id: string }).id)
          break
        default:
          console.log('Unhandled WebSocket message type:', message.type)
      }
    } catch (error) {
      console.error('Failed to process WebSocket message:', error)
    }
  }, [lastMessage, readyState, dispatch, inventoryId])

  const handlePostCreated = (newPost: Post) => {
    // Update cache for page 1
    dispatch(
      postsApi.util.updateQueryData(
        'getPosts',
        { inventoryId, page: 1, limit: 50 },
        (draft) => {
          if (draft && draft.posts) {
            // Check if post already exists (avoid duplicates)
            const exists = draft.posts.find(post => post.id === newPost.id)
            if (!exists) {
              // Add to beginning for chronological order (newest first)
              draft.posts.unshift(newPost)
              // Update pagination
              if (draft.pagination && typeof draft.pagination.total === 'number') {
                draft.pagination.total += 1
              }
            }
          }
        }
      ) as any // Type assertion to bypass TypeScript issues
    )
  }

  const handlePostDeleted = (postId: string) => {
    // Update cache for page 1
    dispatch(
      postsApi.util.updateQueryData(
        'getPosts',
        { inventoryId, page: 1, limit: 50 },
        (draft) => {
          if (draft && draft.posts) {
            const index = draft.posts.findIndex(post => post.id === postId)
            if (index !== -1) {
              draft.posts.splice(index, 1)
              // Update pagination
              if (draft.pagination && typeof draft.pagination.total === 'number') {
                draft.pagination.total = Math.max(0, draft.pagination.total - 1)
              }
            }
          }
        }
      ) as any // Type assertion to bypass TypeScript issues
    )
  }
}