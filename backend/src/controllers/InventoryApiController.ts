// backend/src/controllers/InventoryApiController.ts
import type { Request, Response } from 'express'
import { InventoryService } from '../services/InventoryService'
import { ApiTokenService } from '../services/ApiTokenService'
import type { AccessService } from '../services/AccessService'
import { NotFoundError, PermissionError } from '../errors'
import type { User } from '@prisma/client'

export class InventoryApiController {
  constructor(
    private inventoryService: InventoryService,
    private apiTokenService: ApiTokenService,
    private accessService: AccessService
  ) {}

  getInventoryStats = async (req: Request, res: Response) => {
    try {
      const token = req.headers['x-api-token'] as string
      const user = (req.user as User | undefined) || undefined

      if (!token) {
        return res.status(401).json({ error: 'API token required' })
      }

      const { inventoryId, isValid } = await this.apiTokenService.validateToken(
        token
      )

      if (!isValid) {
        return res.status(401).json({ error: 'Invalid or expired API token' })
      }

      const inventory = await this.inventoryService.getInventory(
        inventoryId,
        user?.id
      )

      if (!inventory) {
        throw new NotFoundError('Inventory')
      }

      const stats = await this.inventoryService.getInventoryStatistics(
        inventoryId
      )

      res.json({
        inventory: {
          id: inventory.id,
          title: inventory.title,
          description: inventory.description,
          category: inventory.category,
          tags: inventory.tags,
          createdAt: inventory.createdAt,
          updatedAt: inventory.updatedAt,
        },
        statistics: stats,
        fieldConfigurations: this.getFieldConfigurations(inventory),
      })
    } catch (error: any) {
      if (error.statusCode) {
        res.status(error.statusCode).json({ error: error.message })
      } else {
        console.error('Inventory API error:', error)
        res.status(500).json({ error: 'Failed to fetch inventory data' })
      }
    }
  }

  private getFieldConfigurations(inventory: any) {
    const fields = []

    // Extract field configurations from inventory
    for (let i = 1; i <= 3; i++) {
      if (inventory[`string${i}Name`]) {
        fields.push({
          type: 'string',
          index: i,
          name: inventory[`string${i}Name`],
          description: inventory[`string${i}Description`],
        })
      }
      if (inventory[`number${i}Name`]) {
        fields.push({
          type: 'number',
          index: i,
          name: inventory[`number${i}Name`],
          description: inventory[`number${i}Description`],
        })
      }
      if (inventory[`boolean${i}Name`]) {
        fields.push({
          type: 'boolean',
          index: i,
          name: inventory[`boolean${i}Name`],
          description: inventory[`boolean${i}Description`],
        })
      }
    }

    return fields
  }

  // Generate API token for inventory (protected by main auth, not API token)
  generateApiToken = async (req: Request, res: Response) => {
    try {
      // This endpoint should be protected by regular auth middleware, not API token
      const { inventoryId } = req.params
      const userId = (req as any).user?.id // Assuming you'll add auth middleware to this route

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' })
      }

      if (!inventoryId) {
        return res.status(400).json({ error: 'Inventory ID is required' })
      }

      const canWriteInventory = await this.accessService.canWriteInventory(
        inventoryId,
        userId
      )

      if (!canWriteInventory) {
        throw new PermissionError(
          'You do not have permission to generate API tokens for this inventory'
        )
      }

      const token = await this.apiTokenService.generateToken(inventoryId)

      console.log('Generated API token:', token)

      res.status(201).json(token)
    } catch (error) {
      console.error('Generate API token error:', error)
      res.status(500).json({ error: 'Failed to generate API token' })
    }
  }

  // Get all tokens for inventory
  getApiTokens = async (req: Request, res: Response) => {
    try {
      const { inventoryId } = req.params
      const userId = (req as any).user?.id

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' })
      }

      if (!inventoryId) {
        return res.status(400).json({ error: 'Inventory ID is required' })
      }

      const tokens = await this.apiTokenService.getInventoryTokens(inventoryId)
      res.json(tokens)
    } catch (error) {
      console.error('Get API tokens error:', error)
      res.status(500).json({ error: 'Failed to fetch API tokens' })
    }
  }

  // Revoke API token
  revokeApiToken = async (req: Request, res: Response) => {
    try {
      const { inventoryId, tokenId } = req.params
      const userId = (req as any).user?.id

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' })
      }

      if (!inventoryId) {
        return res.status(400).json({ error: 'Inventory ID is required' })
      }

      if (!tokenId) {
        return res.status(400).json({ error: 'Token ID is required' })
      }

      const canWriteInventory = await this.accessService.canWriteInventory(
        inventoryId,
        userId
      )

      if (!canWriteInventory) {
        throw new PermissionError(
          'You do not have permission to generate API tokens for this inventory'
        )
      }

      await this.apiTokenService.revokeToken(tokenId)
      res.json({ message: 'API token revoked successfully' })
    } catch (error) {
      console.error('Revoke API token error:', error)
      res.status(500).json({ error: 'Failed to revoke API token' })
    }
  }

  // Add Odoo-specific endpoint
  getInventoryDataForOdoo = async (req: Request, res: Response) => {
    try {
      const token = req.headers['x-api-token'] as string

      if (!token) {
        return res.status(401).json({ error: 'API token required' })
      }

      const { inventoryId, isValid } = await this.apiTokenService.validateToken(
        token
      )

      if (!isValid) {
        return res.status(401).json({ error: 'Invalid or expired API token' })
      }

      const inventory = await this.inventoryService.getInventory(
        inventoryId,
        undefined,
        true
      )
      const stats = await this.inventoryService.getInventoryStatistics(
        inventoryId
      )

      // Format specifically for Odoo consumption
      res.json({
        success: true,
        data: {
          inventory: {
            id: inventory.id,
            title: inventory.title,
            description: inventory.description,
            category: inventory.category,
            tags: inventory.tags,
            isPublic: inventory.isPublic,
            createdAt: inventory.createdAt,
            updatedAt: inventory.updatedAt,
            itemCount: stats.overview.totalItems,
          },
          fields: this.getFieldConfigurations(inventory),
          statistics: stats,
          aggregated_data: {
            numeric_fields: stats.numericFields,
            string_fields: stats.stringFields,
            boolean_fields: stats.booleanFields,
            text_fields: stats.textFields,
            completion_rates: stats.fieldCompletion,
            overview: stats.overview,
          },
        },
      })
    } catch (error: any) {
      console.error('Odoo API error:', error)
      if (error.statusCode) {
        res.status(error.statusCode).json({ error: error.message })
      } else {
        res
          .status(500)
          .json({ error: 'Failed to fetch inventory data for Odoo' })
      }
    }
  }
}
