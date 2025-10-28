// frontend/src/components/items/ItemForm.tsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Inventory, Item, CreateItemRequest } from '@/types'
import { useCreateItemMutation, useUpdateItemMutation } from '@/features/items/itemsApi'
import LoadingSpinner from '../common/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

interface ItemFormProps {
  inventory: Inventory
  item?: Item
  onSuccess?: () => void
}

export default function ItemForm({ inventory, item, onSuccess }: ItemFormProps) {
  const navigate = useNavigate()
  const [createItem, { isLoading: isCreating }] = useCreateItemMutation()
  const [updateItem, { isLoading: isUpdating }] = useUpdateItemMutation()

  const isLoading = isCreating || isUpdating

  // Get active custom fields
  const activeFields = [
    { type: 'string' as const, index: 1, name: inventory.string1Name, visible: inventory.string1Visible },
    { type: 'string' as const, index: 2, name: inventory.string2Name, visible: inventory.string2Visible },
    { type: 'string' as const, index: 3, name: inventory.string3Name, visible: inventory.string3Visible },
    { type: 'text' as const, index: 1, name: inventory.text1Name, visible: inventory.text1Visible },
    { type: 'text' as const, index: 2, name: inventory.text2Name, visible: inventory.text2Visible },
    { type: 'text' as const, index: 3, name: inventory.text3Name, visible: inventory.text3Visible },
    { type: 'number' as const, index: 1, name: inventory.number1Name, visible: inventory.number1Visible },
    { type: 'number' as const, index: 2, name: inventory.number2Name, visible: inventory.number2Visible },
    { type: 'number' as const, index: 3, name: inventory.number3Name, visible: inventory.number3Visible },
    { type: 'boolean' as const, index: 1, name: inventory.boolean1Name, visible: inventory.boolean1Visible },
    { type: 'boolean' as const, index: 2, name: inventory.boolean2Name, visible: inventory.boolean2Visible },
    { type: 'boolean' as const, index: 3, name: inventory.boolean3Name, visible: inventory.boolean3Visible },
    { type: 'link' as const, index: 1, name: inventory.link1Name, visible: inventory.link1Visible },
    { type: 'link' as const, index: 2, name: inventory.link2Name, visible: inventory.link2Visible },
    { type: 'link' as const, index: 3, name: inventory.link3Name, visible: inventory.link3Visible },
  ].filter(field => field.name && field.visible)

  // Create dynamic validation schema
  const fieldValidations: Record<string, any> = {
    customId: z.string().min(1, 'Custom ID is required'),
  }

  activeFields.forEach(field => {
    const key = `${field.type}${field.index}Value`
    if (field.type === 'string') {
      fieldValidations[key] = z.string().optional().or(z.literal(''))
    } else if (field.type === 'text') {
      fieldValidations[key] = z.string().optional().or(z.literal(''))
    } else if (field.type === 'number') {
      fieldValidations[key] = z.union([
        z.number(),
        z.string().transform((val, ctx) => {
          if (val === '') return undefined
          const parsed = Number(val)
          if (isNaN(parsed)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Must be a number',
            })
            return z.NEVER
          }
          return parsed
        })
      ]).optional()
    } else if (field.type === 'boolean') {
      fieldValidations[key] = z.boolean().optional().default(false)
    } else if (field.type === 'link') {
      fieldValidations[key] = z.string().url('Must be a valid URL').optional().or(z.literal(''))
    }
  })

  const itemSchema = z.object(fieldValidations)
  type ItemFormData = z.infer<typeof itemSchema>

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      customId: item?.customId || '',
      ...activeFields.reduce((acc, field) => {
        const key = `${field.type}${field.index}Value`
        const value = item?.[key as keyof Item]
        acc[key] = value !== undefined && value !== null ? value : ''
        return acc
      }, {} as any),
    },
  })

  // Handle checkbox changes separately since react-hook-form doesn't work well with checkboxes
  const watchedFields = watch()

  const onSubmit = async (data: ItemFormData) => {
    try {
      const itemData: CreateItemRequest = {
        customId: data.customId,
        inventoryId: inventory.id,
        ...activeFields.reduce((acc, field) => {
          const key = `${field.type}${field.index}Value`
          const value = data[key]
          // Only include fields that have values
          if (value !== undefined && value !== '' && value !== null) {
            acc[key] = value
          }
          return acc
        }, {} as any),
      }

      if (item) {
        // Update existing item
        await updateItem({
          id: item.id,
          data: {
            ...itemData,
            version: item.version,
          },
        }).unwrap()
      } else {
        // Create new item
        await createItem(itemData).unwrap()
      }

      onSuccess?.()
      navigate(`/inventory/${inventory.id}`)
    } catch (error) {
      console.error('Failed to save item:', error)
      alert('Failed to save item. Please try again.')
    }
  }

  const renderField = (field: typeof activeFields[0]) => {
    const key = `${field.type}${field.index}Value`
    const error = errors[key]

    switch (field.type) {
      case 'string':
        return (
          <div key={key} className="space-y-2">
            <Label htmlFor={key}>{field.name}</Label>
            <Input
              {...register(key)}
              type="text"
              id={key}
              placeholder={`Enter ${field.name.toLowerCase()}...`}
            />
            {error && <p className="text-sm text-destructive">{error.message}</p>}
          </div>
        )

      case 'text':
        return (
          <div key={key} className="space-y-2">
            <Label htmlFor={key}>{field.name}</Label>
            <Textarea
              {...register(key)}
              id={key}
              rows={3}
              placeholder={`Enter ${field.name.toLowerCase()}...`}
            />
            {error && <p className="text-sm text-destructive">{error.message}</p>}
          </div>
        )

      case 'number':
        return (
          <div key={key} className="space-y-2">
            <Label htmlFor={key}>{field.name}</Label>
            <Input
              {...register(key)}
              type="number"
              id={key}
              step="any"
              placeholder={`Enter ${field.name.toLowerCase()}...`}
            />
            {error && <p className="text-sm text-destructive">{error.message}</p>}
          </div>
        )

      case 'boolean':
        return (
          <div key={key} className="flex items-center space-x-2">
            <Checkbox
              id={key}
              checked={watchedFields[key] as boolean || false}
              onCheckedChange={(checked) => setValue(key, checked as boolean)}
            />
            <Label htmlFor={key}>{field.name}</Label>
            {error && <p className="text-sm text-destructive">{error.message}</p>}
          </div>
        )

      case 'link':
        return (
          <div key={key} className="space-y-2">
            <Label htmlFor={key}>{field.name}</Label>
            <Input
              {...register(key)}
              type="url"
              id={key}
              placeholder="https://example.com"
            />
            {error && <p className="text-sm text-destructive">{error.message}</p>}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-2xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Custom ID */}
        <div className="space-y-2">
          <Label htmlFor="customId">Custom ID *</Label>
          <Input
            {...register('customId')}
            type="text"
            id="customId"
            placeholder="Enter unique identifier..."
          />
          {errors.customId && (
            <p className="text-sm text-destructive">{errors.customId.message}</p>
          )}
        </div>

        {/* Dynamic Fields */}
        <div className="space-y-6">
          {activeFields.map(renderField)}
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4 justify-end pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/inventory/${inventory.id}`)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
          >
            {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
            {item ? 'Update Item' : 'Create Item'}
          </Button>
        </div>
      </form>
    </div>
  )
}