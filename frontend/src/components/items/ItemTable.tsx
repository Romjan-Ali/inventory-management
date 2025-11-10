// frontend/src/components/items/ItemTable.tsx
import React, { useState } from 'react'
import type { Inventory, Item } from '@/types'
import { Checkbox } from '@/components/ui/checkbox'
import { ChevronsUpDown, Edit, Trash2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import LikeButton from './LikeButton'
import { useAppSelector } from '@/app/hooks'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'

interface ItemTableProps {
  inventory: Inventory
  items: Item[]
  totalItems: number
  page: number
  onPageChange: (page: number) => void
  onItemDelete: (itemId: string) => Promise<void>
  onItemsUpdate?: (itemIds: string[], updates: Partial<Item>) => Promise<void>
  canEdit?: boolean
}

export default function ItemTable({
  inventory,
  items,
  totalItems,
  page,
  onPageChange,
  onItemDelete,
  canEdit = false,
}: ItemTableProps) {
  const { t, i18n } = useTranslation()
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [isDeleting, setIsDeleting] = useState<boolean>(false)
  const navigate = useNavigate()
  const { user } = useAppSelector((state) => state.auth)

  // Get visible custom fields
  const visibleFields = [
    {
      type: 'string' as const,
      index: 1,
      name: inventory.string1Name,
      visible: inventory.string1Visible,
      order: inventory.string1Order,
    },
    {
      type: 'string' as const,
      index: 2,
      name: inventory.string2Name,
      visible: inventory.string2Visible,
      order: inventory.string2Order,
    },
    {
      type: 'string' as const,
      index: 3,
      name: inventory.string3Name,
      visible: inventory.string3Visible,
      order: inventory.string3Order,
    },
    {
      type: 'text' as const,
      index: 1,
      name: inventory.text1Name,
      visible: inventory.text1Visible,
      order: inventory.text1Order,
    },
    {
      type: 'text' as const,
      index: 2,
      name: inventory.text2Name,
      visible: inventory.text2Visible,
      order: inventory.text2Order,
    },
    {
      type: 'text' as const,
      index: 3,
      name: inventory.text3Name,
      visible: inventory.text3Visible,
      order: inventory.text3Order,
    },
    {
      type: 'number' as const,
      index: 1,
      name: inventory.number1Name,
      visible: inventory.number1Visible,
      order: inventory.number1Order,
    },
    {
      type: 'number' as const,
      index: 2,
      name: inventory.number2Name,
      visible: inventory.number2Visible,
      order: inventory.number2Order,
    },
    {
      type: 'number' as const,
      index: 3,
      name: inventory.number3Name,
      visible: inventory.number3Visible,
      order: inventory.number3Order,
    },
    {
      type: 'boolean' as const,
      index: 1,
      name: inventory.boolean1Name,
      visible: inventory.boolean1Visible,
      order: inventory.boolean1Order,
    },
    {
      type: 'boolean' as const,
      index: 2,
      name: inventory.boolean2Name,
      visible: inventory.boolean2Visible,
      order: inventory.boolean2Order,
    },
    {
      type: 'boolean' as const,
      index: 3,
      name: inventory.boolean3Name,
      visible: inventory.boolean3Visible,
      order: inventory.boolean3Order,
    },
    {
      type: 'link' as const,
      index: 1,
      name: inventory.link1Name,
      visible: inventory.link1Visible,
      order: inventory.link1Order,
    },
    {
      type: 'link' as const,
      index: 2,
      name: inventory.link2Name,
      visible: inventory.link2Visible,
      order: inventory.link2Order,
    },
    {
      type: 'link' as const,
      index: 3,
      name: inventory.link3Name,
      visible: inventory.link3Visible,
      order: inventory.link3Order,
    },
  ]
    .filter((field) => field.name && field.visible)
    .sort((a, b) => a.order - b.order)

  const toggleItemSelection = (itemId: string) => {
    const newSelection = new Set(selectedItems)
    if (newSelection.has(itemId)) {
      newSelection.delete(itemId)
    } else {
      newSelection.add(itemId)
    }
    setSelectedItems(newSelection)
  }

  const toggleAllSelection = () => {
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(items.map((item) => item.id)))
    }
  }

  const getFieldValue = (
    item: Item,
    fieldType: string,
    index: number
  ): React.ReactNode => {
    const value = item[`${fieldType}${index}Value` as keyof Item]

    if (fieldType === 'boolean') {
      return value ? (
        <Badge
          variant="default"
          className="bg-green-100 text-green-800 hover:bg-green-100"
        >
          {t('yes')}
        </Badge>
      ) : (
        <Badge variant="secondary">{t('no')}</Badge>
      )
    }

    if (fieldType === 'link' && typeof value === 'string') {
      return (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 hover:underline text-sm"
          onClick={(e) => e.stopPropagation()}
        >
          {t('viewLink')}
        </a>
      )
    }

    if (fieldType === 'text' && typeof value === 'string') {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="line-clamp-2 cursor-help">
              {value.substring(0, 50)}
              {value.length > 50 ? '...' : ''}
            </span>
          </TooltipTrigger>
          <TooltipContent className="max-w-md">
            <p className="whitespace-pre-wrap">{value}</p>
          </TooltipContent>
        </Tooltip>
      )
    }

    // Default case: render safely
    if (typeof value === 'string' || typeof value === 'number') {
      return value
    }

    return '-'
  }

  const handleBulkDelete = async () => {
    if (!confirm(t('confirmDeleteItems', { count: selectedItems.size }))) {
      return
    }

    setIsDeleting(true)

    try {
      const deletePromises = Array.from(selectedItems).map((itemId) =>
        onItemDelete(itemId)
      )
      await Promise.all(deletePromises)
      setSelectedItems(new Set())
      toast.success(t('itemsDeleted', { count: selectedItems.size }))
    } catch (error) {
      console.error('Failed to delete items:', error)
      toast.error(t('failedDeleteItems'))
    } finally {
      setIsDeleting(false)
    }
  }

  const handleItemAction = (
    action: 'view' | 'edit' | 'delete',
    itemId: string,
    e?: React.MouseEvent
  ) => {
    e?.stopPropagation()

    switch (action) {
      case 'view':
        navigate(`/items/${itemId}`)
        break
      case 'edit':
        navigate(`/items/${itemId}/edit`)
        break
      case 'delete':
        if (confirm(t('confirmDeleteItem'))) {
          onItemDelete(itemId)
        }
        break
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      i18n.resolvedLanguage || 'en',
      {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Selection Toolbar - Only shows when items are selected */}
        {selectedItems.size > 0 && (
          <div className="flex items-center justify-between rounded-lg border bg-card p-4">
            <span className="text-sm font-medium">
              {selectedItems.size}{' '}
              {selectedItems.size === 1 ? t('item') : t('items')}{' '}
              {t('selected')}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                    {t('deleting')}
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t('deleteSelected')}
                  </>
                )}
              </Button>
              {canEdit && selectedItems.size === 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleItemAction('edit', [...selectedItems][0])
                  }
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {t('editSelected')}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Table */}
        <div className="rounded-lg border bg-background">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="w-12 px-4 py-3 text-left">
                    <Checkbox
                      checked={
                        selectedItems.size === items.length && items.length > 0
                      }
                      onCheckedChange={toggleAllSelection}
                    />
                  </th>
                  <th className="px-4 py-3 text-left font-medium">
                    <div className="flex items-center gap-1">
                      {t('customId')}
                      <ChevronsUpDown className="h-4 w-4 opacity-50" />
                    </div>
                  </th>
                  {visibleFields.map((field) => (
                    <th
                      key={`${field.type}-${field.index}`}
                      className="px-4 py-3 text-left font-medium"
                    >
                      <div className="flex items-center gap-1">
                        {field.name}
                        <ChevronsUpDown className="h-4 w-4 opacity-50" />
                      </div>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left font-medium">
                    {t('likes')}
                  </th>
                  <th className="px-4 py-3 text-left font-medium">
                    {t('created')}
                  </th>
                  <th className="w-12 px-4 py-3 text-left font-medium">
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b hover:bg-muted/30 transition-colors cursor-pointer group"
                    onClick={() => navigate(`/items/${item.id}`)}
                  >
                    {/* Checkbox */}
                    <td
                      className="px-4 py-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={selectedItems.has(item.id)}
                        onCheckedChange={() => toggleItemSelection(item.id)}
                      />
                    </td>

                    {/* Custom ID */}
                    <td className="px-4 py-3 font-medium">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="hover:text-primary transition-colors font-mono text-sm">
                            {item.customId}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t('clickToViewDetails')}</p>
                        </TooltipContent>
                      </Tooltip>
                    </td>

                    {/* Custom Fields */}
                    {visibleFields.map((field) => (
                      <td
                        key={`${field.type}-${field.index}`}
                        className="px-4 py-3"
                      >
                        {getFieldValue(item, field.type, field.index)}
                      </td>
                    ))}

                    {/* Likes */}
                    <td
                      className="px-4 py-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <LikeButton
                        itemId={item.id}
                        initialLikeCount={item._count?.likes || 0}
                        initialIsLiked={
                          item.likes?.some(
                            (like) => like.userId === user?.id
                          ) || false
                        }
                        size="sm"
                        variant="ghost"
                      />
                    </td>

                    {/* Created Date */}
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {formatDate(item.createdAt)}
                    </td>

                    {/* Actions */}
                    <td
                      className="px-4 py-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <span className="sr-only">{t('openMenu')}</span>
                            <ChevronsUpDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleItemAction('view', item.id)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            {t('view')}
                          </DropdownMenuItem>
                          {canEdit && (
                            <>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleItemAction('edit', item.id)
                                }
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                {t('edit')}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() =>
                                  handleItemAction('delete', item.id)
                                }
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                {t('delete')}
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {items.length === 0 && (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                {t('noItemsFound')}
              </div>
              {canEdit && (
                <Button
                  onClick={() =>
                    navigate(`/inventory/${inventory.id}/items/new`)
                  }
                >
                  {t('createFirstItem')}
                </Button>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalItems > 0 && (
            <div className="flex items-center justify-between border-t px-4 py-3">
              <div className="text-sm text-muted-foreground">
                {t('showingItems', {
                  from: (page - 1) * 50 + 1,
                  to: Math.min(page * 50, totalItems),
                  total: totalItems,
                })}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(page - 1)}
                  disabled={page === 1}
                >
                  {t('previous')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(page + 1)}
                  disabled={page * 50 >= totalItems}
                >
                  {t('next')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}
