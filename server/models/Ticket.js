import mongoose from 'mongoose'

const ticketSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: [true, 'Ticket subject is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Ticket description is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['Support', 'Bug', 'Feature Request', 'Billing', 'Other'],
      default: 'Support',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Low',
    },
    status: {
      type: String,
      enum: ['Open', 'Running', 'On Hold', 'Completed'],
      default: 'Open',
    },
    imageUrl: {
      type: String,
      default: null,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // SLA tracking and auto-escalation fields
    slaDeadline: {
      type: Date,
      default: null,
    },
    slaBreached: {
      type: Boolean,
      default: false,
      index: true,
    },
    escalated: {
      type: Boolean,
      default: false,
    },
    // AI Triage predictions and sentiment insights
    aiTriage: {
      category: { type: String, default: null },
      priority: { type: String, default: null },
      confidence: { type: Number, default: 0 },
      sentiment: {
        type: String,
        enum: ['Positive', 'Neutral', 'Frustrated'],
        default: 'Neutral',
      },
      keySignals: [{ type: String }],
      summary: { type: String, default: '' },
    },
  },
  { timestamps: true }
)

// Calculate SLA deadline based on priority if not already set
ticketSchema.pre('save', function () {
  if (this.isNew && !this.slaDeadline) {
    const slaHoursMap = {
      High: 4,
      Medium: 24,
      Low: 48,
    }
    const hours = slaHoursMap[this.priority] || 48
    this.slaDeadline = new Date(Date.now() + hours * 60 * 60 * 1000)
  }
})

// Search text index for full-text search across subject and description
ticketSchema.index({ subject: 'text', description: 'text' })

// Query optimization compound indexes
ticketSchema.index({ status: 1, createdAt: -1 })
ticketSchema.index({ customer: 1, createdAt: -1 })
ticketSchema.index({ assignedTo: 1, status: 1 })
ticketSchema.index({ category: 1, priority: 1 })
ticketSchema.index({ slaDeadline: 1, slaBreached: 1, status: 1 })

const Ticket = mongoose.model('Ticket', ticketSchema)

export default Ticket
