// backend/src/services/InventoryService.ts
import { InventoryRepository } from '../repositories/InventoryRepository'
import { AccessService } from './AccessService'
import {
  ValidationError,
  PermissionError,
  OptimisticLockError,
  NotFoundError,
} from '../errors'
import type { CreateInventoryRequest, UpdateInventoryRequest } from '../types'
import { prisma } from '../lib/prisma'

export class InventoryService {
  constructor(
    private inventoryRepository: InventoryRepository,
    private accessService: AccessService
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

    return inventory
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
}
