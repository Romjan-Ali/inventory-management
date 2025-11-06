// frontend/src/components/inventory/CustomId/CustomIdBuilder.tsx
import { useState } from 'react'
import type { IdFormatElement, IdElementType } from '@/types'
import { ID_ELEMENT_TYPES } from '@/lib/constants'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import CustomIdElement from './CustomIdElement'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

interface CustomIdBuilderProps {
  format: IdFormatElement[]
  onFormatChange: (format: IdFormatElement[]) => void
}

// Sortable wrapper for CustomIdElement
function SortableCustomIdElement({ element, onUpdate, onRemove }: {
  element: IdFormatElement
  onUpdate: (updates: Partial<IdFormatElement>) => void
  onRemove: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: element.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <CustomIdElement
        element={element}
        onUpdate={onUpdate}
        onRemove={onRemove}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  )
}

export default function CustomIdBuilder({ format, onFormatChange }: CustomIdBuilderProps) {
  const { t } = useTranslation()
  const [newElementType, setNewElementType] = useState<IdElementType>('FIXED_TEXT')
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const addElement = () => {
    if (format.length >= 10) {
      toast.error(t('max10Elements'))
      return
    }

    const newElement: IdFormatElement = {
      id: `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: newElementType,
      value: newElementType === 'FIXED_TEXT' ? 'TEXT' : undefined,
      format: newElementType === 'DATETIME' ? 'YYYYMMDD' : 
              newElementType === 'SEQUENCE' ? '000' : undefined,
    }

    onFormatChange([...format, newElement])
    setNewElementType('FIXED_TEXT')
  }

  const updateElement = (elementId: string, updates: Partial<IdFormatElement>) => {
    onFormatChange(
      format.map(element =>
        element.id === elementId ? { ...element, ...updates } : element
      )
    )
  }

  const removeElement = (elementId: string) => {
    onFormatChange(format.filter(element => element.id !== elementId))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = format.findIndex(item => item.id === active.id)
      const newIndex = format.findIndex(item => item.id === over.id)

      onFormatChange(arrayMove(format, oldIndex, newIndex))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-medium">{t('builderHeader')}</h3>
        <p className="text-muted-foreground">
          {t('builderSubtitle')}
        </p>
      </div>

      {/* Add Element Controls */}
      <div className="flex gap-3 items-end">
        <div className="flex-1 space-y-2">
          <label className="text-sm font-medium">{t('addNewElement')}</label>
          <Select value={newElementType} onValueChange={(value: IdElementType) => setNewElementType(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ID_ELEMENT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button onClick={addElement} disabled={format.length >= 10}>
          <Plus className="h-4 w-4 mr-2" />
          {t('addElement')}
        </Button>
      </div>

      {/* Element Counter */}
      <div className="text-sm text-muted-foreground">
        {format.length}/10 {t('elementsUsed')}
      </div>

      {/* Elements List */}
      {format.length === 0 ? (
        <div className="text-center py-12 rounded-lg border-2 border-dashed">
          <div className="text-muted-foreground">
            {t('noElements')}
          </div>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={format.map(f => f.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {format.map((element) => (
                <SortableCustomIdElement
                  key={element.id}
                  element={element}
                  onUpdate={(updates) => updateElement(element.id, updates)}
                  onRemove={() => removeElement(element.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Help Text */}
      <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-4">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
          {t('howItWorks')}
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• {t('dragToReorder')}</li>
          <li>• {t('useFixedText')}</li>
          <li>• {t('sequenceAuto')}</li>
          <li>• {t('randomEnsure')}</li>
          <li>• {t('datetimeUses')}</li>
        </ul>
      </div>
    </div>
  )
}