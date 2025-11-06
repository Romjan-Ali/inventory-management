// frontend/src/components/discussion/DiscussionThread.tsx
import { useState, useEffect, useRef } from 'react'
import type { Inventory } from '@/types'
import { useGetPostsQuery } from '@/features/posts/postsApi'
import PostList from './PostList'
import PostForm from './PostForm'
import LoadingSpinner from '../common/LoadingSpinner'
import { useWebSocket } from '@/hooks/useWebSocket'
import { useTranslation } from 'react-i18next'

interface DiscussionThreadProps {
  inventory: Inventory
}

export default function DiscussionThread({ inventory }: DiscussionThreadProps) {
  const { t } = useTranslation()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [page, setPage] = useState(1)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { lastMessage } = useWebSocket(inventory.id)

  const {
    data: postsData,
    isLoading,
    error,
    refetch: refetchPostsData
  } = useGetPostsQuery({
    inventoryId: inventory.id,
    page,
    limit: 50,
  })

  useEffect(() => {
    if(lastMessage) {
      refetchPostsData()
    }
  }, [lastMessage])

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
        {t('postsCountDebug')}: {postsData?.posts?.length || 0} | {t('loading')}: {' '}
        {isLoading ? t('yes') : t('no')} | {t('error')}: {error ? t('yes') : t('no')}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : (
          <PostList posts={postsData?.posts || []} inventory={inventory} />
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
