// frontend/src/components/inventory/AutoSaveStatus.tsx
import { Check, AlertCircle, Clock, Save } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface AutoSaveStatusProps {
  isSaving: boolean
  lastSaved: Date | null
  isError: boolean
  hasUnsavedChanges: boolean
  onRetry?: () => void
}

export default function AutoSaveStatus({
  isSaving,
  lastSaved,
  isError,
  hasUnsavedChanges,
  onRetry,
}: AutoSaveStatusProps) {
  const { t } = useTranslation()

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (isError) {
    return (
      <div className="flex items-center gap-2 text-sm text-destructive">
        <AlertCircle className="h-4 w-4" />
        <span>{t('saveFailed')}</span>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-destructive hover:underline font-medium"
          >
            {t('retry')}
          </button>
        )}
      </div>
    )
  }

  if (isSaving) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Save className="h-4 w-4 animate-pulse" />
        <span>{t('saving')}</span>
      </div>
    )
  }

  if (hasUnsavedChanges) {
    return (
      <div className="flex items-center gap-2 text-sm text-amber-600">
        <Clock className="h-4 w-4" />
        <span>{t('unsavedChanges')}</span>
      </div>
    )
  }

  if (lastSaved) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600">
        <Check className="h-4 w-4" />
        <span>
          {t('lastSavedAt')} {formatTime(lastSaved)}
        </span>
      </div>
    )
  }

  return null
}