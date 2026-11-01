import express from 'express'
import { protect } from '../middleware/authMiddleware.js'
import { authorize } from '../middleware/roleMiddleware.js'
import { uploadTicketImage } from '../middleware/uploadMiddleware.js'
import {
  createTicket,
  getMyTickets,
  getAllTickets,
  getAssignedTickets,
  assignTicket,
  updateTicketStatus,
  getTicketById,
} from '../controllers/ticketController.js'

const router = express.Router()

// Customer creates a ticket (supports multipart/form-data with optional image file)
router.post('/', protect, authorize('customer'), uploadTicketImage, createTicket)

// Customer views their own tickets
router.get('/my', protect, authorize('customer'), getMyTickets)

// Admin views all tickets
router.get('/', protect, authorize('admin'), getAllTickets)

// Employee views tickets assigned to them
router.get('/assigned', protect, authorize('employee'), getAssignedTickets)

// Admin assigns a ticket to an employee
router.patch('/:id/assign', protect, authorize('admin'), assignTicket)

// Employee or admin updates ticket status
router.patch('/:id/status', protect, authorize('employee', 'admin'), updateTicketStatus)

// Get single ticket (access checked inside controller)
router.get('/:id', protect, getTicketById)

export default router
