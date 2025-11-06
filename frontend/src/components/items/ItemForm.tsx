// frontend/src/components/items/ItemForm.tsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Inventory, Item, CreateItemRequest } from '@/types'
import {
  useCreateItemMutation,
  useUpdateItemMutation,
} from '@/features/items/itemsApi'
import LoadingSpinner from '../common/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface ItemFormProps {
  inventory: Inventory
  item?: Item
  initialCustomId?: string
  onSuccess?: () => void
  generateCustomId?: () => void
}

// Define field types for the active fields
interface ActiveField {
  type: 'string' | 'text' | 'number' | 'boolean' | 'link'
  index: 1 | 2 | 3
  name?: string
  visible: boolean
}


export default function ItemForm({
  inventory,
  item,
  initialCustomId,
  onSuccess,
  generateCustomId,
}: ItemFormProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [createItem, { isLoading: isCreating }] = useCreateItemMutation()
  const [updateItem, { isLoading: isUpdating }] = useUpdateItemMutation()
  const [customId, setCustomId] = useState(
    initialCustomId || item?.customId || ''
  )

  const isLoading = isCreating || isUpdating

  // Update custom ID when initialCustomId changes
  useEffect(() => {
    if (initialCustomId && !item) {
      setCustomId(initialCustomId)
    }
  }, [initialCustomId, item])

  // Get active custom fields
  const activeFields: ActiveField[] = [
    {
      type: 'string',
      index: 1,
      name: inventory.string1Name,
      visible: inventory.string1Visible,
    },
    {
      type: 'string',
      index: 2,
      name: inventory.string2Name,
      visible: inventory.string2Visible,
    },
    {
      type: 'string',
      index: 3,
      name: inventory.string3Name,
      visible: inventory.string3Visible,
    },
    {
      type: 'text',
      index: 1,
      name: inventory.text1Name,
      visible: inventory.text1Visible,
    },
    {
      type: 'text',
      index: 2,
      name: inventory.text2Name,
      visible: inventory.text2Visible,
    },
    {
      type: 'text',
      index: 3,
      name: inventory.text3Name,
      visible: inventory.text3Visible,
    },
    {
      type: 'number',
      index: 1,
      name: inventory.number1Name,
      visible: inventory.number1Visible,
    },
    {
      type: 'number',
      index: 2,
      name: inventory.number2Name,
      visible: inventory.number2Visible,
    },
    {
      type: 'number',
      index: 3,
      name: inventory.number3Name,
      visible: inventory.number3Visible,
    },
    {
      type: 'boolean',
      index: 1,
      name: inventory.boolean1Name,
      visible: inventory.boolean1Visible,
    },
    {
      type: 'boolean',
      index: 2,
      name: inventory.boolean2Name,
      visible: inventory.boolean2Visible,
    },
    {
      type: 'boolean',
      index: 3,
      name: inventory.boolean3Name,
      visible: inventory.boolean3Visible,
    },
    {
      type: 'link',
      index: 1,
      name: inventory.link1Name,
      visible: inventory.link1Visible,
    },
    {
      type: 'link',
      index: 2,
      name: inventory.link2Name,
      visible: inventory.link2Visible,
    },
    {
      type: 'link',
      index: 3,
      name: inventory.link3Name,
      visible: inventory.link3Visible,
    },
  ].filter(
    (field): field is ActiveField & { name: string } =>
      !!field.name && field.visible
  )

  // Create dynamic validation schema
  const fieldValidations: Record<string, z.ZodTypeAny> = {
    customId: z.string().min(1, t('customIdRequired')),
  }

  activeFields.forEach((field) => {
    const key = `${field.type}${field.index}Value`
    if (field.type === 'string') {
      fieldValidations[key] = z.string().optional().or(z.literal(''))
    } else if (field.type === 'text') {
      fieldValidations[key] = z.string().optional().or(z.literal(''))
    } else if (field.type === 'number') {
      fieldValidations[key] = z
        .union([
          z.number(),
          z.string().transform((val, ctx) => {
            if (val === '') return undefined
            const parsed = Number(val)
            if (isNaN(parsed)) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: t('mustBeNumber'),
              })
              return z.NEVER
            }
            return parsed
          }),
        ])
        .optional()
    } else if (field.type === 'boolean') {
      fieldValidations[key] = z.boolean().optional().default(false)
    } else if (field.type === 'link') {
      fieldValidations[key] = z
        .string()
        .url(t('mustBeValidUrl'))
        .optional()
        .or(z.literal(''))
    }
  })

  const itemSchema = z.object(fieldValidations)
  type ItemFormData = z.infer<typeof itemSchema>

  // Create default values object
  const defaultValues: ItemFormData = {
    customId: customId,
  }

  activeFields.forEach((field) => {
    const key = `${field.type}${field.index}Value`
    const value = item?.[key as keyof Item]
    defaultValues[key] = value !== undefined && value !== null ? value : ''
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues,
  })

  // Update form value when customId changes
  useEffect(() => {
    setValue('customId', customId)
  }, [customId, setValue])

  // Handle checkbox changes separately since react-hook-form doesn't work well with checkboxes
  const watchedFields = watch()

  // Type guards for the field values
  const isValidFieldValue = (
    value: unknown
  ): value is string | number | boolean | undefined => {
    return (
      value === undefined ||
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    )
  }

  const onSubmit = async (data: ItemFormData) => {
    try {
      const fieldData: Record<string, string | number | boolean | undefined> =
        {}

      activeFields.forEach((field) => {
        const key = `${field.type}${field.index}Value`
        const value = data[key]

        // Only include valid field values that are not empty
        if (isValidFieldValue(value) && value !== '' && value !== null) {
          fieldData[key] = value
        }
      })

      const itemData: CreateItemRequest = {
        customId: String(data.customId), // Convert to string to ensure type safety
        inventoryId: inventory.id,
        ...fieldData,
      }

      if (item) {
        await updateItem({
          id: item.id,
          data: {
            ...itemData,
            version: item.version,
          },
        }).unwrap()
      } else {
        await createItem(itemData).unwrap()
      }

      onSuccess?.()
      navigate(`/inventory/${inventory.id}`)
    } catch (error) {
      console.error('Failed to save item:', error)
      alert('Failed to save item. Please try again.')
    }
  }

  const renderField = (field: ActiveField) => {
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
              placeholder={`Enter ${field.name?.toLowerCase()}...`}
            />
            {error && (
              <p className="text-sm text-destructive">
                {error.message?.toString()}
              </p>
            )}
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
              placeholder={`Enter ${field.name?.toLowerCase()}...`}
            />
            {error && (
              <p className="text-sm text-destructive">
                {error.message?.toString()}
              </p>
            )}
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
              placeholder={`Enter ${field.name?.toLowerCase()}...`}
            />
            {error && (
              <p className="text-sm text-destructive">
                {error.message?.toString()}
              </p>
            )}
          </div>
        )

      case 'boolean':
        return (
          <div key={key} className="flex items-center space-x-2">
            <Checkbox
              id={key}
              checked={(watchedFields[key] as boolean) || false}
              onCheckedChange={(checked) => setValue(key, checked as boolean)}
            />
            <Label htmlFor={key}>{field.name}</Label>
            {error && (
              <p className="text-sm text-destructive">
                {error.message?.toString()}
              </p>
            )}
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
            {error && (
              <p className="text-sm text-destructive">
                {error.message?.toString()}
              </p>
            )}
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
          <div className="flex items-center gap-2">
            <Label htmlFor="customId">{t('customId')} *</Label>
            {inventory.customIdFormat && !item && (
              <Badge variant="secondary" className="text-xs">
                {t('autoGenerated')}
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Input
              {...register('customId')}
              type="text"
              id="customId"
              placeholder={t('enterUniqueId')}
              value={customId}
              onChange={(e) => setCustomId(e.target.value)}
            />
            {inventory.customIdFormat && !item && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generateCustomId}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
          {errors.customId && (
            <p className="text-sm text-destructive">
              {errors.customId.message?.toString()}
            </p>
          )}
          {inventory.customIdFormat && (
            <p className="text-sm text-muted-foreground">
              {t('customIdHint')}
            </p>
          )}
        </div>

        {/* Dynamic Fields */}
        <div className="space-y-6">{activeFields.map(renderField)}</div>

        {/* Submit Buttons */}
        <div className="flex gap-4 justify-end pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/inventory/${inventory.id}`)}
            disabled={isLoading}
          >
            {t('cancel')}
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
            {item ? t('updateItem') : t('createItem')}
          </Button>
        </div>
      </form>
    </div>
  )
}
