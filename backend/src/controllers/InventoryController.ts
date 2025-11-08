// backend/src/controllers/InventoryController.ts
import type { Request, Response } from 'express'
import { InventoryService } from '../services/InventoryService'
import { AccessService } from '../services/AccessService'
import type { AuthRequest } from '../middleware/auth'
import { type User } from '@prisma/client'
import { ValidationError } from '../errors'

export class InventoryController {
  constructor(
    private inventoryService: InventoryService,
    private accessService: AccessService
  ) {}

  createInventory = async (req: AuthRequest, res: Response) => {
    try {
      const { title, description, imageUrl, category, tags, isPublic } =
        req.body
      const userId = req.user.id

      const inventory = await this.inventoryService.createInventory(
        { title, description, imageUrl, category, tags: tags || [], isPublic },
        userId
      )

      res.status(201).json(inventory)
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message })
      } else {
        console.error('Create inventory error:', error)
        res.status(500).json({ error: 'Failed to create inventory' })
      }
    }
  }

  getInventory = async (req: Request, res: Response) => {
    try {
      const { id } = req.params

      // Check if id is provided
      if (!id) {
        return res.status(400).json({ error: 'Inventory ID is required' })
      }

      const userId = (req.user as User | undefined)?.id || undefined

      const inventory = await this.inventoryService.getInventory(id, userId)
      res.json(inventory)
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message })
      } else {
        res.status(404).json({ error: 'Inventory not found' })
      }
    }
  }

  updateInventory = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params
      const updates = req.body
      const userId = req.user.id

      // Check if id is provided
      if (!id) {
        return res.status(400).json({ error: 'Inventory ID is required' })
      }

      const inventory = await this.inventoryService.updateInventory(
        id,
        updates,
        userId
      )
      res.json(inventory)
    } catch (error: any) {
      if (error.statusCode) {
        res.status(error.statusCode).json({ error: error.message })
      } else if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message })
      } else {
        console.error('Update inventory error:', error)
        res.status(500).json({ error: 'Failed to update inventory' })
      }
    }
  }

  deleteInventory = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params
      const userId = req.user.id

      // Check if id is provided
      if (!id) {
        return res.status(400).json({ error: 'Inventory ID is required' })
      }

      await this.inventoryService.deleteInventory(id, userId)
      res.json({ message: 'Inventory deleted successfully' })
    } catch (error: any) {
      if (error.statusCode) {
        res.status(error.statusCode).json({ error: error.message })
      } else if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message })
      } else {
        console.error('Delete inventory error:', error)
        res.status(500).json({ error: 'Failed to delete inventory' })
      }
    }
  }

  getUserInventories = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user.id
      const inventories = await this.inventoryService.getUserInventories(userId)
      res.json(inventories)
    } catch (error) {
      console.error('Get user inventories error:', error)
      res.status(500).json({ error: 'Failed to fetch inventories' })
    }
  }

  getInventories = async (req: AuthRequest, res: Response) => {
    try {
      const { page, limit, search, category, tags, sort, type } = req.query

      const user = (req.user as User | undefined) || undefined

      const params = {
        page: page ? Math.max(1, parseInt(page as string)) : 1,
        limit: limit
          ? Math.min(Math.max(1, parseInt(limit as string)), 100)
          : 20,
        search: search ? (search as string).trim() : undefined,
        category: category ? (category as string).trim() : undefined,
        tags: tags
          ? Array.isArray(tags)
            ? (tags as string[]).map((t) => t.trim()).filter((t) => t)
            : [(tags as string).trim()].filter((t) => t)
          : undefined,
        sort:
          sort &&
          ['newest', 'oldest', 'popular', 'items', 'title'].includes(
            sort as string
          )
            ? (sort as string)
            : undefined,
        inventoryType:
          type === 'owned' ||
          type === 'shared' ||
          type === 'public_and_accessable'
            ? (type as 'owned' | 'shared' | 'public_and_accessable')
            : 'public',
      }

      const inventories = user
        ? await this.inventoryService.getInventories(params, user)
        : await this.inventoryService.getInventories(params)

      return res.json(inventories)
    } catch (error) {
      console.error('Get inventories error:', error)
      res.status(500).json({ error: 'Failed to fetch inventories' })
    }
  }

  getPopularInventories = async (req: AuthRequest, res: Response) => {
    try {
      const { limit } = req.query
      const inventories = await this.inventoryService.getPopularInventories(
        limit ? parseInt(limit as string) : 5
      )
      res.json(inventories)
    } catch (error) {
      console.error('Get popular inventories error:', error)
      res.status(500).json({ error: 'Failed to fetch popular inventories' })
    }
  }

  getAccessList = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params
      const userId = req.user.id

      // Check if id is provided
      if (!id) {
        return res.status(400).json({ error: 'Inventory ID is required' })
      }

      // Check if user has write access to view access list
      const canWrite = await this.accessService.canWriteInventory(id, userId)
      if (!canWrite) {
        return res
          .status(403)
          .json({ error: 'No write access to this inventory' })
      }

      const accessList = await this.accessService.getAccessList(id)
      res.json(accessList)
    } catch (error) {
      console.error('Get access list error:', error)
      res.status(500).json({ error: 'Failed to fetch access list' })
    }
  }

  grantAccess = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params
      const { userId: targetUserId, canWrite } = req.body
      const currentUserId = req.user.id

      // Check if inventory id is provided
      if (!id) {
        return res.status(400).json({ error: 'Inventory ID is required' })
      }

      // Check if target user id is provided
      if (!targetUserId) {
        return res.status(400).json({ error: 'User ID is required' })
      }

      // Check if current user has write access
      const canWriteInventory = await this.accessService.canWriteInventory(
        id,
        currentUserId
      )
      if (!canWriteInventory) {
        return res
          .status(403)
          .json({ error: 'No write access to this inventory' })
      }

      await this.accessService.grantAccess(id, targetUserId, canWrite)
      res.status(201).json({ message: 'Access granted successfully' })
    } catch (error) {
      console.error('Grant access error:', error)
      res.status(500).json({ error: 'Failed to grant access' })
    }
  }

  revokeAccess = async (req: AuthRequest, res: Response) => {
    try {
      const { id, userId: targetUserId } = req.params
      const currentUserId = req.user.id

      // Check if inventory id is provided
      if (!id) {
        return res.status(400).json({ error: 'Inventory ID is required' })
      }

      // Check if target user id is provided
      if (!targetUserId) {
        return res.status(400).json({ error: 'User ID is required' })
      }

      // Check if current user has write access
      const canWrite = await this.accessService.canWriteInventory(
        id,
        currentUserId
      )
      if (!canWrite) {
        return res
          .status(403)
          .json({ error: 'No write access to this inventory' })
      }

      await this.accessService.revokeAccess(id, targetUserId)
      res.json({ message: 'Access revoked successfully' })
    } catch (error) {
      console.error('Revoke access error:', error)
      res.status(500).json({ error: 'Failed to revoke access' })
    }
  }

  updateCustomIdFormat = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params
      const { format } = req.body
      const currentUserId = req.user.id

      // Check if inventory id is provided
      if (!id) {
        return res.status(400).json({ error: 'Inventory ID is required' })
      }

      // Check if user owns the inventory
      const canWrite = await this.accessService.canWriteInventory(
        id,
        currentUserId
      )
      if (!canWrite) {
        return res
          .status(403)
          .json({ error: 'No permission to edit this inventory' })
      }

      const inventory = await this.inventoryService.updateCustomIdFormat(
        id,
        format
      )
      res.json(inventory)
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message })
      } else {
        console.error('Update custom ID format error:', error)
        res.status(500).json({ error: 'Failed to update custom ID format' })
      }
    }
  }

  generateCustomId = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params

      // Check if inventory id is provided
      if (!id) {
        return res.status(400).json({ error: 'Inventory ID is required' })
      }

      const customId = await this.inventoryService.generateItemCustomId(id)

      res.json(customId)
    } catch (error: any) {
      console.error('Generate custom ID error:', error)
      res.status(500).json({ error: 'Failed to generate custom ID' })
    }
  }

  previewCustomId = async (req: AuthRequest, res: Response) => {
    try {
      const { format } = req.body
      const preview = await this.inventoryService.generateCustomIdPreview(
        format
      )
      res.json({ preview })
    } catch (error: any) {
      console.error('Preview custom ID error:', error)
      res.status(500).json({ error: 'Failed to generate preview' })
    }
  }

  getInventoryStatistics = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params

      // Check if inventory id is provided
      if (!id) {
        return res.status(400).json({ error: 'Inventory ID is required' })
      }

      const stats = await this.inventoryService.getInventoryStatistics(id)
      res.json(stats)
    } catch (error: any) {
      console.error('Get inventory statistics error:', error)
      res.status(500).json({ error: 'Failed to fetch statistics' })
    }
  }

  getAllInventoryTags = async (req: Request, res: Response) => {
    try {
      const tags = await this.inventoryService.getAllInventoryTags()
      res.json(tags)
    } catch (error: any) {
      console.error('Get all inventory tags error:', error)
      res.status(500).json({ error: 'Failed to fetch inventory tags' })
    }
  }

  getPublicInventoryTags = async (req: Request, res: Response) => {
    try {
      const { limit } = req.params
      const tags = await this.inventoryService.getPublicInventoryTags()
      res.json(tags)
    } catch (error: any) {
      console.error('Get all public inventory tags error:', error)
      res.status(500).json({ error: 'Failed to fetch public inventory tags' })
    }
  }

  getPopularTags = async (req: Request, res: Response) => {
    try {
      const { limit } = req.query
      const tags = await this.inventoryService.getPopularTags(limit ? parseInt(limit as string) : 10)
      res.json(tags)
    } catch (error: any) {
      console.error('Get all public inventory tags error:', error)
      res.status(500).json({ error: 'Failed to fetch public inventory tags' })
    }
  }
}
