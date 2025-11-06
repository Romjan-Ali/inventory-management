// frontend/src/pages/Item/EditItem.tsx
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useGetItemQuery } from '@/features/items/itemsApi'
import { useGetInventoryQuery } from '@/features/inventory/inventoryApi'
import { ArrowLeft } from 'lucide-react'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ItemForm from '@/components/items/ItemForm'
import { useAppSelector } from '@/app/hooks'
import { useTranslation } from 'react-i18next'

export default function EditItem() {
  const { t } = useTranslation()
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()

  // Only run if we have an id
  const {
    data: item,
    isLoading: itemLoading,
    error: itemError,
  } = useGetItemQuery(id ?? '', {
    skip: !id,
  })

  const inventoryId = item?.inventoryId

  // Only run if we have an inventoryId
  const { data: inventory, isLoading: inventoryLoading } = useGetInventoryQuery(
    inventoryId ?? '',
    {
      skip: !inventoryId,
    }
  )

  const { user } = useAppSelector((state) => state.auth)

  const isLoading = itemLoading || inventoryLoading

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (itemError || !item) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-destructive">{t('itemNotFound')}</h2>
        <p className="text-muted-foreground mt-2">
          {t('itemNotFoundDescription')}
        </p>
        <Link
          to="/dashboard"
          className="mt-4 inline-flex items-center gap-2 text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('backToDashboard')}
        </Link>
      </div>
    )
  }

  if (!inventory) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-destructive">
          {t('inventoryNotFound')}
        </h2>
        <p className="text-muted-foreground mt-2">
          {t('inventoryNotFoundDescription')}
        </p>
        <Link
          to="/dashboard"
          className="mt-4 inline-flex items-center gap-2 text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('backToDashboard')}
        </Link>
      </div>
    )
  }

  // Check if user can edit this item
  const canEdit = user?.id === item.creatorId || user?.isAdmin

  if (!canEdit) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-destructive">{t('accessDenied')}</h2>
        <p className="text-muted-foreground mt-2">
          {t('noPermissionEdit')}
        </p>
        <Link
          to={`/inventory/${item.inventoryId}`}
          className="mt-4 inline-flex items-center gap-2 text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('backToInventory')}
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2 gap-4">
          <Link
            to={`/inventory/${item.inventoryId}`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('backToInventory')}
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{t('editItem')}</h1>
            <p className="text-muted-foreground">{t('updateItemDetails')}</p>
          </div>
        </div>

        {/* Item Form */}
        <ItemForm
          inventory={inventory}
          item={item}
          onSuccess={() => navigate(`/inventory/${item.inventoryId}`)}
        />
      </div>
    </div>
  )
}
