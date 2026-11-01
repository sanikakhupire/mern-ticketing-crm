import Ticket from '../models/Ticket.js'

// @desc   Customer creates a new ticket
// @route  POST /api/tickets
// @access Private (customer)
export const createTicket = async (req, res) => {
  try {
    const { subject, description, category, priority } = req.body

    if (!subject || !description) {
      return res.status(400).json({ message: 'Subject and description are required' })
    }

    const ticket = await Ticket.create({
      subject,
      description,
      category,
      priority,
      customer: req.user._id,
    })

    res.status(201).json(ticket)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// @desc   Customer views their own tickets
// @route  GET /api/tickets/my
// @access Private (customer)
export const getMyTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ customer: req.user._id }).sort({ createdAt: -1 })
    res.status(200).json(tickets)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// @desc   Admin views all tickets
// @route  GET /api/tickets
// @access Private (admin)
export const getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .populate('customer', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })

    res.status(200).json(tickets)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// @desc   Employee views tickets assigned to them
// @route  GET /api/tickets/assigned
// @access Private (employee)
export const getAssignedTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ assignedTo: req.user._id })
      .populate('customer', 'name email')
      .sort({ createdAt: -1 })

    res.status(200).json(tickets)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// @desc   Admin assigns a ticket to an employee
// @route  PATCH /api/tickets/:id/assign
// @access Private (admin)
export const assignTicket = async (req, res) => {
  try {
    const { employeeId } = req.body

    if (!employeeId) {
      return res.status(400).json({ message: 'employeeId is required' })
    }

    const ticket = await Ticket.findById(req.params.id)
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' })
    }

    ticket.assignedTo = employeeId
    ticket.status = 'Running'
    await ticket.save()

    res.status(200).json(ticket)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// @desc   Employee (or admin) updates ticket status
// @route  PATCH /api/tickets/:id/status
// @access Private (employee, admin)
export const updateTicketStatus = async (req, res) => {
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

    res.status(200).json(ticket)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// @desc   Get a single ticket by ID (used by customer/employee/admin, with access check)
// @route  GET /api/tickets/:id
// @access Private
export const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('customer', 'name email')
      .populate('assignedTo', 'name email')

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' })
    }

    const isOwner = String(ticket.customer._id) === String(req.user._id)
    const isAssignedEmployee = ticket.assignedTo && String(ticket.assignedTo._id) === String(req.user._id)
    const isAdmin = req.user.role === 'admin'

    if (!isOwner && !isAssignedEmployee && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to view this ticket' })
    }

    res.status(200).json(ticket)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}