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

interface CustomIdManagerProps {
  inventory: Inventory
}

export default function CustomIdManager({ inventory }: CustomIdManagerProps) {
  const [updateCustomIdFormat, { isLoading }] =
    useUpdateCustomIdFormatMutation()
  const [format, setFormat] = useState<IdFormatElement[]>([])
  const [hasChanges, setHasChanges] = useState(false)
  const [originalFormat, setOriginalFormat] = useState<IdFormatElement[]>([])

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
      toast.error(
        'Custom ID format must contain at least one random, GUID, or sequence element to ensure uniqueness'
      )
      return
    }

    try {
      await updateCustomIdFormat({
        id: inventory.id,
        format: format,
      }).unwrap()

      setOriginalFormat(format)
      setHasChanges(false)
      toast.success('Custom ID format updated successfully')
    } catch (error) {
      console.error('Failed to update custom ID format:', error)
      toast.error('Failed to update custom ID format')
    }
  }

  const resetChanges = () => {
    setFormat(originalFormat)
    setHasChanges(false)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Custom ID Format</h2>
        <p className="text-muted-foreground">
          Define a custom format for generating item IDs in this inventory.
        </p>
      </div>

      {/* Save Bar */}
      {hasChanges && (
        <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50 dark:bg-blue-950">
          <div className="text-blue-900 dark:text-blue-100">
            You have unsaved changes to the custom ID format
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={resetChanges}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button onClick={saveChanges} disabled={isLoading}>
              {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
              <Save className="h-4 w-4 mr-2" />
              Save Changes
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
          <h4 className="font-medium mb-2">Current Format</h4>
          <p className="text-sm text-muted-foreground">
            Your custom ID format is active. New items will use this format.
          </p>
        </div>
      )}
    </div>
  )
}
