// frontend/src/components/inventory/FieldManager/FieldManager.tsx
import { useState } from 'react'
import type { Inventory, FieldConfig, FieldType } from '@/types'
import { useUpdateInventoryMutation } from '@/features/inventory/inventoryApi'
import { FIELD_TYPES } from '@/lib/constants'
import { getFieldConfigs } from '@/utils/fieldConfig'
import FieldList from './FieldList'
import FieldToolbar from './FieldToolbar'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { Save } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface FieldManagerProps {
  inventory: Inventory
}

type FieldUpdate = {
  version: number
} & Record<string, string | boolean | number | null>

export default function FieldManager({ inventory }: FieldManagerProps) {
  const { t } = useTranslation()
  const [updateInventory, { isLoading }] = useUpdateInventoryMutation()
  const [fields, setFields] = useState<FieldConfig[]>(() =>
    getFieldConfigs(inventory)
  )

  const addField = (type: FieldType) => {
    // Find the next available slot for this field type
    const existingFieldsOfType = fields.filter((f) => f.type === type)
    if (existingFieldsOfType.length >= 3) return

    const nextIndex = existingFieldsOfType.length + 1
    const newOrder = Math.max(...fields.map((f) => f.order), -1) + 1

    const newField: FieldConfig = {
      type,
      index: nextIndex,
      name: `New ${
        FIELD_TYPES.find((t) => t.value === type)?.label || type
      } Field`,
      description: '',
      visibleInTable: true,
      order: newOrder,
    }

    setFields((prev) => [...prev, newField])
  }

  const updateField = (fieldId: string, updates: Partial<FieldConfig>) => {
    setFields((prev) =>
      prev.map((field) =>
        `${field.type}-${field.index}` === fieldId
          ? { ...field, ...updates }
          : field
      )
    )
  }

  const removeField = (fieldId: string) => {
    setFields((prev) =>
      prev.filter((field) => `${field.type}-${field.index}` !== fieldId)
    )
  }

  const reorderFields = (activeId: string, overId: string) => {
    const activeIndex = fields.findIndex(
      (field) => `${field.type}-${field.index}` === activeId
    )
    const overIndex = fields.findIndex(
      (field) => `${field.type}-${field.index}` === overId
    )

    if (activeIndex === -1 || overIndex === -1) return

    const newFields = [...fields]
    const [removed] = newFields.splice(activeIndex, 1)
    newFields.splice(overIndex, 0, removed)

    // Update orders
    const reorderedFields = newFields.map((field, index) => ({
      ...field,
      order: index,
    }))

    setFields(reorderedFields)
  }

  const saveChanges = async () => {
    try {
      // Create update object for all field configurations
      const updates: FieldUpdate = {
        version: inventory.version,
      }

      // Reset all fields first
      const fieldTypes = [
        'string',
        'text',
        'number',
        'boolean',
        'link',
      ] as const
      fieldTypes.forEach((type) => {
        for (let i = 1; i <= 3; i++) {
          updates[`${type}${i}Name`] = null
          updates[`${type}${i}Description`] = null
          updates[`${type}${i}Visible`] = false
          updates[`${type}${i}Order`] = 0
        }
      })

      // Apply current field configurations
      fields.forEach((field) => {
        const prefix = `${field.type}${field.index}`
        updates[`${prefix}Name`] = field.name
        updates[`${prefix}Description`] = field.description
        updates[`${prefix}Visible`] = field.visibleInTable
        updates[`${prefix}Order`] = field.order
      })

      await updateInventory({
        id: inventory.id,
        data: updates,
      }).unwrap()
    } catch (error) {
      console.error('Failed to update field configuration:', error)
    }
  }

  const hasChanges =
    JSON.stringify(fields) !== JSON.stringify(getFieldConfigs(inventory))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('fieldHeader')}</h2>
          <p className="text-muted-foreground">
            {t('fieldSubtitle')}
          </p>
        </div>

        <button
          onClick={saveChanges}
          disabled={!hasChanges || isLoading}
          className="inline-flex items-center gap-2 rounded-md bg-primary dark:bg-secondary dark:hover:bg-secondary/80 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
        >
          {isLoading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {t('fieldSaveChanges')}
        </button>
      </div>

      {/* Field Limits Info */}
      <div className="rounded-lg bg-blue-700/10 dark:bg-blue-700/40 p-4">
        <p className="text-sm text-blue-700 dark:text-white">
          {t('fieldLimits')}
        </p>
      </div>

      {/* Toolbar */}
      <FieldToolbar fields={fields} onAddField={addField} />

      {/* Field List */}
      <FieldList
        fields={fields}
        onUpdateField={updateField}
        onRemoveField={removeField}
        onReorderFields={reorderFields}
      />

      {/* Preview Note */}
      <div className="rounded-lg border p-4">
        <h4 className="font-medium mb-2">{t('fieldPreview')}</h4>
        <p className="text-sm text-muted-foreground">
          {t('fieldsInTableNote')}
        </p>
      </div>
    </div>
  )
}
