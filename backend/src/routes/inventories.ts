// backend/src/routes/inventories.ts
import express from 'express'
import { InventoryController } from '../controllers/InventoryController'
import { InventoryService } from '../services/InventoryService'
import { AccessService } from '../services/AccessService'
import { InventoryRepository } from '../repositories/InventoryRepository'
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth'
import { prisma } from '../lib/prisma'
import { CustomIdService } from '../services/CustomIdService'

const router = express.Router()

// Initialize dependencies
const inventoryRepository = new InventoryRepository(prisma)
const accessService = new AccessService()
const customIdService = new CustomIdService()
const inventoryService = new InventoryService(
  inventoryRepository,
  accessService,
  customIdService
)
const inventoryController = new InventoryController(
  inventoryService,
  accessService
)

// Tags route
// router.get('/tags', inventoryController.getAllInventoryTags)
router.get('/tags/public', inventoryController.getAllPublicInventoryTags)

// Public routes
router.get('/', optionalAuthMiddleware, inventoryController.getInventories)
router.get('/popular', inventoryController.getPopularInventories)
router.get('/:id', optionalAuthMiddleware, inventoryController.getInventory)

// Protected routes
router.post('/', authMiddleware, inventoryController.createInventory)
router.put('/:id', authMiddleware, inventoryController.updateInventory)
router.delete('/:id', authMiddleware, inventoryController.deleteInventory)
router.get(
  '/user/my-inventories',
  authMiddleware,
  inventoryController.getUserInventories
)

// Custom ID Management routes
router.put('/:id/custom-id-format', authMiddleware, inventoryController.updateCustomIdFormat)
router.get('/:id/generate-custom-id', authMiddleware, inventoryController.generateCustomId)
router.post('/preview-custom-id', authMiddleware, inventoryController.previewCustomId)

// Access management routes
router.get('/:id/access', authMiddleware, inventoryController.getAccessList)
router.post('/:id/access', authMiddleware, inventoryController.grantAccess)
router.delete(
  '/:id/access/:userId',
  authMiddleware,
  inventoryController.revokeAccess
)

// Statistics route
router.get('/:id/statistics', authMiddleware, inventoryController.getInventoryStatistics)

export default router
