import express from 'express'
import { protect } from '../middleware/authMiddleware.js'
import { authorize } from '../middleware/roleMiddleware.js'
import { getAnalytics } from '../controllers/analyticsController.js'

const router = express.Router()

// Admin only analytics dashboard endpoint
router.get('/', protect, authorize('admin'), getAnalytics)

export default router
