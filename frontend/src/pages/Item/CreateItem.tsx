// frontend/src/pages/Item/CreateItem.tsx
import { useParams, Navigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useGetInventoryQuery } from '@/features/inventory/inventoryApi'
import ItemForm from '@/components/items/ItemForm'
import LoadingSpinner from '@/components/common/LoadingSpinner'

export default function CreateItem() {
  const { id: inventoryId } = useParams<{ id: string }>()
  const { data: inventory, isLoading, error } = useGetInventoryQuery(inventoryId!)

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !inventory) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Link
          to={`/inventory/${inventory.id}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Inventory
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Add New Item</h1>
        <p className="text-muted-foreground">
          Add a new item to {inventory.title}
        </p>
      </div>

      {/* Form */}
      <ItemForm inventory={inventory} />
    </div>
  )
}