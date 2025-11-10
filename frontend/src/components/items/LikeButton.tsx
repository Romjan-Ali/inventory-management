// frontend/src/components/items/LikeButton.tsx
import { useState } from 'react'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLikeItemMutation } from '@/features/items/itemsApi'
import { useAppSelector } from '@/app/hooks'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface LikeButtonProps {
  itemId: string
  initialLikeCount: number
  initialIsLiked: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'ghost' | 'outline' | 'secondary'
}

export default function LikeButton({
  itemId,
  initialLikeCount,
  initialIsLiked,
  size = 'md',
  variant = 'ghost'
}: LikeButtonProps) {
  const { t } = useTranslation()
  const { user } = useAppSelector((state) => state.auth)
  const [likeItem] = useLikeItemMutation()
  
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [isLoading, setIsLoading] = useState(false)

  const handleLike = async () => {
    if (!user) {
      toast.error(t('loginToLike'))
      return
    }

    setIsLoading(true)
    try {
      const result = await likeItem(itemId).unwrap()
      setIsLiked(result.liked)
      setLikeCount(prev => result.liked ? prev + 1 : prev - 1)
    } catch (error) {
      console.error('Failed to like item:', error)
      toast.error(t('failedToLike'))
    } finally {
      setIsLoading(false)
    }
  }

  const sizeClasses = {
    sm: 'h-8 px-2 text-xs',
    md: 'h-9 px-3 text-sm',
    lg: 'h-10 px-4 text-base'
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            className={`gap-2 transition-all ${sizeClasses[size]} ${
              isLiked 
                ? 'text-red-600 hover:text-red-700 border-red-200 bg-red-50 hover:bg-red-100' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={handleLike}
            disabled={isLoading}
          >
            <Heart
              className={`transition-all ${
                isLiked 
                  ? 'fill-red-600 scale-110' 
                  : 'hover:scale-105'
              }`}
              size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16}
            />
            <span className="font-medium min-w-5">
              {likeCount}
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isLiked ? t('unlike') : t('like')}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}