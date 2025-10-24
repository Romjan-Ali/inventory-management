// backend/src/routes/posts.ts
import express from 'express'
import { PostController } from '../controllers/PostController'
import { authMiddleware } from '../middleware/auth'

const router = express.Router()
const postController = new PostController()

// Public routes
router.get('/inventory/:inventoryId', postController.getPosts)

// Protected routes
router.post(
  '/inventory/:inventoryId',
  authMiddleware,
  postController.createPost
)
router.delete('/:id', authMiddleware, postController.deletePost)

export default router
