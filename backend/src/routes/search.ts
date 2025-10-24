// backend/src/routes/search.ts
import express from 'express'
import { SearchController } from '../controllers/SearchController'

const router = express.Router()
const searchController = new SearchController()

router.get('/', searchController.search)
router.get('/tags', searchController.getTags)

export default router
