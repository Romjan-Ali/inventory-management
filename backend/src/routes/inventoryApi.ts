// backend/src/routes/inventoryApi.ts
import express from 'express'
import { InventoryApiController } from '../controllers/InventoryApiController'
import { InventoryService } from '../services/InventoryService'
import { ApiTokenService } from '../services/ApiTokenService'
import { InventoryRepository } from '../repositories/InventoryRepository'
import { AccessService } from '../services/AccessService'
import { CustomIdService } from '../services/CustomIdService'
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth'
import { prisma } from '../lib/prisma'

const router = express.Router()

// Initialize dependencies
const inventoryRepository = new InventoryRepository(prisma)
const accessService = new AccessService()
const customIdService = new CustomIdService()
const inventoryService = new InventoryService(inventoryRepository, accessService, customIdService)
const apiTokenService = new ApiTokenService()
const inventoryApiController = new InventoryApiController(inventoryService, apiTokenService, accessService)

// Public API endpoints (token-based access)
router.get('/stats', inventoryApiController.getInventoryStats)
router.get('/odoo-data', inventoryApiController.getInventoryDataForOdoo)

// Protected API token management endpoints (regular auth required)
router.get('/:inventoryId/tokens', authMiddleware, inventoryApiController.getApiTokens)
router.post('/:inventoryId/tokens', authMiddleware, inventoryApiController.generateApiToken)
router.delete('/:inventoryId/tokens/:tokenId', authMiddleware, inventoryApiController.revokeApiToken)

export default router