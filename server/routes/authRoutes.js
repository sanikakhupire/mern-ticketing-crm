import express from 'express'
import { registerUser, loginUser, logoutUser, refreshAccessToken } from '../controllers/authController.js'
import { protect } from '../middleware/authMiddleware.js'
import { authorize } from '../middleware/roleMiddleware.js'

const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/logout', logoutUser)
router.post('/refresh', refreshAccessToken)

router.get('/me', protect, (req, res) => {
  res.status(200).json({ user: req.user })
})

router.get('/admin-only', protect, authorize('admin'), (req, res) => {
  res.status(200).json({ message: 'Welcome, admin!' })
})

export default router