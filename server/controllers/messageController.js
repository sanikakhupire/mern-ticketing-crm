import Message from '../models/Message.js'
import Ticket from '../models/Ticket.js'
import Notification from '../models/Notification.js'
import { emitTicketMessage, emitNotification } from '../config/socket.js'
import { recordAuditLog } from '../utils/auditLogger.js'

/**
 * Helper to verify user has authorization to access the ticket's discussion
 */
const verifyTicketAccess = (ticket, user) => {
  const isOwner = String(ticket.customer?._id || ticket.customer) === String(user._id)
  const isAssigned =
    ticket.assignedTo &&
    String(ticket.assignedTo?._id || ticket.assignedTo) === String(user._id)
  const isAdmin = user.role === 'admin'
  return isOwner || isAssigned || isAdmin
}

// @desc   Get all messages for a specific ticket
// @route  GET /api/tickets/:id/messages
// @access Private (ticket owner, assigned agent, admin)
export const getTicketMessages = async (req, res, next) => {
  try {
    const { id: ticketId } = req.params
    const ticket = await Ticket.findById(ticketId)

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' })
    }

    if (!verifyTicketAccess(ticket, req.user)) {
      return res.status(403).json({ message: 'Not authorized to view messages for this ticket' })
    }

    const messages = await Message.find({ ticket: ticketId })
      .populate('sender', 'name email role')
      .sort({ createdAt: 1 })

    res.status(200).json(messages)
  } catch (error) {
    next(error)
  }
}

// @desc   Send a message in the ticket discussion thread
// @route  POST /api/tickets/:id/messages
// @access Private (ticket owner, assigned agent, admin)
export const sendTicketMessage = async (req, res, next) => {
  try {
    const { id: ticketId } = req.params
    const { message: messageText } = req.body

    if (!messageText || !messageText.trim()) {
      return res.status(400).json({ message: 'Message text is required' })
    }

    const ticket = await Ticket.findById(ticketId)
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' })
    }

    if (!verifyTicketAccess(ticket, req.user)) {
      return res.status(403).json({ message: 'Not authorized to send messages on this ticket' })
    }

    // Create and populate message
    const message = await Message.create({
      ticket: ticket._id,
      sender: req.user._id,
      senderRole: req.user.role || 'customer',
      message: messageText.trim(),
    })

    const populatedMessage = await message.populate('sender', 'name email role')

    // Broadcast in real-time to ticket chat room
    emitTicketMessage(ticket._id, populatedMessage)

    // Notify other participant(s)
    const isCustomerSender = req.user.role === 'customer'
    const previewText =
      messageText.length > 60 ? `${messageText.slice(0, 60)}...` : messageText

    if (isCustomerSender) {
      // If customer sent message, notify assigned agent if any
      if (ticket.assignedTo) {
        const notif = await Notification.create({
          recipient: ticket.assignedTo,
          ticket: ticket._id,
          type: 'TICKET_UPDATED',
          title: `New message on ticket: ${ticket.subject}`,
          message: `${req.user.name}: "${previewText}"`,
        })
        emitNotification(ticket.assignedTo, notif)
      }
    } else {
      // If agent or admin replied, notify the customer
      const notif = await Notification.create({
        recipient: ticket.customer,
        ticket: ticket._id,
        type: 'TICKET_UPDATED',
        title: `Support reply on ticket: ${ticket.subject}`,
        message: `${req.user.name}: "${previewText}"`,
      })
      emitNotification(ticket.customer, notif)
    }

    // Record audit event
    await recordAuditLog({
      ticketId: ticket._id,
      action: 'COMMENT_ADDED',
      performedBy: req.user._id,
      performedByName: req.user.name,
      performedByRole: req.user.role || 'customer',
      note: 'Message posted in ticket discussion thread',
    })

    res.status(201).json(populatedMessage)
  } catch (error) {
    next(error)
  }
}
