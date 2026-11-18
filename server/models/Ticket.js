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
  },
  { timestamps: true }
)

// Search text index for full-text search across subject and description
ticketSchema.index({ subject: 'text', description: 'text' })

// Query optimization compound indexes
ticketSchema.index({ status: 1, createdAt: -1 })
ticketSchema.index({ customer: 1, createdAt: -1 })
ticketSchema.index({ assignedTo: 1, status: 1 })
ticketSchema.index({ category: 1, priority: 1 })

const Ticket = mongoose.model('Ticket', ticketSchema)

export default Ticket
