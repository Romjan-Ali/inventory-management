import express from 'express'
import { ItemController } from '../controllers/ItemController'
import { ItemService } from '../services/ItemService'
import { AccessService } from '../services/AccessService'
import { ItemRepository } from '../repositories/ItemRepository'
import { authMiddleware } from '../middleware/auth'
import { prisma } from '../lib/prisma'

const router = express.Router()

// Initialize dependencies
const itemRepository = new ItemRepository(prisma)
const accessService = new AccessService()
const itemService = new ItemService(itemRepository, accessService)
const itemController = new ItemController(itemService)

// Public routes
router.get('/:id', itemController.getItem)
router.get('/inventory/:inventoryId/items', itemController.getInventoryItems)

// Protected routes
router.post(
  '/inventory/:inventoryId/items',
  authMiddleware,
  itemController.createItem
)
router.put('/:id', authMiddleware, itemController.updateItem)
router.delete('/:id', authMiddleware, itemController.deleteItem)
router.post('/:id/like', authMiddleware, itemController.likeItem)

export default router
