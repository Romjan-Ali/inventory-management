import express from 'express'
import { UserController } from '../controllers/UserController'
import { UserRepository } from '../repositories/UserRepository'
import { authMiddleware, adminMiddleware } from '../middleware/auth'
import { prisma } from '../lib/prisma'

const router = express.Router()
const userRepository = new UserRepository(prisma)
const userController = new UserController(userRepository)

// Get current user profile
router.get('/me', authMiddleware, userController.getCurrentUser)

// Get user profile by ID
router.get('/:id', userController.getUserProfile)

// Admin routes
router.get('/', authMiddleware, userController.getAllUsers)
router.post(
  '/:id/block',
  authMiddleware,
  adminMiddleware,
  userController.blockUser
)
router.post(
  '/:id/admin',
  authMiddleware,
  adminMiddleware,
  userController.makeAdmin
)

export default router
