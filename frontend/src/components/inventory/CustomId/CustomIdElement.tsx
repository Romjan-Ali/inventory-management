// frontend/src/components/inventory/CustomId/CustomIdElement.tsx
import type { IdFormatElement, IdElementType } from '@/types' 
import { ID_ELEMENT_TYPES, DATETIME_FORMATS, NUMBER_FORMATS } from '@/lib/constants'
import { GripVertical, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTranslation } from 'react-i18next'
import type {
  DraggableAttributes,
  DraggableSyntheticListeners,
} from '@dnd-kit/core';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function mergeDragProps(
  attributes: DraggableAttributes,
  listeners: DraggableSyntheticListeners | undefined
) {
  return { ...attributes, ...listeners };
}

interface CustomIdElementProps {
  element: IdFormatElement
  onUpdate: (updates: Partial<IdFormatElement>) => void
  onRemove: () => void
  dragHandleProps: ReturnType<typeof mergeDragProps>;
}

export default function CustomIdElement({
  element,
  onUpdate,
  onRemove,
  dragHandleProps,
}: CustomIdElementProps) {
  const { t } = useTranslation()
  
  const getElementDescription = (type: IdElementType): string => {
    switch (type) {
      case 'FIXED_TEXT':
        return t('elementDescFixedText')
      case 'RANDOM_20BIT':
        return t('elementDescRandom20bit')
      case 'RANDOM_32BIT':
        return t('elementDescRandom32bit')
      case 'RANDOM_6DIGIT':
        return t('elementDescRandom6digit')
      case 'RANDOM_9DIGIT':
        return t('elementDescRandom9digit')
      case 'GUID':
        return t('elementDescGuid')
      case 'DATETIME':
        return t('elementDescDatetime')
      case 'SEQUENCE':
        return t('elementDescSequence')
      default:
        return ''
    }
  }

  const showFormatField = (type: IdElementType): boolean => {
    return type === 'DATETIME' || type === 'SEQUENCE'
  }

  const showValueField = (type: IdElementType): boolean => {
    return type === 'FIXED_TEXT'
  }

  return (
    <div className="flex items-start gap-3 p-4 border rounded-lg bg-card">
      {/* Drag Handle */}
      <div {...dragHandleProps} className="flex items-center h-10 cursor-grab">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Content */}
      <div className="flex-1 space-y-4">
        {/* Element Type */}
        {<div className="space-y-2">
          <Label htmlFor={`type-${element.id}`}>{t('elementType')}</Label>
          <Select
            value={element.type}
            onValueChange={(value: IdElementType) => onUpdate({ type: value })}
          >
            <SelectTrigger id={`type-${element.id}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ID_ELEMENT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex flex-col">
                    <span>{type.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {getElementDescription(type.value)}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>}

        {/* Dynamic Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Value Field (for FIXED_TEXT) */}
          {showValueField(element.type) && (
            <div className="space-y-2">
              <Label htmlFor={`value-${element.id}`}>{t('textValue')}</Label>
              <Input
                id={`value-${element.id}`}
                value={element.value || ''}
                onChange={(e) => onUpdate({ value: e.target.value })}
                placeholder={t('enterFixedText')}
              />
            </div>
          )}

          {/* Format Field (for DATETIME and SEQUENCE) */}
          {showFormatField(element.type) && (
            <div className="space-y-2">
              <Label htmlFor={`format-${element.id}`}>
                {element.type === 'DATETIME' ? t('dateFormat') : t('numberFormat')}
              </Label>
              <Select
                value={element.format || ''}
                onValueChange={(value) => onUpdate({ format: value })}
              >
                <SelectTrigger id={`format-${element.id}`}>
                  <SelectValue placeholder={t('selectFormat')} />
                </SelectTrigger>
                <SelectContent>
                  {(element.type === 'DATETIME' ? DATETIME_FORMATS : NUMBER_FORMATS).map((format) => (
                    <SelectItem key={format.value} value={format.value}>
                      {format.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      {/* Settings and Actions */}
      <div className="flex flex-col gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onRemove}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}