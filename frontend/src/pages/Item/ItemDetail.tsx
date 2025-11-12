// frontend/src/pages/Item/ItemDetail.tsx
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useGetItemQuery } from '@/features/items/itemsApi'
import { ArrowLeft, Calendar, User, ExternalLink, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import LikeButton from '@/components/items/LikeButton'
import { useAppSelector } from '@/app/hooks'
import { useTranslation } from 'react-i18next'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export default function ItemDetail() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAppSelector((state) => state.auth)

  const { data: item, isLoading, error } = useGetItemQuery(id!)

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-destructive">{t('itemNotFound')}</h2>
        <p className="text-muted-foreground mt-2">
          {t('itemNotFoundDescription')}
        </p>
        <Link
          to="/dashboard"
          className="mt-4 inline-flex items-center gap-2 text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('backToDashboard')}
        </Link>
      </div>
    )
  }

  const canEdit = user && item?.canWrite

  // Get all configured fields from inventory
  const configuredFields = [
    {
      type: 'string' as const,
      index: 1,
      name: item.inventory.string1Name,
      description: item.inventory.string1Description,
      value: item.string1Value,
      visible: item.inventory.string1Visible,
    },
    {
      type: 'string' as const,
      index: 2,
      name: item.inventory.string2Name,
      description: item.inventory.string2Description,
      value: item.string2Value,
      visible: item.inventory.string2Visible,
    },
    {
      type: 'string' as const,
      index: 3,
      name: item.inventory.string3Name,
      description: item.inventory.string3Description,
      value: item.string3Value,
      visible: item.inventory.string3Visible,
    },
    {
      type: 'text' as const,
      index: 1,
      name: item.inventory.text1Name,
      description: item.inventory.text1Description,
      value: item.text1Value,
      visible: item.inventory.text1Visible,
    },
    {
      type: 'text' as const,
      index: 2,
      name: item.inventory.text2Name,
      description: item.inventory.text2Description,
      value: item.text2Value,
      visible: item.inventory.text2Visible,
    },
    {
      type: 'text' as const,
      index: 3,
      name: item.inventory.text3Name,
      description: item.inventory.text3Description,
      value: item.text3Value,
      visible: item.inventory.text3Visible,
    },
    {
      type: 'number' as const,
      index: 1,
      name: item.inventory.number1Name,
      description: item.inventory.number1Description,
      value: item.number1Value,
      visible: item.inventory.number1Visible,
    },
    {
      type: 'number' as const,
      index: 2,
      name: item.inventory.number2Name,
      description: item.inventory.number2Description,
      value: item.number2Value,
      visible: item.inventory.number2Visible,
    },
    {
      type: 'number' as const,
      index: 3,
      name: item.inventory.number3Name,
      description: item.inventory.number3Description,
      value: item.number3Value,
      visible: item.inventory.number3Visible,
    },
    {
      type: 'boolean' as const,
      index: 1,
      name: item.inventory.boolean1Name,
      description: item.inventory.boolean1Description,
      value: item.boolean1Value,
      visible: item.inventory.boolean1Visible,
    },
    {
      type: 'boolean' as const,
      index: 2,
      name: item.inventory.boolean2Name,
      description: item.inventory.boolean2Description,
      value: item.boolean2Value,
      visible: item.inventory.boolean2Visible,
    },
    {
      type: 'boolean' as const,
      index: 3,
      name: item.inventory.boolean3Name,
      description: item.inventory.boolean3Description,
      value: item.boolean3Value,
      visible: item.inventory.boolean3Visible,
    },
    {
      type: 'link' as const,
      index: 1,
      name: item.inventory.link1Name,
      description: item.inventory.link1Description,
      value: item.link1Value,
      visible: item.inventory.link1Visible,
    },
    {
      type: 'link' as const,
      index: 2,
      name: item.inventory.link2Name,
      description: item.inventory.link2Description,
      value: item.link2Value,
      visible: item.inventory.link2Visible,
    },
    {
      type: 'link' as const,
      index: 3,
      name: item.inventory.link3Name,
      description: item.inventory.link3Description,
      value: item.link3Value,
      visible: item.inventory.link3Visible,
    },
  ].filter(field => field.name && field.value !== undefined && field.value !== null)

  const formatFieldValue = (field: typeof configuredFields[0]) => {
    if (field.value === undefined || field.value === null) return '-'

    switch (field.type) {
      case 'boolean':
        return field.value ? (
          <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
            {t('yes')}
          </Badge>
        ) : (
          <Badge variant="secondary">{t('no')}</Badge>
        )
      
      case 'link':
        return (
          <a 
            href={field.value as string} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline"
          >
            {t('openLink')}
            <ExternalLink className="h-3 w-3" />
          </a>
        )
      
      case 'text':
        return (
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {field.value as string}
          </div>
        )
      
      case 'number':
        return (
          <span className="font-mono text-sm">
            {field.value}
          </span>
        )
      
      default:
        return field.value as string
    }
  }

  return (
    <TooltipProvider>
      <div className="container mx-auto py-6 max-w-4xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <Link
                to={`/inventory/${item.inventoryId}`}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                {t('backToInventory')}
              </Link>
              
              <div className="flex items-start gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold">{item.customId}</h1>
                    <LikeButton
                      itemId={item.id}
                      initialLikeCount={item._count?.likes || 0}
                      initialIsLiked={item.likes?.some(like => like.userId === user?.id) || false}
                      size="lg"
                      variant="outline"
                    />
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{item.creator?.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                    {item.inventory.isPublic && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {t('public')}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {canEdit && (
                <Button onClick={() => navigate(`/items/${item.id}/edit`)}>
                  {t('editItem')}
                </Button>
              )}
            </div>
          </div>

          {/* Inventory Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="h-5 w-5" />
                {item.inventory.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                {item.inventory.description}
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {item.inventory.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Item Details */}
          <Card>
            <CardHeader>
              <CardTitle>{t('itemDetails')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {configuredFields.map((field, index) => (
                <div key={`${field.type}-${field.index}`}>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-1">
                      <div className="flex items-start gap-2">
                        <span className="text-sm font-medium text-foreground">
                          {field.name}
                        </span>
                        {field.description && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center text-xs cursor-help">
                                ?
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">{field.description}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </div>
                    <div className="md:col-span-3">
                      {formatFieldValue(field)}
                    </div>
                  </div>
                  {index < configuredFields.length - 1 && (
                    <Separator className="mt-4" />
                  )}
                </div>
              ))}
              
              {configuredFields.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  {t('noItemDetails')}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Likes Section */}
          {item.likes && item.likes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {t('likes')}
                  <Badge variant="secondary">{item._count?.likes || 0}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {item.likes.map((like) => (
                    <div key={like.id} className="flex items-center gap-3 py-2">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                        {like.user.avatar ? (
                          <img 
                            src={like.user.avatar} 
                            alt={like.user.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          like.user.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{like.user.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(like.createdAt).toLocaleDateString()} • {new Date(like.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}