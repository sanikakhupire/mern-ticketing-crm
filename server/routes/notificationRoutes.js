import express from 'express'
import { protect } from '../middleware/authMiddleware.js'
import {
  getMyNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../controllers/notificationController.js'

const router = express.Router()

router.use(protect)

router.get('/', getMyNotifications)
router.get('/unread-count', getUnreadCount)
router.patch('/read-all', markAllNotificationsAsRead)
router.patch('/:id/read', markNotificationAsRead)

export default router
