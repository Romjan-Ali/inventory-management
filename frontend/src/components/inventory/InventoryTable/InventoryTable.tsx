// frontend/src/components/inventory/InventoryTable/InventoryTable.tsx
import { useState } from 'react'
import type { Inventory, Item } from '@/types'
import { Checkbox } from '@/components/ui/checkbox'
import { ChevronsUpDown, Edit, Trash2, MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import BulkEditModal from './BulkEditModal'

interface InventoryTableProps {
  inventory: Inventory
  items: Item[]
  totalItems: number
  page: number
  onPageChange: (page: number) => void
  onItemDelete: (itemId: string) => Promise<void>
  onItemsUpdate?: (itemIds: string[], updates: Partial<Item>) => Promise<void>
  canEdit?: boolean
}

export default function InventoryTable({
  inventory,
  items,
  totalItems,
  page,
  onPageChange,
  onItemDelete,
  onItemsUpdate,
  canEdit = false,
}: InventoryTableProps) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [showBulkEdit, setShowBulkEdit] = useState(false)
  const [isBulkEditing, setIsBulkEditing] = useState(false)
  const navigate = useNavigate()

  // Get visible custom fields
  const visibleFields = [
    {
      type: 'string' as const,
      index: 1,
      name: inventory.string1Name,
      visible: inventory.string1Visible,
    },
    {
      type: 'string' as const,
      index: 2,
      name: inventory.string2Name,
      visible: inventory.string2Visible,
    },
    {
      type: 'string' as const,
      index: 3,
      name: inventory.string3Name,
      visible: inventory.string3Visible,
    },
    {
      type: 'text' as const,
      index: 1,
      name: inventory.text1Name,
      visible: inventory.text1Visible,
    },
    {
      type: 'text' as const,
      index: 2,
      name: inventory.text2Name,
      visible: inventory.text2Visible,
    },
    {
      type: 'text' as const,
      index: 3,
      name: inventory.text3Name,
      visible: inventory.text3Visible,
    },
    {
      type: 'number' as const,
      index: 1,
      name: inventory.number1Name,
      visible: inventory.number1Visible,
    },
    {
      type: 'number' as const,
      index: 2,
      name: inventory.number2Name,
      visible: inventory.number2Visible,
    },
    {
      type: 'number' as const,
      index: 3,
      name: inventory.number3Name,
      visible: inventory.number3Visible,
    },
    {
      type: 'boolean' as const,
      index: 1,
      name: inventory.boolean1Name,
      visible: inventory.boolean1Visible,
    },
    {
      type: 'boolean' as const,
      index: 2,
      name: inventory.boolean2Name,
      visible: inventory.boolean2Visible,
    },
    {
      type: 'boolean' as const,
      index: 3,
      name: inventory.boolean3Name,
      visible: inventory.boolean3Visible,
    },
    {
      type: 'link' as const,
      index: 1,
      name: inventory.link1Name,
      visible: inventory.link1Visible,
    },
    {
      type: 'link' as const,
      index: 2,
      name: inventory.link2Name,
      visible: inventory.link2Visible,
    },
    {
      type: 'link' as const,
      index: 3,
      name: inventory.link3Name,
      visible: inventory.link3Visible,
    },
  ].filter((field) => field.name && field.visible)

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
      return value ? 'Yes' : 'No'
    }

    return value || '-'
  }

  const handleEditItem = (itemId: string) => {
    navigate(`/items/${itemId}/edit`)
  }

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      return
    }

    setIsDeleting(itemId)
    try {
      await onItemDelete(itemId)
      // Remove from selection if it was selected
      const newSelection = new Set(selectedItems)
      newSelection.delete(itemId)
      setSelectedItems(newSelection)
    } catch (error) {
      console.error('Failed to delete item:', error)
      alert('Failed to delete item. Please try again.')
    } finally {
      setIsDeleting(null)
    }
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedItems.size} items? This action cannot be undone.`)) {
      return
    }

    try {
      const deletePromises = Array.from(selectedItems).map(itemId => onItemDelete(itemId))
      await Promise.all(deletePromises)
      setSelectedItems(new Set())
    } catch (error) {
      console.error('Failed to delete items:', error)
      alert('Failed to delete some items. Please try again.')
    }
  }

  const handleBulkEdit = () => {
    setShowBulkEdit(true)
  }

  const handleBulkUpdate = async (updates: Partial<Item>) => {
    if (!onItemsUpdate) {
      console.error('onItemsUpdate function is not provided')
      return
    }

    setIsBulkEditing(true)
    try {
      await onItemsUpdate(Array.from(selectedItems), updates)
      setShowBulkEdit(false)
      setSelectedItems(new Set())
    } catch (error) {
      console.error('Failed to update items:', error)
      alert('Failed to update items. Please try again.')
    } finally {
      setIsBulkEditing(false)
    }
  }

  return (
    <>
      <div className="space-y-4">
        {/* Selection Toolbar - Only shows when items are selected */}
        {selectedItems.size > 0 && (
          <div className="flex items-center gap-4 rounded-lg border bg-card p-4">
            <span className="text-sm font-medium">
              {selectedItems.size} item{selectedItems.size > 1 ? 's' : ''}{' '}
              selected
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkDelete}
                disabled={isDeleting !== null}
              >
                {isDeleting ? 'Deleting...' : 'Delete Selected'}
              </Button>
              {canEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkEdit}
                >
                  Edit Selected
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
                      Custom ID
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
                  <th className="px-4 py-3 text-left font-medium">Created</th>
                  {canEdit && (
                    <th className="w-12 px-4 py-3 text-left font-medium">
                      Actions
                    </th>
                  )}
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
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    {canEdit && (
                      <td className="px-4 py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEditItem(item.id)}
                              className="flex items-center gap-2"
                            >
                              <Edit className="h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteItem(item.id)}
                              disabled={isDeleting === item.id}
                              className="flex items-center gap-2 text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                              {isDeleting === item.id ? 'Deleting...' : 'Delete'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {items.length === 0 && (
            <div className="text-center py-12">
              <div className="text-muted-foreground">
                No items found in this inventory.
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalItems > 0 && (
            <div className="flex items-center justify-between border-t px-4 py-3">
              <div className="text-sm text-muted-foreground">
                Showing {(page - 1) * 50 + 1} to {Math.min(page * 50, totalItems)}{' '}
                of {totalItems} items
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(page + 1)}
                  disabled={page * 50 >= totalItems}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bulk Edit Modal */}
      {showBulkEdit && (
        <BulkEditModal
          inventory={inventory}
          selectedCount={selectedItems.size}
          onClose={() => setShowBulkEdit(false)}
          onSave={handleBulkUpdate}
          isSaving={isBulkEditing}
        />
      )}
    </>
  )
}