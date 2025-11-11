// frontend/src/components/inventory/CustomId/CustomIdManager.tsx
import { useState, useEffect } from 'react'
import type { Inventory, IdFormatElement } from '@/types'
import { useUpdateCustomIdFormatMutation } from '@/features/inventory/inventoryApi'
import CustomIdBuilder from './CustomIdBuilder'
import CustomIdPreview from './CustomIdPreview'
import { Button } from '@/components/ui/button'
import { Save, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { useTranslation } from 'react-i18next'
import AutoSaveStatus from '../AutoSaveStatus'
import { useAutoSave } from '@/hooks/useAutoSave'

interface CustomIdManagerProps {
  inventory: Inventory
}

export default function CustomIdManager({ inventory }: CustomIdManagerProps) {
  const { t } = useTranslation()
  const [updateCustomIdFormat, { isLoading }] =
    useUpdateCustomIdFormatMutation()
  const [format, setFormat] = useState<IdFormatElement[]>([])
  const [hasChanges, setHasChanges] = useState(false)
  const [originalFormat, setOriginalFormat] = useState<IdFormatElement[]>([])
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isError, setIsError] = useState<boolean>(false)

  // Initialize format from inventory
  useEffect(() => {
    const initialFormat = inventory.customIdFormat || []
    setFormat(initialFormat)
    setOriginalFormat(initialFormat)
  }, [inventory.customIdFormat])

  // Check for changes
  useEffect(() => {
    const changed = JSON.stringify(format) !== JSON.stringify(originalFormat)
    setHasChanges(changed)
  }, [format, originalFormat])

  const handleFormatChange = (newFormat: IdFormatElement[]) => {
    setFormat(newFormat)
  }

  const saveChanges = async () => {
    const hasRandomOrSequence = format.some(
      (element) =>
        element.type.startsWith('RANDOM') ||
        element.type === 'SEQUENCE' ||
        element.type === 'GUID'
    )

    if (!hasRandomOrSequence) {
      toast.error(t('customIdFormatUniqueness'))
      return
    }

    try {
      await updateCustomIdFormat({
        id: inventory.id,
        format: format,
      }).unwrap()

      setOriginalFormat(format)
      setHasChanges(false)
      setLastSaved(new Date())
      toast.success(t('customIdFormatUpdated'))
      setIsError(false)
    } catch (error) {
      console.error('Failed to update custom ID format:', error)
      toast.error(t('failedUpdateCustomIdFormat'))
      setIsError(true)
    }
  }

  const resetChanges = () => {
    setFormat(originalFormat)
    setHasChanges(false)
  }

  useAutoSave({
    hasChanges,
    onSave: saveChanges,    
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">{t('customIdHeader')}</h2>
        <p className="text-muted-foreground">{t('customIdSubtitle')}</p>
      </div>

      {/* Save Bar */}
      {hasChanges && (
        <div className="flex max-lg:flex-col max-lg:items-start max-lg:gap-4 items-center justify-between p-4 border rounded-lg bg-blue-50 dark:bg-blue-950">
          <div className="text-blue-900 dark:text-blue-100">
            {t('unsavedCustomId')}
          </div>
          <div className="flex gap-2">
            <AutoSaveStatus
              isSaving={isLoading}
              lastSaved={lastSaved}
              isError={isError}
              hasUnsavedChanges={hasChanges}
              onRetry={saveChanges}
            />
            <Button variant="outline" onClick={resetChanges}>
              <RotateCcw className="h-4 w-4 mr-2" />
              {t('reset')}
            </Button>
            <Button onClick={saveChanges} disabled={isLoading}>
              {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
              <Save className="h-4 w-4 mr-2" />
              {t('saveChanges')}
            </Button>
          </div>
        </div>
      )}

      {/* Preview Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Builder */}
        <div>
          <CustomIdBuilder
            format={format}
            onFormatChange={handleFormatChange}
          />
        </div>

        {/* Preview */}
        <div>
          <CustomIdPreview format={format} />
        </div>
      </div>

      {/* Current Format Info */}
      {originalFormat.length > 0 && !hasChanges && (
        <div className="rounded-lg border p-4">
          <h4 className="font-medium mb-2">{t('currentFormat')}</h4>
          <p className="text-sm text-muted-foreground">
            {t('currentFormatDesc')}
          </p>
        </div>
      )}
    </div>
  )
}
