// frontend/src/components/inventory/FieldManager/FieldItem.tsx
import { useState } from 'react'
import type { FieldConfig, FieldType } from '@/types'
import { FIELD_TYPES } from '@/lib/constants'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2, Eye, EyeOff, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FieldItemProps {
  field: FieldConfig
  onUpdate: (updates: Partial<FieldConfig>) => void
  onRemove: () => void
}

export default function FieldItem({
  field,
  onUpdate,
  onRemove,
}: FieldItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `${field.type}-${field.index}` })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const fieldTypeLabel =
    FIELD_TYPES.find((t) => t.value === field.type)?.label || field.type

  return (
    <div ref={setNodeRef} style={style} className="rounded-lg border bg-card">
      <div className="flex items-start gap-4">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="flex items-center h-10 cursor-grab text-muted-foreground pl-4 pt-4"
        >
          <GripVertical className="h-4 w-4" />
        </div>

        {/* Field Info */}
        <div
          className="flex-1 space-y-3"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {/* Header */}
          <div
            className={`flex items-center justify-between p-4 ${
              isExpanded ? 'pb-0' : ''
            }`}
          >
            <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap min-w-0">
              <span className="inline-flex shrink-0 items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                {fieldTypeLabel}
              </span>
              <Input
                value={field.name}
                onChange={(e) => onUpdate({ name: e.target.value })}
                onClick={(e) => e.stopPropagation()}
                placeholder="Field name"
                className="font-medium border-0 px-2.5 py-0.5 h-auto focus:ring-0 focus:border-b focus:rounded-none flex-1 min-w-0"
              />
            </div>

            <div className="flex items-center">
              {/* Expand/Collapse */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`p-1 rounded hover:bg-muted transition-transform duration-300 ${
                  isExpanded ? 'rotate-180' : ''
                }`}
                title={isExpanded ? 'Collapse details' : 'Expand details'}
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Expanded Content */}
          {isExpanded && (
            <div
              className="space-y-3 p-4 pl-0 border-t"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Description */}
              <div>
                <div className="flex justify-between items-end">
                  <label className="block text-sm font-medium mb-1">
                    Description (Tooltip)
                  </label>
                </div>

                <Textarea
                  value={field.description}
                  onChange={(e) => onUpdate({ description: e.target.value })}
                  placeholder="Field description that will appear as a tooltip in forms"
                  rows={2}
                />
              </div>

              <div className="flex justify-between">
                {/* Field Type Info */}
                <div className="text-sm text-muted-foreground">
                  <p>
                    <strong>Field Type:</strong> {fieldTypeLabel}
                  </p>
                  <p>
                    This field will accept{' '}
                    {field.type === 'number'
                      ? 'numeric'
                      : field.type === 'boolean'
                      ? 'true/false'
                      : field.type === 'link'
                      ? 'URL'
                      : 'text'}{' '}
                    values.
                  </p>
                </div>

                <div className="flex gap-2 m-1">
                  {/* Visibility Toggle */}
                  <Button
                    onClick={() =>
                      onUpdate({ visibleInTable: !field.visibleInTable })
                    }
                    className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-mono transition-colors ${
                      field.visibleInTable
                        ? 'text-green-700 bg-green-500/15 hover:bg-green-500/25'
                        : 'text-muted-foreground bg-muted hover:bg-muted/70'
                    }`}
                    title={
                      field.visibleInTable ? 'Hide from table' : 'Show in table'
                    }
                  >
                    {field.visibleInTable ? (
                      <>
                        Hide from Table
                        <Eye className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Show in Table
                        <EyeOff className="h-4 w-4" />
                      </>
                    )}
                  </Button>

                  {/* Delete */}
                  <Button
                    onClick={onRemove}
                    className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-mono text-destructive bg-destructive/10 hover:bg-destructive/20 transition-colors"
                  >
                    Delete Field
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
