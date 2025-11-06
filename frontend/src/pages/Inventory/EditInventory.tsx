// frontend/src/pages/Inventory/EditInventory.tsx
import { useParams, Navigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useGetInventoryQuery } from '@/features/inventory/inventoryApi'
import InventoryForm from '@/components/inventory/InventoryForm'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { useTranslation } from 'react-i18next'

export default function EditInventory() {
  const { t } = useTranslation()
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
    return <Navigate to="/dashboard" replace />
  }

  const canEdit = inventory.canWrite

  if (!canEdit) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-destructive">{t('accessDenied')}</h2>
        <p className="text-muted-foreground mt-2">
          {t('noPermissionEdit')}
        </p>
        <Link
          to={`/inventory/${inventory.id}`}
          className="mt-4 inline-flex items-center gap-2 text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('backToInventory')}
        </Link>
      </div>
    )
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
          {t('backToInventory')}
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">{t('editInventory')}</h1>
        <p className="text-muted-foreground">
          {t('settingsSubtitle')}
        </p>
      </div>

      {/* Form */}
      <InventoryForm inventory={inventory} />
    </div>
  )
}
