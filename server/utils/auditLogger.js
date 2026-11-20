import AuditLog from '../models/AuditLog.js'

/**
 * Persists an audit log entry for a ticket event.
 * Non-blocking: will catch and log errors to avoid halting ticket operations.
 *
 * @param {Object} params
 * @param {string|mongoose.Types.ObjectId} params.ticketId
 * @param {string} params.action - CREATED | STATUS_UPDATED | ASSIGNED | PRIORITY_UPDATED | ESCALATED | UPDATED
 * @param {string|mongoose.Types.ObjectId|null} [params.performedBy]
 * @param {string} [params.performedByName]
 * @param {string} [params.performedByRole]
 * @param {Array<{field: string, oldValue: any, newValue: any}>} [params.changes]
 * @param {string} [params.note]
 */
export const recordAuditLog = async ({
  ticketId,
  action,
  performedBy = null,
  performedByName = 'System',
  performedByRole = 'system',
  changes = [],
  note = '',
}) => {
  try {
    const entry = await AuditLog.create({
      ticket: ticketId,
      action,
      performedBy,
      performedByName,
      performedByRole,
      changes,
      note,
    })
    return entry
  } catch (error) {
    console.error('[AuditLog Helper Error]: Failed to persist audit entry:', error.message)
    return null
  }
}

export default recordAuditLog
