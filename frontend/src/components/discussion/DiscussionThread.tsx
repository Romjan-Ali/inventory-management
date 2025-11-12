// frontend/src/components/discussion/DiscussionThread.tsx
import { useState, useEffect, useRef } from 'react'
import type { Inventory } from '@/types'
import { useGetPostsQuery } from '@/features/posts/postsApi'
import PostList from './PostList'
import PostForm from './PostForm'
import LoadingSpinner from '../common/LoadingSpinner'
import { useWebSocket } from '@/hooks/useWebSocket'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface DiscussionThreadProps {
  inventory: Inventory
}

export default function DiscussionThread({ inventory }: DiscussionThreadProps) {
  const { t } = useTranslation()
  const [page] = useState(1)
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

  // Improved real-time updates for both create and delete
  useEffect(() => {
    if (lastMessage) {
      refetchPostsData()
    }
  }, [lastMessage, refetchPostsData])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (postsData?.posts && postsData.posts.length > 0) {
      scrollToBottom()
    }
  }, [postsData?.posts])

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="shrink-0 pb-4">
        <CardTitle className="text-lg">{t('discussion')}</CardTitle>
        <CardDescription>
          {t('discussionDescription')}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertDescription>
                {t('failedToLoadMessages')}
              </AlertDescription>
            </Alert>
          ) : (
            <PostList posts={postsData?.posts || []} inventory={inventory} />
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="shrink-0 border-t p-4 bg-muted/20">
          <PostForm inventory={inventory} />
        </div>
      </CardContent>
    </Card>
  )
}