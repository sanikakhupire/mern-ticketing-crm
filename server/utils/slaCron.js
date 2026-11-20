import cron from 'node-cron'
import Ticket from '../models/Ticket.js'
import User from '../models/User.js'
import Notification from '../models/Notification.js'
import { emitNotification } from '../config/socket.js'
import { recordAuditLog } from './auditLogger.js'

/**
 * Check for overdue tickets past their SLA resolution deadline and auto-escalate
 */
export const checkSlaAndEscalate = async () => {
  try {
    const now = new Date()

    // Find unresolved tickets past their SLA target that haven't been marked as breached
    const breachedTickets = await Ticket.find({
      status: { $in: ['Open', 'Running'] },
      slaDeadline: { $lte: now },
      slaBreached: false,
    }).populate('assignedTo', 'name email')

    if (breachedTickets.length === 0) return

    console.log(`[SLA Worker] Found ${breachedTickets.length} breached ticket(s) to escalate.`)

    // Fetch all admins to notify them of SLA violations
    const admins = await User.find({ role: 'admin' }).select('_id')

    for (const ticket of breachedTickets) {
      ticket.slaBreached = true

      // Auto-escalate priority
      const oldPriority = ticket.priority
      if (ticket.priority === 'Low') {
        ticket.priority = 'Medium'
        ticket.escalated = true
      } else if (ticket.priority === 'Medium') {
        ticket.priority = 'High'
        ticket.escalated = true
      } else {
        ticket.escalated = true // Already high, flagged as critical breach
      }

      await ticket.save()

      // Record audit log for automated SLA escalation
      await recordAuditLog({
        ticketId: ticket._id,
        action: 'ESCALATED',
        performedBy: null,
        performedByName: 'System (SLA Monitor)',
        performedByRole: 'system',
        changes: [
          { field: 'priority', oldValue: oldPriority, newValue: ticket.priority },
          { field: 'slaBreached', oldValue: false, newValue: true },
        ],
        note: `Auto-escalated priority from ${oldPriority} to ${ticket.priority} due to SLA resolution breach`,
      })

      const escalationMessage = `Ticket "${ticket.subject}" breached its resolution deadline and was auto-escalated from ${oldPriority} to ${ticket.priority}.`

      // 1. Notify assigned employee if present
      if (ticket.assignedTo?._id) {
        try {
          const empNotif = await Notification.create({
            recipient: ticket.assignedTo._id,
            ticket: ticket._id,
            type: 'GENERAL',
            title: '🚨 SLA Target Breached',
            message: escalationMessage,
          })
          emitNotification(ticket.assignedTo._id, empNotif)
        } catch (err) {
          console.error('[SLA Worker] Failed to notify employee:', err.message)
        }
      }

      // 2. Notify all admins
      for (const admin of admins) {
        try {
          const adminNotif = await Notification.create({
            recipient: admin._id,
            ticket: ticket._id,
            type: 'GENERAL',
            title: '🚨 SLA Target Breached',
            message: escalationMessage,
          })
          emitNotification(admin._id, adminNotif)
        } catch (err) {
          console.error('[SLA Worker] Failed to notify admin:', err.message)
        }
      }
    }
  } catch (error) {
    console.error('[SLA Worker Error]:', error.message)
  }
}

/**
 * Initialize SLA monitoring cron job (runs every 15 minutes)
 */
export const startSlaCron = () => {
  // Run once immediately on start
  checkSlaAndEscalate()

  // Schedule to run every 15 minutes
  cron.schedule('*/15 * * * *', () => {
    checkSlaAndEscalate()
  })

  console.log('SLA Auto-Escalation Worker scheduled (every 15m)')
}
