// backend/src/routes/index.ts
import express from 'express'
import authRoutes from './auth'
import userRoutes from './users'
import inventoryRoutes from './inventories'
import itemRoutes from './items'
import searchRoutes from './search'
import postRoutes from './posts'

const router = express.Router()

router.use('/auth', authRoutes)
router.use('/users', userRoutes)
router.use('/inventories', inventoryRoutes)
router.use('/items', itemRoutes)
router.use('/search', searchRoutes)
router.use('/posts', postRoutes)

export default router
