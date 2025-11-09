// backend/src/services/InventoryService.ts
import { InventoryRepository } from '../repositories/InventoryRepository'
import { AccessService } from './AccessService'
import { CustomIdService } from './CustomIdService'
import {
  ValidationError,
  PermissionError,
  OptimisticLockError,
  NotFoundError,
} from '../errors'
import type {
  CreateInventoryRequest,
  UpdateInventoryRequest,
  IdFormatElement,
} from '../types'
import { prisma } from '../lib/prisma'
import type { User } from '@prisma/client'

export class InventoryService {
  constructor(
    private inventoryRepository: InventoryRepository,
    private accessService: AccessService,
    private customIdService: CustomIdService
  ) {}

  async createInventory(data: CreateInventoryRequest, userId: string) {
    // Validation
    if (!data.title?.trim()) {
      throw new ValidationError('Title is required')
    }

    if (!data.category?.trim()) {
      throw new ValidationError('Category is required')
    }

    const inventory = await this.inventoryRepository.create({
      ...data,
      creatorId: userId,
    })

    return inventory
  }

  async getInventory(id: string, userId?: string) {
    const inventory = await this.inventoryRepository.findById(id)

    if (!inventory) {
      throw new NotFoundError('Inventory')
    }

    const canReadInventory = await this.accessService.canReadInventory(
      id,
      userId
    )

    if (!canReadInventory) {
      throw new PermissionError('No access to this inventory')
    }

    const canWrite = userId
      ? await this.accessService.canWriteInventory(id, userId)
      : false

    return { ...inventory, canWrite }
  }

  async updateInventory(
    id: string,
    data: UpdateInventoryRequest,
    userId: string
  ) {
    // Check write access
    const canWrite = await this.accessService.canWriteInventory(id, userId)
    if (!canWrite) {
      throw new PermissionError('No write access to this inventory')
    }

    try {
      const inventory = await this.inventoryRepository.updateWithLock(
        id,
        data.version,
        data
      )
      return inventory
    } catch (error: any) {
      if (error.code === 'P2025') {
        // Prisma record not found (version mismatch or deleted)
        throw new OptimisticLockError()
      }
      throw error
    }
  }

  async deleteInventory(id: string, userId: string) {
    // Check write access (only creator or admin can delete)
    const inventory = await this.inventoryRepository.findById(id)
    if (!inventory) {
      throw new NotFoundError('Inventory')
    }

    if (inventory.creatorId !== userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { isAdmin: true },
      })

      if (!user?.isAdmin) {
        throw new PermissionError(
          'Only the creator or admin can delete this inventory'
        )
      }
    }

    await this.inventoryRepository.delete(id)
  }

  async getUserInventories(userId: string) {
    return this.inventoryRepository.findByUser(userId)
  }

  async getPopularInventories(limit: number = 5) {
    return this.inventoryRepository.getPopular(limit)
  }

  async getInventories(
    params: {
      page: number
      limit: number
      search?: string
      category?: string
      tags?: string[]
      sort?: string
      inventoryType: 'owned' | 'shared' | 'public' | 'public_and_accessible'
      isPublic?: boolean
    },
    user?: User
  ) {
    const result = await (user?.id
      ? this.inventoryRepository.find(params, user)
      : this.inventoryRepository.find(params))

    const { page, limit } = params
    const total = result.total
    const totalPages = Math.ceil(total / limit) || 1
    const hasNext = page < totalPages
    const hasPrev = page > 1
    const startIndex = (page - 1) * limit + 1
    const endIndex = Math.min(page * limit, total)

    const pagination = {
      page,
      limit,
      total,
      totalPages,
      hasNext,
      hasPrev,
      startIndex,
      endIndex,
    }

    return { ...result, pagination }
  }

async getInventoryStatistics(inventoryId: string) {
  const inventory = await this.inventoryRepository.findById(inventoryId)
  
  if (!inventory) {
    throw new Error('Inventory not found')
  }

  const items = await this.inventoryRepository.findItemsByInventoryId(inventoryId)
  const totalItems = items.length

  // Get active fields
  const activeFields = this.getActiveFields(inventory)
  
  // Field completion statistics
  const fieldCompletion = activeFields.map(field => {
    const values = items.map(item => {
      const fieldKey = `${field.type}${field.index}Value` as keyof typeof item
      return item[fieldKey]
    }).filter(value => value !== null && value !== undefined && value !== '')
    
    return {
      fieldName: field.name,
      fieldType: field.type,
      completed: values.length,
      total: items.length,
      completionRate: items.length > 0 ? (values.length / items.length) * 100 : 0
    }
  })

  // Numeric field statistics
  const numericStats = activeFields
    .filter(field => field.type === 'number')
    .map(field => {
      const values = items
        .map(item => {
          const fieldKey = `${field.type}${field.index}Value` as keyof typeof item
          const value = item[fieldKey]
          return typeof value === 'number' ? value : null
        })
        .filter((value): value is number => value !== null && !isNaN(value))

      if (values.length === 0) {
        return {
          fieldName: field.name,
          count: 0,
          average: 0,
          min: 0,
          max: 0,
          sum: 0
        }
      }

      const sum = values.reduce((a, b) => a + b, 0)
      const average = sum / values.length

      return {
        fieldName: field.name,
        count: values.length,
        average: Number(average.toFixed(2)),
        min: Number(Math.min(...values).toFixed(2)),
        max: Number(Math.max(...values).toFixed(2)),
        sum: Number(sum.toFixed(2))
      }
    })

  // String field statistics (most frequent values)
  const stringStats = activeFields
    .filter(field => field.type === 'string')
    .map(field => {
      const values = items
        .map(item => {
          const fieldKey = `${field.type}${field.index}Value` as keyof typeof item
          return item[fieldKey] as string | null
        })
        .filter((value): value is string => 
          value !== null && value !== undefined && value.trim() !== ''
        )

      if (values.length === 0) {
        return {
          fieldName: field.name,
          uniqueValues: 0,
          totalValues: 0,
          mostFrequent: []
        }
      }

      // Calculate frequency
      const frequency: Record<string, number> = {}
      values.forEach(value => {
        frequency[value] = (frequency[value] || 0) + 1
      })

      const sortedFrequency = Object.entries(frequency)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5) // Top 5 most frequent values

      return {
        fieldName: field.name,
        uniqueValues: Object.keys(frequency).length,
        totalValues: values.length,
        mostFrequent: sortedFrequency.map(([value, count]) => ({
          value,
          count,
          percentage: Number(((count / values.length) * 100).toFixed(1))
        }))
      }
    })

  // Boolean field statistics
  const booleanStats = activeFields
    .filter(field => field.type === 'boolean')
    .map(field => {
      const values = items
        .map(item => {
          const fieldKey = `${field.type}${field.index}Value` as keyof typeof item
          return item[fieldKey] as boolean | null
        })
        .filter((value): value is boolean => value !== null)

      if (values.length === 0) {
        return {
          fieldName: field.name,
          total: 0,
          trueCount: 0,
          falseCount: 0,
          truePercentage: 0,
          falsePercentage: 0
        }
      }

      const trueCount = values.filter(value => value === true).length
      const falseCount = values.filter(value => value === false).length

      return {
        fieldName: field.name,
        total: values.length,
        trueCount,
        falseCount,
        truePercentage: Number(((trueCount / values.length) * 100).toFixed(1)),
        falsePercentage: Number(((falseCount / values.length) * 100).toFixed(1))
      }
    })

  // Text field statistics (length analysis)
  const textStats = activeFields
    .filter(field => field.type === 'text')
    .map(field => {
      const values = items
        .map(item => {
          const fieldKey = `${field.type}${field.index}Value` as keyof typeof item
          return item[fieldKey] as string | null
        })
        .filter((value): value is string => 
          value !== null && value !== undefined && value.trim() !== ''
        )

      if (values.length === 0) {
        return {
          fieldName: field.name,
          totalEntries: 0,
          averageLength: 0,
          maxLength: 0,
          minLength: 0
        }
      }

      const lengths = values.map(text => text.length)
      const totalLength = lengths.reduce((a, b) => a + b, 0)

      return {
        fieldName: field.name,
        totalEntries: values.length,
        averageLength: Number((totalLength / values.length).toFixed(1)),
        maxLength: Math.max(...lengths),
        minLength: Math.min(...lengths)
      }
    })

  // Recent activity (last 7 days)
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const recentItems = items.filter(item => 
    new Date(item.createdAt) > oneWeekAgo
  ).length

  // Overall completion rate
  const overallCompletionRate = fieldCompletion.length > 0 
    ? fieldCompletion.reduce((sum, field) => sum + field.completionRate, 0) / fieldCompletion.length
    : 0

  return {
    overview: {
      totalItems,
      recentItems,
      activeFields: activeFields.length,
      overallCompletionRate: Number(overallCompletionRate.toFixed(1)),
      calculatedAt: new Date().toISOString()
    },
    fieldCompletion,
    numericFields: numericStats,
    stringFields: stringStats,
    booleanFields: booleanStats,
    textFields: textStats
  }
}

// Helper method to get active fields
private getActiveFields(inventory: any) {
  const fields: Array<{name: string, type: string, index: number}> = []
  
  // Check all field types
  const fieldTypes = ['string', 'text', 'number', 'boolean', 'link'] as const
  const counts = [1, 2, 3] as const

  fieldTypes.forEach(type => {
    counts.forEach(index => {
      const nameKey = `${type}${index}Name` as keyof typeof inventory
      const visibleKey = `${type}${index}Visible` as keyof typeof inventory
      
      if (inventory[nameKey] && inventory[visibleKey]) {
        fields.push({
          name: inventory[nameKey] as string,
          type,
          index
        })
      }
    })
  })

  return fields
}

  async updateCustomIdFormat(inventoryId: string, format: any[]) {
    if (format.length > 10) {
      throw new ValidationError('Maximum 10 elements allowed')
    }

    return await this.inventoryRepository.updateCustomIdFormat(
      inventoryId,
      format
    )
  }

  async generateItemCustomId(
    inventoryId: string
  ): Promise<{ customId: string; sequenceNumber?: number }> {
    const inventory = await this.inventoryRepository.findById(inventoryId)
    console.log({ inventoryId })
    if (!inventory?.customIdFormat) {
      return { customId: `item-${Date.now()}` }
    }

    const format = inventory.customIdFormat as any

    try {
      return await this.customIdService.generateCustomId(inventoryId, format)
    } catch (error) {
      console.error('Failed to generate custom ID:', error)
      throw new Error(
        'Failed to generate unique custom ID. Please try again or modify the format.'
      )
    }
  }

  async generateCustomIdPreview(format: any[]): Promise<string> {
    return await this.customIdService.generatePreview(format)
  }

  async getAllInventoryTags() {
    const tagsData = await this.inventoryRepository.getAllInventoryTags()

    const tagMap: Record<string, number> = {}

    tagsData
      .flatMap((entry) => entry.tags)
      .forEach((tag) => {
        tagMap[tag] = (tagMap[tag] || 0) + 1
      })

    const tags: { name: string; count: number }[] = Object.entries(tagMap).map(
      ([name, count]) => ({ name, count })
    )

    return Array.from(tags).sort((a, b) => b.count - a.count)
  }

  async getPublicInventoryTags() {
    const tagsData = await this.inventoryRepository.getPublicInventoryTags()

    const tagMap: Record<string, number> = {}

    tagsData
      .flatMap((entry) => entry.tags)
      .forEach((tag) => {
        tagMap[tag] = (tagMap[tag] || 0) + 1
      })

    const tags: { name: string; count: number }[] = Object.entries(tagMap).map(
      ([name, count]) => ({ name, count })
    )

    return Array.from(tags).sort((a, b) => b.count - a.count)
  }

  async getPopularTags(limit: number = 10) {
    const tags = await this.getPublicInventoryTags()
    return tags.slice(0, limit)
  }
}
