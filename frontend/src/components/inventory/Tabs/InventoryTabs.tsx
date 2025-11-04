// frontend/src/components/inventory/Tabs/InventoryTabs.tsx
import { useState } from 'react'
import type { Inventory } from '@/types'
import ItemsTab from './ItemsTab'
import DiscussionTab from './DiscussionTab'
import SettingsTab from './SettingsTab'
import StatsTab from './StatsTab'
import { Pencil, Trash2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../../ui/button'
import { useDeleteInventoryMutation } from '@/features/inventory/inventoryApi'
import { toast } from 'sonner'

interface InventoryTabsProps {
  inventory: Inventory
}

const tabs = [
  { id: 'items', name: 'Items' },
  { id: 'discussion', name: 'Discussion' },
  { id: 'settings', name: 'Settings' },
  { id: 'stats', name: 'Statistics' },
] as const

type TabId = (typeof tabs)[number]['id']

export default function InventoryTabs({ inventory }: InventoryTabsProps) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabId>('items')
  const [deleteInventory, { isLoading }] = useDeleteInventoryMutation()

  // ✅ Handle delete logic
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this inventory?')) return

    try {
      await deleteInventory(inventory.id).unwrap()
      toast.success('Inventory deleted successfully')
      navigate('/dashboard')
    } catch (error) {
      console.error(error)
      toast.error('Failed to delete inventory')
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'items':
        return <ItemsTab inventory={inventory} />
      case 'discussion':
        return <DiscussionTab inventory={inventory} />
      case 'settings':
        return <SettingsTab inventory={inventory} />
      case 'stats':
        return <StatsTab inventory={inventory} />
      default:
        return null
    }
  }

  return (
    <div>
      {/* Tab Navigation */}
      <div className="border-b flex justify-between">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>

        {/* Buttons */}
        <div className="flex gap-2">
          <Button asChild>
            <Link to={`/inventory/${inventory.id}/edit`}>
              <Pencil size={16} />
              Edit Inventory
            </Link>
          </Button>

          <Button
            variant="destructive"
            className="flex items-center gap-2"
            onClick={handleDelete}
            disabled={isLoading}
          >
            <Trash2 size={16} />
            {isLoading ? 'Deleting...' : 'Delete Inventory'}
          </Button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="py-6">{renderTabContent()}</div>
    </div>
  )
}
