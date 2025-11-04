// frontend/src/pages/Inventory/InventoryPage.tsx
import { useParams } from 'react-router-dom'
import { useGetInventoryQuery } from '@/features/inventory/inventoryApi'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import InventoryTabs from '@/components/inventory/Tabs/InventoryTabs'
import { ArrowLeft} from 'lucide-react'
import { Link } from 'react-router-dom'

export default function InventoryPage() {  
  const { id } = useParams<{ id: string }>()
  const { data: inventory, isLoading, error } = useGetInventoryQuery(id!)

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !inventory) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-destructive">
          Inventory Not Found
        </h2>
        <p className="text-muted-foreground mt-2">
          The inventory you're looking for doesn't exist or you don't have
          access to it.
        </p>
        <Link
          to="/dashboard"
          className="mt-4 inline-flex items-center gap-2 text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold tracking-tight">
              {inventory.title}
            </h1>
            {inventory.isPublic && (
              <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                Public
              </span>
            )}
          </div>
          <p className="text-muted-foreground max-w-2xl">
            {inventory.description}
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Category: {inventory.category}</span>
            <span>•</span>
            <span>Items: {inventory._count?.items || 0}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <InventoryTabs inventory={inventory} />
    </div>
  )
}
