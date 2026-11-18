import Ticket from '../models/Ticket.js'
import User from '../models/User.js'
import Notification from '../models/Notification.js'
import { uploadToCloudinary } from '../config/cloudinary.js'
import { emitNotification } from '../config/socket.js'

/**
 * Helper to construct MongoDB filter based on query parameters
 */
const buildTicketFilter = (query, baseFilter = {}) => {
  const filter = { ...baseFilter }

  // 1. Full-text / substring search across subject and description
  if (query.search && query.search.trim()) {
    const term = query.search.trim()
    const regex = new RegExp(term, 'i')
    filter.$or = [{ subject: regex }, { description: regex }]
  }

  // 2. Status filter
  if (query.status && query.status !== 'All') {
    filter.status = query.status
  }

  // 3. Category filter
  if (query.category && query.category !== 'All') {
    filter.category = query.category
  }

  // 4. Priority filter
  if (query.priority && query.priority !== 'All') {
    filter.priority = query.priority
  }

  // 5. Customer filter
  if (query.customer) {
    filter.customer = query.customer
  }

  // 6. Assigned employee filter
  if (query.assignedTo) {
    filter.assignedTo = query.assignedTo === 'unassigned' ? null : query.assignedTo
  }

  // 7. Date range filter
  if (query.dateFrom || query.dateTo) {
    filter.createdAt = {}
    if (query.dateFrom) {
      filter.createdAt.$gte = new Date(query.dateFrom)
    }
    if (query.dateTo) {
      const end = new Date(query.dateTo)
      end.setHours(23, 59, 59, 999)
      filter.createdAt.$lte = end
    }
  }

  return filter
}

// @desc   Customer creates a new ticket
// @route  POST /api/tickets
// @access Private (customer)
export const createTicket = async (req, res, next) => {
  try {
    const { subject, description, category, priority } = req.body

    if (!subject || !description) {
      return res.status(400).json({ message: 'Subject and description are required' })
    }

    let imageUrl = req.body.imageUrl || null

    // If an image was uploaded via multipart/form-data
    if (req.file) {
      try {
        const uploadResult = await uploadToCloudinary(req.file.buffer, 'mern-ticketing-crm/tickets')
        imageUrl = uploadResult.secure_url
      } catch (uploadError) {
        return res.status(500).json({ message: 'Image upload failed', error: uploadError.message })
      }
    }

    const ticket = await Ticket.create({
      subject,
      description,
      category,
      priority,
      imageUrl,
      customer: req.user._id,
    })

    const populatedTicket = await ticket.populate('customer', 'name email')

    res.status(201).json(populatedTicket)
  } catch (error) {
    next(error)
  }
}

// @desc   Customer views their own tickets (with search, filters & pagination)
// @route  GET /api/tickets/my
// @access Private (customer)
export const getMyTickets = async (req, res, next) => {
  try {
    const filter = buildTicketFilter(req.query, { customer: req.user._id })
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 10))
    const skip = (page - 1) * limit

    const total = await Ticket.countDocuments(filter)
    const tickets = await Ticket.find(filter)
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    res.status(200).json({
      tickets,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit) || 1,
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc   Admin views all tickets (with search, filters & pagination)
// @route  GET /api/tickets
// @access Private (admin)
export const getAllTickets = async (req, res, next) => {
  try {
    const filter = buildTicketFilter(req.query)
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 10))
    const skip = (page - 1) * limit

    const total = await Ticket.countDocuments(filter)
    const tickets = await Ticket.find(filter)
      .populate('customer', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    res.status(200).json({
      tickets,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit) || 1,
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc   Employee views tickets assigned to them (with search, filters & pagination)
// @route  GET /api/tickets/assigned
// @access Private (employee)
export const getAssignedTickets = async (req, res, next) => {
  try {
    const filter = buildTicketFilter(req.query, { assignedTo: req.user._id })
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 10))
    const skip = (page - 1) * limit

    const total = await Ticket.countDocuments(filter)
    const tickets = await Ticket.find(filter)
      .populate('customer', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    res.status(200).json({
      tickets,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit) || 1,
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc   Admin assigns a ticket to an employee
// @route  PATCH /api/tickets/:id/assign
// @access Private (admin)
export const assignTicket = async (req, res, next) => {
  try {
    const { employeeId } = req.body

    if (!employeeId) {
      return res.status(400).json({ message: 'employeeId is required' })
    }

    const employee = await User.findById(employeeId)
    if (!employee || (employee.role !== 'employee' && employee.role !== 'admin')) {
      return res.status(400).json({ message: 'Assigned user must be an employee or admin' })
    }

    const ticket = await Ticket.findById(req.params.id)
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' })
    }

    ticket.assignedTo = employeeId
    ticket.status = 'Running'
    await ticket.save()

    // Persist and emit real-time notification to assigned employee
    try {
      const notification = await Notification.create({
        recipient: employeeId,
        sender: req.user._id,
        ticket: ticket._id,
        type: 'TICKET_ASSIGNED',
        title: 'New Ticket Assigned',
        message: `You were assigned ticket: "${ticket.subject}"`,
      })
      emitNotification(employeeId, notification)
    } catch (notifError) {
      console.error('Failed to dispatch notification:', notifError.message)
    }

    const updatedTicket = await Ticket.findById(ticket._id)
      .populate('customer', 'name email')
      .populate('assignedTo', 'name email')

    res.status(200).json(updatedTicket)
  } catch (error) {
    next(error)
  }
}

// @desc   Employee (or admin) updates ticket status
// @route  PATCH /api/tickets/:id/status
// @access Private (employee, admin)
export const updateTicketStatus = async (req, res, next) => {
  try {
    const { status } = req.body
    const allowedStatuses = ['Open', 'Running', 'On Hold', 'Completed']

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' })
    }

    const ticket = await Ticket.findById(req.params.id)
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' })
    }

    // Employees can only update tickets assigned to them
    if (req.user.role === 'employee' && String(ticket.assignedTo) !== String(req.user._id)) {
      return res.status(403).json({ message: 'You are not assigned to this ticket' })
    }

    ticket.status = status
    await ticket.save()

    // Persist and emit real-time notification to ticket customer
    try {
      const notification = await Notification.create({
        recipient: ticket.customer,
        sender: req.user._id,
        ticket: ticket._id,
        type: 'STATUS_CHANGED',
        title: 'Ticket Status Updated',
        message: `Your ticket "${ticket.subject}" is now ${status}`,
      })
      emitNotification(ticket.customer, notification)
    } catch (notifError) {
      console.error('Failed to dispatch status notification:', notifError.message)
    }

    const updatedTicket = await Ticket.findById(ticket._id)
      .populate('customer', 'name email')
      .populate('assignedTo', 'name email')

    res.status(200).json(updatedTicket)
  } catch (error) {
    next(error)
  }
}

// @desc   Get a single ticket by ID (used by customer/employee/admin, with access check)
// @route  GET /api/tickets/:id
// @access Private
export const getTicketById = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('customer', 'name email')
      .populate('assignedTo', 'name email')

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' })
    }

    const isOwner = String(ticket.customer?._id || ticket.customer) === String(req.user._id)
    const isAssignedEmployee = ticket.assignedTo && String(ticket.assignedTo?._id || ticket.assignedTo) === String(req.user._id)
    const isAdmin = req.user.role === 'admin'

    if (!isOwner && !isAssignedEmployee && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to view this ticket' })
    }

    res.status(200).json(ticket)
  } catch (error) {
    next(error)
  }
}
