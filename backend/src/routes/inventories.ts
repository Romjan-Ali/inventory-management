// backend/src/routes/inventories.ts
import express from 'express'
import { InventoryController } from '../controllers/InventoryController'
import { InventoryService } from '../services/InventoryService'
import { AccessService } from '../services/AccessService'
import { InventoryRepository } from '../repositories/InventoryRepository'
import { authMiddleware } from '../middleware/auth'
import { prisma } from '../lib/prisma'

const router = express.Router()

// Initialize dependencies
const inventoryRepository = new InventoryRepository(prisma)
const accessService = new AccessService()
const inventoryService = new InventoryService(
  inventoryRepository,
  accessService
)
const inventoryController = new InventoryController(
  inventoryService,
  accessService
)

// Public routes
router.get('/', inventoryController.getAllInventories)
router.get('/popular', inventoryController.getPopularInventories)
router.get('/:id', inventoryController.getInventory)

// Protected routes
router.post('/', authMiddleware, inventoryController.createInventory)
router.put('/:id', authMiddleware, inventoryController.updateInventory)
router.delete('/:id', authMiddleware, inventoryController.deleteInventory)
router.get(
  '/user/my-inventories',
  authMiddleware,
  inventoryController.getUserInventories
)

// Access management routes
router.get('/:id/access', authMiddleware, inventoryController.getAccessList)
router.post('/:id/access', authMiddleware, inventoryController.grantAccess)
router.delete(
  '/:id/access/:userId',
  authMiddleware,
  inventoryController.revokeAccess
)

export default router
