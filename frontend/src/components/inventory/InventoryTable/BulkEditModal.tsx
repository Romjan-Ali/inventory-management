// frontend/src/components/inventory/InventoryTable/BulkEditModal.tsx
import { useState } from 'react'
import type { Inventory, Item } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface BulkEditModalProps {
  inventory: Inventory
  selectedCount: number
  onClose: () => void
  onSave: (updates: Partial<Item>) => void
  isSaving: boolean
}

export default function BulkEditModal({
  inventory,
  selectedCount,
  onClose,
  onSave,
  isSaving,
}: BulkEditModalProps) {
  const [updates, setUpdates] = useState<Partial<Item>>({})

  // Get editable custom fields
  const editableFields = [
    {
      type: 'string' as const,
      index: 1,
      name: inventory.string1Name,
      visible: inventory.string1Visible,
    },
    {
      type: 'string' as const,
      index: 2,
      name: inventory.string2Name,
      visible: inventory.string2Visible,
    },
    {
      type: 'string' as const,
      index: 3,
      name: inventory.string3Name,
      visible: inventory.string3Visible,
    },
    {
      type: 'text' as const,
      index: 1,
      name: inventory.text1Name,
      visible: inventory.text1Visible,
    },
    {
      type: 'text' as const,
      index: 2,
      name: inventory.text2Name,
      visible: inventory.text2Visible,
    },
    {
      type: 'text' as const,
      index: 3,
      name: inventory.text3Name,
      visible: inventory.text3Visible,
    },
    {
      type: 'number' as const,
      index: 1,
      name: inventory.number1Name,
      visible: inventory.number1Visible,
    },
    {
      type: 'number' as const,
      index: 2,
      name: inventory.number2Name,
      visible: inventory.number2Visible,
    },
    {
      type: 'number' as const,
      index: 3,
      name: inventory.number3Name,
      visible: inventory.number3Visible,
    },
    {
      type: 'boolean' as const,
      index: 1,
      name: inventory.boolean1Name,
      visible: inventory.boolean1Visible,
    },
    {
      type: 'boolean' as const,
      index: 2,
      name: inventory.boolean2Name,
      visible: inventory.boolean2Visible,
    },
    {
      type: 'boolean' as const,
      index: 3,
      name: inventory.boolean3Name,
      visible: inventory.boolean3Visible,
    },
    {
      type: 'link' as const,
      index: 1,
      name: inventory.link1Name,
      visible: inventory.link1Visible,
    },
    {
      type: 'link' as const,
      index: 2,
      name: inventory.link2Name,
      visible: inventory.link2Visible,
    },
    {
      type: 'link' as const,
      index: 3,
      name: inventory.link3Name,
      visible: inventory.link3Visible,
    },
  ].filter((field) => field.name && field.visible)

  const handleFieldChange = (fieldType: string, index: number, value: any) => {
    const key = `${fieldType}${index}Value` as keyof Item
    
    if (value === '' || value === undefined || value === null) {
      // Remove the field if empty
      const newUpdates = { ...updates }
      delete newUpdates[key]
      setUpdates(newUpdates)
    } else {
      setUpdates(prev => ({
        ...prev,
        [key]: value
      }))
    }
  }

  const handleSave = () => {
    onSave(updates)
  }

  const renderField = (field: typeof editableFields[0]) => {
    const key = `${field.type}${field.index}Value`

    switch (field.type) {
      case 'string':
        return (
          <div key={field.type + field.index} className="space-y-2">
            <Label htmlFor={key}>{field.name}</Label>
            <Input
              type="text"
              id={key}
              placeholder={`Set ${field.name.toLowerCase()} for all selected items...`}
              onChange={(e) => handleFieldChange(field.type, field.index, e.target.value)}
            />
          </div>
        )

      case 'text':
        return (
          <div key={field.type + field.index} className="space-y-2">
            <Label htmlFor={key}>{field.name}</Label>
            <Textarea
              id={key}
              rows={3}
              placeholder={`Set ${field.name.toLowerCase()} for all selected items...`}
              onChange={(e) => handleFieldChange(field.type, field.index, e.target.value)}
            />
          </div>
        )

      case 'number':
        return (
          <div key={field.type + field.index} className="space-y-2">
            <Label htmlFor={key}>{field.name}</Label>
            <Input
              type="number"
              id={key}
              step="any"
              placeholder={`Set ${field.name.toLowerCase()} for all selected items...`}
              onChange={(e) => handleFieldChange(field.type, field.index, e.target.value === '' ? '' : Number(e.target.value))}
            />
          </div>
        )

      case 'boolean':
        return (
          <div key={field.type + field.index} className="flex items-center space-x-2">
            <Checkbox
              id={key}
              onCheckedChange={(checked) => handleFieldChange(field.type, field.index, checked)}
            />
            <Label htmlFor={key}>{field.name}</Label>
          </div>
        )

      case 'link':
        return (
          <div key={field.type + field.index} className="space-y-2">
            <Label htmlFor={key}>{field.name}</Label>
            <Input
              type="url"
              id={key}
              placeholder="https://example.com"
              onChange={(e) => handleFieldChange(field.type, field.index, e.target.value)}
            />
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Edit {selectedCount} Items</DialogTitle>
          <DialogDescription>
            Update field values for all selected items. Leave fields empty to keep their current values.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {editableFields.map(renderField)}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || Object.keys(updates).length === 0}>
            {isSaving ? 'Updating...' : `Update ${selectedCount} Items`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}