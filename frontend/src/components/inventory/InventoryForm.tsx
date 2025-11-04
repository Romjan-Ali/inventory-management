import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Plus } from 'lucide-react'
import {
  useCreateInventoryMutation,
  useUpdateInventoryMutation,
} from '@/features/inventory/inventoryApi'
import type { Inventory } from '@/types'
import { CATEGORIES } from '@/lib/constants'
import LoadingSpinner from '../common/LoadingSpinner'

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

// Updated schema to match Inventory type
const inventorySchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().min(1, 'Description is required').max(500),
  category: z.string().min(1, 'Category is required'), // Changed from enum to string
  tags: z.array(z.string().min(1)).max(10, 'Maximum 10 tags allowed'),
  isPublic: z.boolean(),
  imageUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
})

type InventoryFormData = z.infer<typeof inventorySchema>

interface Props {
  inventory?: Inventory
  onSuccess?: () => void
  showHeader?: boolean
  headerTitle?: string
  headerDescription?: string
}

export default function InventoryForm({ inventory, onSuccess }: Props) {
  const navigate = useNavigate()
  const [tagInput, setTagInput] = useState('')
  const [createInventory, { isLoading: creating }] = useCreateInventoryMutation()
  const [updateInventory, { isLoading: updating }] = useUpdateInventoryMutation()

  const isLoading = creating || updating

  const form = useForm<InventoryFormData>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      title: inventory?.title || '',
      description: inventory?.description || '',
      category: inventory?.category || 'Equipment',
      tags: inventory?.tags || [],
      isPublic: inventory?.isPublic ?? false,
      imageUrl: inventory?.imageUrl || '',
    },
  })

  const tags = form.watch('tags')
  const isPublic = form.watch('isPublic')

  const addTag = () => {
    const trimmed = tagInput.trim()
    if (trimmed && !tags.includes(trimmed) && tags.length < 10) {
      form.setValue('tags', [...tags, trimmed])
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    form.setValue(
      'tags',
      tags.filter((t) => t !== tag)
    )
  }

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  const onSubmit = async (data: InventoryFormData) => {
    try {
      // Prepare the data for API - this only handles basic fields
      const body = {
        ...data,
        imageUrl: data.imageUrl || undefined,
        // Note: customIdFormat and field configurations would need to be handled separately
        // if you want to edit them in this form
      }

      if (inventory) {
        await updateInventory({
          id: inventory.id,
          data: {
            ...body,
            version: inventory.version || 1,
          },
        }).unwrap()
      } else {
        await createInventory(body).unwrap()
      }

      onSuccess?.()
      navigate('/dashboard')
    } catch (err) {
      console.error('Failed to save inventory:', err)
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-2">
      <Card className="border border-border shadow-md rounded-2xl">
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* ---------- BASIC INFO ---------- */}
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Inventory Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Office Equipment"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={4}
                          placeholder="Describe what this inventory will be used for..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="tags"
                render={() => (
                  <FormItem>
                    <FormLabel>Tag your inventory</FormLabel>
                    <FormControl>
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <Input
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={handleTagKeyDown}
                            placeholder="Add a tag and press Enter"
                          />
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={addTag}
                            disabled={tags.length >= 10}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                        </div>

                        {tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="flex items-center gap-1 bg-muted text-foreground hover:bg-muted/70"
                              >
                                {tag}
                                <button
                                  type="button"
                                  onClick={() => removeTag(tag)}
                                  className="hover:text-destructive transition-colors"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormDescription>
                      Add up to 10 relevant tags.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ---------- IMAGE ---------- */}
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL (optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/image.jpg"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide a public URL that represents this inventory
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ---------- SETTINGS ---------- */}
              <FormField
                control={form.control}
                name="isPublic"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 rounded-lg border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Make this inventory public</FormLabel>
                      <FormDescription>
                        {isPublic
                          ? 'All authenticated users can add items to this inventory.'
                          : 'Only invited users can add items.'}
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              {/* ---------- ACTION BUTTONS ---------- */}
              <div className="flex justify-end gap-3 border-t pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
                  {inventory ? 'Update Inventory' : 'Create Inventory'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}