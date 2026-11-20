import mongoose from 'mongoose'

const auditChangeSchema = new mongoose.Schema(
  {
    field: {
      type: String,
      required: true,
    },
    oldValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    newValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { _id: false }
)

const auditLogSchema = new mongoose.Schema(
  {
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      required: true,
      index: true,
    },
    action: {
      type: String,
      enum: ['CREATED', 'STATUS_UPDATED', 'ASSIGNED', 'PRIORITY_UPDATED', 'ESCALATED', 'UPDATED'],
      required: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    performedByName: {
      type: String,
      default: 'System',
      trim: true,
    },
    performedByRole: {
      type: String,
      enum: ['customer', 'employee', 'admin', 'system'],
      default: 'system',
    },
    changes: [auditChangeSchema],
    note: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { timestamps: true }
)

// Index for efficient chronological retrieval per ticket
auditLogSchema.index({ ticket: 1, createdAt: -1 })

const AuditLog = mongoose.model('AuditLog', auditLogSchema)

export default AuditLog
