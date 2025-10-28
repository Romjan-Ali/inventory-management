// frontend/src/components/inventory/FieldManager/FieldToolbar.tsx
import type { FieldConfig, FieldType } from '@/types'
import { FIELD_TYPES } from '@/lib/constants'
import { Plus } from 'lucide-react'

interface FieldToolbarProps {
  fields: FieldConfig[]
  onAddField: (type: FieldType) => void
}

export default function FieldToolbar({ fields, onAddField }: FieldToolbarProps) {
  const getFieldCount = (type: FieldType) => {
    return fields.filter(field => field.type === type).length
  }

  const canAddField = (type: FieldType) => {
    return getFieldCount(type) < 3
  }

  return (
    <div className="flex flex-wrap gap-2">
      {FIELD_TYPES.map((fieldType) => {
        const count = getFieldCount(fieldType.value)
        const disabled = !canAddField(fieldType.value)

        return (
          <button
            key={fieldType.value}
            onClick={() => onAddField(fieldType.value)}
            disabled={disabled}
            className="inline-flex items-center gap-2 rounded-lg border bg-secondary px-3 py-2 text-sm font-medium shadow-sm hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" />
            {fieldType.label}
            <span className={`rounded-full px-2 py-0.5 text-xs ${
              disabled ? 'bg-gray-100 text-gray-400' : 'bg-primary/10 text-primary'
            }`}>
              {count}/3
            </span>
          </button>
        )
      })}
    </div>
  )
}