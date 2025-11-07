// frontend/src/pages/Dashboard/Dashboard.tsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppSelector } from '@/app/hooks'
import { useGetInventoriesQuery } from '@/features/inventory/inventoryApi'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { Plus, FolderOpen, Users, List, LayoutGrid } from 'lucide-react'
import InventoryCards from '@/components/inventory/View/InventoryCards'
import InventoryTable from '@/components/inventory/View/InventoryTable'
import { useTranslation } from 'react-i18next'
import SmartPagination from '@/components/common/SmartPagination'

export default function Dashboard() {
  const { t } = useTranslation()
  const { user } = useAppSelector((state) => state.auth)
  const [activeTab, setActiveTab] = useState<'owned' | 'accessible'>('owned')
  const [viewType, setViewType] = useState<'table' | 'card'>('table')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [limit] = useState<number>(20)

  const { data: ownedInventoriesData, isLoading: isLoadingOwnedInventories } =
    useGetInventoriesQuery({
      type: 'owned',
      page: currentPage,
      limit,
    })

  const { data: sharedInventoriesData, isLoading: isLoadingSharedInventories } =
    useGetInventoriesQuery({
      type: 'shared',
      page: currentPage,
      limit,
    })

  const isLoading = isLoadingOwnedInventories || isLoadingSharedInventories

  const ownedInventories = user ? ownedInventoriesData?.inventories || [] : []

  const accessibleInventories = sharedInventoriesData?.inventories || []

  const displayInventories =
    activeTab === 'owned' ? ownedInventories : accessibleInventories

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('dashboard')}
          </h1>
          <p className="text-muted-foreground">
            {t('welcomeBack', { name: user?.name || '' })}
          </p>
        </div>
        <Link
          to="/inventory/new"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-background shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          <Plus className="h-4 w-4" />
          {t('newInventory')}
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-3">
            <FolderOpen className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">
                {ownedInventoriesData?.total || 0}
              </p>
              <p className="text-sm text-muted-foreground">
                {t('myInventories')}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">
                {sharedInventoriesData?.total || 0}
              </p>
              <p className="text-sm text-muted-foreground">
                {t('sharedWithMe')}
              </p>
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
                {(user ? ownedInventoriesData?.total || 0 : 0) +
                  (sharedInventoriesData?.total || 0)}
              </p>
              <p className="text-sm text-muted-foreground">{t('totalItems')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b flex justify-between">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('owned')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'owned'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            {t('myInventories')} ({ownedInventoriesData?.total || 0})
          </button>
          <button
            onClick={() => setActiveTab('accessible')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'accessible'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            {t('sharedWithMe')} ({sharedInventoriesData?.total || 0})
          </button>
        </nav>
        <div className="flex items-center">
          <div className="flex rounded-full border overflow-hidden">
            <button
              title={t('viewAsTable')}
              className={`px-4 py-1 text-accent ${
                viewType === 'table' ? 'bg-accent-foreground' : 'text-primary'
              }`}
              onClick={() => setViewType('table')}
            >
              <List size={16} />
            </button>
            <button
              title={t('viewAsCard')}
              className={`px-4 py-1 text-accent ${
                viewType === 'card' ? 'bg-accent-foreground' : 'text-primary'
              }`}
              onClick={() => setViewType('card')}
            >
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Inventories List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div
          className={
            viewType === 'table'
              ? ''
              : 'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'
          }
        >
          {viewType === 'card' && (
            <InventoryCards inventories={displayInventories} />
          )}

          {viewType === 'table' && (
            <InventoryTable inventories={displayInventories} />
          )}

          <SmartPagination
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            totalPages={
              activeTab === 'owned'
                ? ownedInventoriesData?.pagination.totalPages || 0
                : sharedInventoriesData?.pagination.totalPages || 0
            }
          />

          {displayInventories.length === 0 && (
            <div className="col-span-full text-center py-12">
              <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">
                {t('noInventoriesFound')}
              </h3>
              <p className="text-muted-foreground mt-2">
                {activeTab === 'owned'
                  ? t('getStartedByCreating')
                  : t('noOneHasShared')}
              </p>
              {activeTab === 'owned' && (
                <Link
                  to="/inventory/new"
                  className="mt-4 inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium shadow-sm text-background bg-primary hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4" />
                  {t('createInventory')}
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
