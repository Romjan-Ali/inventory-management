// backend/src/controllers/ItemController.ts
import type { Request, Response } from 'express'
import { ItemService } from '../services/ItemService'
import type { AuthRequest } from '../middleware/auth'
import { ValidationError } from '../errors'

export class ItemController {
  constructor(private itemService: ItemService) {}

  createItem = async (req: AuthRequest, res: Response) => {
    try {
      const { inventoryId } = req.params
      const itemData = req.body
      const userId = req.user.id

      // Check if inventoryId is provided
      if (!inventoryId) {
        return res.status(400).json({ error: 'Inventory ID is required' })
      }

      const item = await this.itemService.createItem(
        { ...itemData, inventoryId },
        userId
      )

      res.status(201).json(item)
    } catch (error: any) {
      if (error.statusCode) {
        res.status(error.statusCode).json({ error: error.message })
      } else if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message })
      } else {
        console.error('Create item error:', error)
        res.status(500).json({ error: 'Failed to create item' })
      }
    }
  }

  getItem = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params

      // Check if id is provided
      if (!id) {
        return res.status(400).json({ error: 'Item ID is required' })
      }

      const item = await this.itemService.getItem(id)
      res.json(item)
    } catch (error: any) {
      if (error.statusCode === 404) {
        res.status(404).json({ error: error.message })
      } else if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message })
      } else {
        console.error('Get item error:', error)
        res.status(500).json({ error: 'Failed to fetch item' })
      }
    }
  }

  updateItem = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params
      const updates = req.body
      const userId = req.user.id

      // Check if id is provided
      if (!id) {
        return res.status(400).json({ error: 'Item ID is required' })
      }

      const item = await this.itemService.updateItem(id, updates, userId)
      res.json(item)
    } catch (error: any) {
      if (error.statusCode) {
        res.status(error.statusCode).json({ error: error.message })
      } else if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message })
      } else {
        console.error('Update item error:', error)
        res.status(500).json({ error: 'Failed to update item' })
      }
    }
  }

  deleteItem = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params
      const userId = req.user.id

      // Check if id is provided
      if (!id) {
        return res.status(400).json({ error: 'Item ID is required' })
      }

      await this.itemService.deleteItem(id, userId)
      res.json({ message: 'Item deleted successfully' })
    } catch (error: any) {
      if (error.statusCode) {
        res.status(error.statusCode).json({ error: error.message })
      } else if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message })
      } else {
        console.error('Delete item error:', error)
        res.status(500).json({ error: 'Failed to delete item' })
      }
    }
  }

  getInventoryItems = async (req: AuthRequest, res: Response) => {
    try {
      const { inventoryId } = req.params
      const { page, limit } = req.query

      // Check if inventoryId is provided
      if (!inventoryId) {
        return res.status(400).json({ error: 'Inventory ID is required' })
      }

      const items = await this.itemService.getInventoryItems(inventoryId, {
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      })

      res.json(items)
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message })
      } else {
        console.error('Get inventory items error:', error)
        res.status(500).json({ error: 'Failed to fetch items' })
      }
    }
  }

  likeItem = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params
      const userId = req.user.id

      // Check if id is provided
      if (!id) {
        return res.status(400).json({ error: 'Item ID is required' })
      }

      const result = await this.itemService.likeItem(id, userId)
      res.json(result)
    } catch (error: any) {
      if (error.statusCode === 404) {
        res.status(404).json({ error: error.message })
      } else if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message })
      } else {
        console.error('Like item error:', error)
        res.status(500).json({ error: 'Failed to like item' })
      }
    }
  }
}
