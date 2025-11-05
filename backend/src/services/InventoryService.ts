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

  async getAllInventories(params: {
    page?: number
    limit?: number
    search?: string
    category?: string
    tags?: string[]
  }) {
    return this.inventoryRepository.findAll(params)
  }

  async getPopularInventories(limit: number = 5) {
    return this.inventoryRepository.getPopular(limit)
  }

  async getInventories(
    params: {
      page?: number
      limit?: number
      search?: string
      category?: string
      tags?: string[]
      sort?: string
    },
    userId?: string
  ) {
    const isPublic = !userId
    const result = isPublic
      ? this.inventoryRepository.find(params, isPublic)
      : this.inventoryRepository.find(params)
    return result
  }

  async getInventoryStatistics(inventoryId: string) {
    // Get inventory with all items using the repository
    const inventory = await this.inventoryRepository.findById(inventoryId)

    if (!inventory) {
      throw new Error('Inventory not found')
    }

    const items = await this.inventoryRepository.findItemsByInventoryId(
      inventoryId
    )
    const totalItems = items.length

    // Initialize statistics object
    const stats: any = {
      totalItems,
      calculatedAt: new Date().toISOString(),
    }

    // Calculate statistics for numeric fields if they exist and are visible
    const numericFields = [
      {
        field: 'number1Value',
        name: inventory.number1Name,
        visible: inventory.number1Visible,
      },
      {
        field: 'number2Value',
        name: inventory.number2Name,
        visible: inventory.number2Visible,
      },
      {
        field: 'number3Value',
        name: inventory.number3Name,
        visible: inventory.number3Visible,
      },
    ]

    numericFields.forEach(({ field, name, visible }) => {
      if (name && visible) {
        const values = items
          .map((item) => item[field as keyof (typeof items)[0]])
          .filter((val) => val !== null && val !== undefined) as number[]

        if (values.length > 0) {
          const sum = values.reduce((a, b) => a + b, 0)
          stats[name] = {
            count: values.length,
            sum,
            average: Number((sum / values.length).toFixed(2)),
            min: Math.min(...values),
            max: Math.max(...values),
          }
        } else {
          stats[name] = { count: 0, message: 'No data available' }
        }
      }
    })

    // Calculate statistics for string fields if they exist and are visible
    const stringFields = [
      {
        field: 'string1Value',
        name: inventory.string1Name,
        visible: inventory.string1Visible,
      },
      {
        field: 'string2Value',
        name: inventory.string2Name,
        visible: inventory.string2Visible,
      },
      {
        field: 'string3Value',
        name: inventory.string3Name,
        visible: inventory.string3Visible,
      },
    ]

    stringFields.forEach(({ field, name, visible }) => {
      if (name && visible) {
        const values = items
          .map((item) => item[field as keyof (typeof items)[0]])
          .filter(
            (val) => val !== null && val !== undefined && val !== ''
          ) as string[]

        if (values.length > 0) {
          const frequency: Record<string, number> = {}
          values.forEach((value) => {
            frequency[value] = (frequency[value] || 0) + 1
          })

          const sortedFrequency = Object.entries(frequency)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5) // Top 5 most frequent values

          stats[name] = {
            uniqueValues: Object.keys(frequency).length,
            totalValues: values.length,
            mostFrequent: sortedFrequency.map(([value, count]) => ({
              value,
              count,
            })),
          }
        } else {
          stats[name] = {
            uniqueValues: 0,
            totalValues: 0,
            message: 'No data available',
          }
        }
      }
    })

    // Calculate statistics for text fields if they exist and are visible
    const textFields = [
      {
        field: 'text1Value',
        name: inventory.text1Name,
        visible: inventory.text1Visible,
      },
      {
        field: 'text2Value',
        name: inventory.text2Name,
        visible: inventory.text2Visible,
      },
      {
        field: 'text3Value',
        name: inventory.text3Name,
        visible: inventory.text3Visible,
      },
    ]

    textFields.forEach(({ field, name, visible }) => {
      if (name && visible) {
        const values = items
          .map((item) => item[field as keyof (typeof items)[0]])
          .filter(
            (val) => val !== null && val !== undefined && val !== ''
          ) as string[]

        if (values.length > 0) {
          stats[name] = {
            totalEntries: values.length,
            averageLength: Number(
              (
                values.reduce((sum, val) => sum + val.length, 0) / values.length
              ).toFixed(2)
            ),
          }
        } else {
          stats[name] = { totalEntries: 0, message: 'No data available' }
        }
      }
    })

    // Calculate statistics for boolean fields if they exist and are visible
    const booleanFields = [
      {
        field: 'boolean1Value',
        name: inventory.boolean1Name,
        visible: inventory.boolean1Visible,
      },
      {
        field: 'boolean2Value',
        name: inventory.boolean2Name,
        visible: inventory.boolean2Visible,
      },
      {
        field: 'boolean3Value',
        name: inventory.boolean3Name,
        visible: inventory.boolean3Visible,
      },
    ]

    booleanFields.forEach(({ field, name, visible }) => {
      if (name && visible) {
        const values = items
          .map((item) => item[field as keyof (typeof items)[0]])
          .filter((val) => val !== null && val !== undefined) as boolean[]

        if (values.length > 0) {
          const trueCount = values.filter((val) => val === true).length
          const falseCount = values.filter((val) => val === false).length

          stats[name] = {
            total: values.length,
            trueCount,
            falseCount,
            truePercentage: Number(
              ((trueCount / values.length) * 100).toFixed(1)
            ),
            falsePercentage: Number(
              ((falseCount / values.length) * 100).toFixed(1)
            ),
          }
        } else {
          stats[name] = { total: 0, message: 'No data available' }
        }
      }
    })

    return stats
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
    console.log({inventoryId})
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
    const tagsSet = new Set<string>()
    tagsData.flatMap(entry => entry.tags).forEach(tag => tagsSet.add(tag));
    return Array.from(tagsSet)
  }

  async getAllPublicInventoryTags() {
    const tagsData = await this.inventoryRepository.getAllPublicInventoryTags()

    const tagMap: Record<string, number> = {};

    tagsData
      .flatMap(entry => entry.tags)
      .forEach(tag => {
        tagMap[tag] = (tagMap[tag] || 0) + 1;
      });

    const tags: { name: string; count: number }[] = Object.entries(tagMap).map(
      ([name, count]) => ({ name, count })
    );

    return Array.from(tags)
  }
}
