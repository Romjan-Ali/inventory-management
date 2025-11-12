// backend/src/services/ItemService.ts
import { ItemRepository } from '../repositories/ItemRepository'
import { AccessService } from './AccessService'
import {
  ValidationError,
  PermissionError,
  OptimisticLockError,
  DuplicateError,
  NotFoundError,
} from '../errors'
import type { CreateItemRequest } from '../types'
import { prisma } from '../lib/prisma'

export class ItemService {
  constructor(
    private itemRepository: ItemRepository,
    private accessService: AccessService
  ) {}

  async createItem(data: CreateItemRequest, userId: string) {
    // Check write access
    const canWrite = await this.accessService.canWriteItem(
      data.inventoryId,
      userId
    )
    if (!canWrite) {
      throw new PermissionError('No write access to this inventory')
    }

    // Check if custom ID is unique within inventory
    const exists = await this.itemRepository.checkCustomIdExists(
      data.inventoryId,
      data.customId
    )
    if (exists) {
      throw new DuplicateError('Custom ID must be unique within this inventory')
    }

    const item = await this.itemRepository.create({
      ...data,
      creatorId: userId,
    })

    return item
  }

  async getItem(id: string, userId?: string) {
    const item = await this.itemRepository.findById(id)

    if (!item) {
      throw new NotFoundError('Item')
    }

    const canWrite = await this.accessService.canWriteItem(
      item?.inventoryId || '',
      userId || ''
    )

    if (!canWrite) {
      throw new PermissionError('No read/write access to this item')
    }

    return { ...item, canWrite }
  }

  async updateItem(id: string, data: any, userId: string) {
    const item = await this.itemRepository.findById(id)

    if (!item) {
      throw new NotFoundError('Item')
    }

    // Check write access
    const canWrite = await this.accessService.canWriteItem(
      item.inventoryId,
      userId
    )
    if (!canWrite) {
      throw new PermissionError('No write access to this item')
    }

    try {
      const updatedItem = await this.itemRepository.updateWithLock(
        id,
        data.version,
        data
      )
      return updatedItem
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new OptimisticLockError()
      }
      throw error
    }
  }

  async deleteItem(id: string, userId: string) {
    const item = await this.itemRepository.findById(id)

    if (!item) {
      throw new NotFoundError('Item')
    }

    // Check write access
    const canWrite = await this.accessService.canWriteItem(
      item.inventoryId,
      userId
    )
    if (!canWrite) {
      throw new PermissionError('No write access to this item')
    }

    await this.itemRepository.delete(id)
  }

  async getInventoryItems(
    inventoryId: string,
    params: { page?: number; limit?: number } = {}
  ) {
    return this.itemRepository.findByInventory(inventoryId, params)
  }

  async likeItem(itemId: string, userId: string) {
    const item = await this.itemRepository.findById(itemId)

    if (!item) {
      throw new NotFoundError('Item')
    }

    // Check if already liked
    const existingLike = await prisma.like.findUnique({
      where: {
        itemId_userId: {
          itemId,
          userId,
        },
      },
    })

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: {
          itemId_userId: {
            itemId,
            userId,
          },
        },
      })
      return { liked: false }
    } else {
      // Like
      await prisma.like.create({
        data: {
          itemId,
          userId,
        },
      })
      return { liked: true }
    }
  }
}
