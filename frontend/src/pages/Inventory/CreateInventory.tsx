import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import InventoryForm from '@/components/inventory/InventoryForm'
import { useTranslation } from 'react-i18next'

export default function CreateInventory() {
  const { t } = useTranslation()
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('backToDashboard')}
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">{t('createNewInventory')}</h1>
        <p className="text-muted-foreground">
          {t('createInventoryDescription')}
        </p>
      </div>

      {/* Form */}
      <InventoryForm />
    </div>
  )
}