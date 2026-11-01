import express from 'express'
import { protect } from '../middleware/authMiddleware.js'
import { authorize } from '../middleware/roleMiddleware.js'
import {
  getEmployees,
  createUser,
  getAllUsers,
  deleteUser,
} from '../controllers/userController.js'

const router = express.Router()

// All user management routes require admin role
router.use(protect, authorize('admin'))

// List employees for ticket assignment
router.get('/employees', getEmployees)

// List all users
router.get('/', getAllUsers)

// Admin creates employee or admin account
router.post('/', createUser)

// Admin deletes a user account
router.delete('/:id', deleteUser)

export default router
