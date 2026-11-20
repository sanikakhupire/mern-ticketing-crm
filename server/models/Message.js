import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema(
  {
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      required: [true, 'Ticket reference is required'],
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender reference is required'],
    },
    senderRole: {
      type: String,
      enum: ['customer', 'employee', 'admin'],
      required: true,
    },
    message: {
      type: String,
      required: [true, 'Message text cannot be empty'],
      trim: true,
      maxlength: [3000, 'Message cannot exceed 3000 characters'],
    },
  },
  { timestamps: true }
)

// Index for rapid chronologically sorted ticket message retrieval
messageSchema.index({ ticket: 1, createdAt: 1 })

const Message = mongoose.model('Message', messageSchema)

export default Message
