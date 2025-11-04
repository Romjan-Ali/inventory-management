// frontend/src/components/inventory/FieldManager/FieldList.tsx
import type { FieldConfig } from '@/types'
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
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import FieldItem from './FieldItem'

interface FieldListProps {
  fields: FieldConfig[]
  onUpdateField: (fieldId: string, updates: Partial<FieldConfig>) => void
  onRemoveField: (fieldId: string) => void
  onReorderFields: (activeId: string, overId: string) => void
}

export default function FieldList({ fields, onUpdateField, onRemoveField, onReorderFields }: FieldListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      onReorderFields(active.id as string, over.id as string)
    }
  }

  if (fields.length === 0) {
    return (
      <div className="text-center py-12 rounded-lg border-2 border-dashed">
        <div className="text-muted-foreground">
          No fields configured yet. Add your first field using the toolbar above.
        </div>
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={fields.map(f => `${f.type}-${f.index}`)} strategy={verticalListSortingStrategy}>
        <div className="space-y-4">
          {fields
            .sort((a, b) => a.order - b.order)
            .map((field) => (
              <FieldItem
                key={`${field.type}-${field.index}`}
                field={field}
                onUpdate={(updates) => onUpdateField(`${field.type}-${field.index}`, updates)}
                onRemove={() => onRemoveField(`${field.type}-${field.index}`)}
              />
            ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}