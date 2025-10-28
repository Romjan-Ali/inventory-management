// frontend/src/pages/Dashboard/Dashboard.tsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppSelector } from '@/app/hooks'
import { useGetInventoriesQuery } from '@/features/inventory/inventoryApi'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { Plus, FolderOpen, Users } from 'lucide-react'

export default function Dashboard() {
  const { user } = useAppSelector((state) => state.auth)
  const [activeTab, setActiveTab] = useState<'owned' | 'accessible'>('owned')
  
  const { data: inventoriesData, isLoading } = useGetInventoriesQuery({
    page: 1,
    limit: 50,
  })

  const ownedInventories = inventoriesData?.inventories.filter(
    inv => inv.creatorId === user?.id
  ) || []

  const accessibleInventories = inventoriesData?.inventories.filter(
    inv => inv.creatorId !== user?.id
  ) || []

  const displayInventories = activeTab === 'owned' ? ownedInventories : accessibleInventories

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}! Manage your inventories and items.
          </p>
        </div>
        <Link
          to="/inventory/new"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-background shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          <Plus className="h-4 w-4" />
          New Inventory
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-3">
            <FolderOpen className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{ownedInventories.length}</p>
              <p className="text-sm text-muted-foreground">My Inventories</p>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{accessibleInventories.length}</p>
              <p className="text-sm text-muted-foreground">Shared with Me</p>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-background text-sm font-bold">Σ</span>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {inventoriesData?.total || 0}
              </p>
              <p className="text-sm text-muted-foreground">Total Items</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('owned')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'owned'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            My Inventories ({ownedInventories.length})
          </button>
          <button
            onClick={() => setActiveTab('accessible')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'accessible'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            Shared with Me ({accessibleInventories.length})
          </button>
        </nav>
      </div>

      {/* Inventories List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayInventories.map((inventory) => (
            <InventoryCard key={inventory.id} inventory={inventory} />
          ))}
          
          {displayInventories.length === 0 && (
            <div className="col-span-full text-center py-12">
              <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No inventories found</h3>
              <p className="text-muted-foreground mt-2">
                {activeTab === 'owned' 
                  ? "Get started by creating your first inventory."
                  : "No one has shared any inventories with you yet."
                }
              </p>
              {activeTab === 'owned' && (
                <Link
                  to="/inventory/new"
                  className="mt-4 inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium shadow-sm text-background bg-primary hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4" />
                  Create Inventory
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Inventory Card Component
function InventoryCard({ inventory }: { inventory: any }) {
  return (
    <Link
      to={`/inventory/${inventory.id}`}
      className="block rounded-lg border bg-card p-6 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="font-semibold text-lg leading-6">{inventory.title}</h3>
        {inventory.isPublic && (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
            Public
          </span>
        )}
      </div>
      
      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
        {inventory.description}
      </p>
      
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{inventory.category}</span>
        <span>{inventory._count?.items || 0} items</span>
      </div>
      
      {inventory.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1">
          {inventory.tags.slice(0, 3).map((tag: string) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600"
            >
              {tag}
            </span>
          ))}
          {inventory.tags.length > 3 && (
            <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
              +{inventory.tags.length - 3}
            </span>
          )}
        </div>
      )}
    </Link>
  )
}