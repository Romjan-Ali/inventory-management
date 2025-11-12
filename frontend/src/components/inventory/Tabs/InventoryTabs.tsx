// frontend/src/components/inventory/Tabs/InventoryTabs.tsx
import { useState } from 'react'
import type { Inventory } from '@/types'
import ItemsTab from './ItemsTab'
import DiscussionTab from './DiscussionTab'
import SettingsTab from './SettingsTab'
import StatsTab from './StatsTab'
import { useDeleteInventoryMutation } from '@/features/inventory/inventoryApi'
import { Pencil, Trash2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../../ui/button'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { useAppSelector } from '@/app/hooks'

interface InventoryTabsProps {
  inventory: Inventory
}

export default function InventoryTabs({ inventory }: InventoryTabsProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAppSelector((state) => state.auth)
  const [deleteInventory, { isLoading }] = useDeleteInventoryMutation()

  const isCreator = user?.id === inventory.creatorId
  const isAdmin = user?.isAdmin  

  const tabs = (isCreator || isAdmin) ?
      [
    { id: 'items', nameKey: 'tabItems' },
    { id: 'discussion', nameKey: 'tabDiscussion' },
    { id: 'settings', nameKey: 'tabSettings' },
    { id: 'stats', nameKey: 'tabStats' },
  ] :
      [
    { id: 'items', nameKey: 'tabItems' },
    { id: 'discussion', nameKey: 'tabDiscussion' },
  ]

  type TabId = (typeof tabs)[number]['id']

  const [activeTab, setActiveTab] = useState<TabId>('items')

  // ✅ Handle delete logic
  const handleDelete = async () => {
    if (!confirm(t('confirmDeleteInventory'))) return

    try {
      await deleteInventory(inventory.id).unwrap()
      toast.success(t('inventoryDeleted'))
      navigate('/dashboard')
    } catch (error) {
      console.error(error)
      toast.error(t('inventoryDeleteFailed'))
    }
  }

  const renderTabContent = () => {
    if (isCreator || isAdmin) {
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
    } else {
      switch (activeTab) {
        case 'items':
          return <ItemsTab inventory={inventory} />
        case 'discussion':
          return <DiscussionTab inventory={inventory} />
        default:
          return null
      }
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
              {t(tab.nameKey)}
            </button>
          ))}
        </nav>

        {/* Buttons */}
        <div className="flex gap-2">
          <Button asChild>
            <Link to={`/inventory/${inventory.id}/edit`}>
              <Pencil size={16} />
              {t('editInventory')}
            </Link>
          </Button>

          <Button
            variant="destructive"
            className="flex items-center gap-2"
            onClick={handleDelete}
            disabled={isLoading}
          >
            <Trash2 size={16} />
            {isLoading ? t('deleting') : t('deleteInventory')}
          </Button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="py-6">{renderTabContent()}</div>
    </div>
  )
}
