// frontend/src/components/inventory/Tabs/ItemsTab.tsx
import { useState } from 'react'
import type { Inventory } from '@/types'
import ItemTable from '../../items/ItemTable'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  useGetInventoryItemsQuery,
  useDeleteItemMutation,
} from '@/features/items/itemsApi'
import { useAppSelector } from '@/app/hooks'

interface ItemsTabProps {
  inventory: Inventory
}

export default function ItemsTab({ inventory }: ItemsTabProps) {
  const [page, setPage] = useState(1)
  const {
    data: itemsData,
    isLoading,
    error,
  } = useGetInventoryItemsQuery({
    inventoryId: inventory.id,
    page,
    limit: 50,
  })

  const [deleteItem] = useDeleteItemMutation()
  const { user } = useAppSelector((state) => state.auth)

  const items = itemsData?.items || []
  const totalItems = itemsData?.total || 0

  // Check if user can edit items
  const canEdit =
    user?.id === inventory.creatorId ||
    user?.isAdmin ||
    inventory.isPublic ||
    // Add logic to check if user has write access via access list
    false  

  const handleItemDelete = async (itemId: string) => {
    try {
      await deleteItem(itemId).unwrap()
      // The cache will be automatically invalidated due to the tag system
    } catch (error) {
      console.error('Failed to delete item:', error)
      throw error // Re-throw to handle in ItemTable
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-muted-foreground">Loading items...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-destructive">
          Failed to load items. Please try again.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Item button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Items</h2>
          <p className="text-muted-foreground">
            Manage items in this inventory
          </p>
        </div>
        {canEdit && (
          <Link to={`/inventory/${inventory.id}/items/new`}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </Link>
        )}
      </div>

      {/* Inventory Table */}
      <ItemTable
        inventory={inventory}
        items={items}
        totalItems={totalItems}
        page={page}
        onPageChange={setPage}
        onItemDelete={handleItemDelete}
        canEdit={canEdit}
      />
    </div>
  )
}
