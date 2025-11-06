// frontend/src/components/items/ItemTable.tsx
import { useState } from 'react'
import type { Inventory, Item } from '@/types'
import { Checkbox } from '@/components/ui/checkbox'
import { ChevronsUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

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
  ].filter((field) => field.name && field.visible).sort((a, b) => a.order - b.order)

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

  const getFieldValue = (item: Item, fieldType: string, index: number) => {
    const value = item[`${fieldType}${index}Value` as keyof Item]

    if (fieldType === 'boolean') {
      return value ? t('yes') : t('no')
    }

    return value || '-'
  }  

  const handleBulkDelete = async () => {
    if (!confirm(t('confirmDeleteItems', { count: selectedItems.size }))) {
      return
    }

    setIsDeleting(true)
    
    try {
      const deletePromises = Array.from(selectedItems).map(itemId => onItemDelete(itemId))
      await Promise.all(deletePromises)
      setSelectedItems(new Set())
      toast.success(t('itemDeleted'))
    } catch (error) {
      console.error('Failed to delete items:', error)
      toast.error(t('failedDeleteItems'))
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div className="space-y-4">
        {/* Selection Toolbar - Only shows when items are selected */}
        {selectedItems.size > 0 && (
          <div className="flex items-center gap-4 rounded-lg border bg-card p-4">
            <span className="text-sm font-medium">
              {selectedItems.size} {selectedItems.size > 1 ? t('items') : t('items').slice(0, -1)} {t('selected')}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkDelete}
                disabled={isDeleting}
              >
                {isDeleting ? t('deletingItems') : t('deleteSelected')}
              </Button>
              {canEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/items/${[...selectedItems][0]}/edit`)}
                  disabled={selectedItems.size > 1}
                >
                  {t('editSelected')}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Table */}
        <div className="rounded-lg border">
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
                      {t('customIdHeaderCol')}
                      <ChevronsUpDown className="h-4 w-4" />
                    </div>
                  </th>
                  {visibleFields.map((field) => (
                    <th
                      key={`${field.type}-${field.index}`}
                      className="px-4 py-3 text-left font-medium"
                    >
                      {field.name}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left font-medium">{t('createdCol')}</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={selectedItems.has(item.id)}
                        onCheckedChange={() => toggleItemSelection(item.id)}
                      />
                    </td>
                    <td className="px-4 py-3 font-medium">{item.customId}</td>
                    {visibleFields.map((field) => (
                      <td
                        key={`${field.type}-${field.index}`}
                        className="px-4 py-3"
                      >
                        {getFieldValue(item, field.type, field.index)}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(item.createdAt).toLocaleDateString(i18n.resolvedLanguage || 'en')}
                    </td>                    
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {items.length === 0 && (
            <div className="text-center py-12">
              <div className="text-muted-foreground">
                {t('noItemsFound')}
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalItems > 0 && (
            <div className="flex items-center justify-between border-t px-4 py-3">
              <div className="text-sm text-muted-foreground">
                {t('showingRangeOf', { from: (page - 1) * 50 + 1, to: Math.min(page * 50, totalItems), total: totalItems })}
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
    </>
  )
}