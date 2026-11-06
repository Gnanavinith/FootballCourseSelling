import mongoose from 'mongoose'

const emailLogSchema = new mongoose.Schema(
  {
    dedupeKey: { type: String, unique: true, sparse: true, index: true },
    templateKey: { type: String, required: true, index: true },
    to: { type: String, required: true, index: true },
    toName: { type: String, default: '' },
    replyTo: { type: String },
    subject: { type: String, required: true },
    html: { type: String, required: true },
    text: { type: String, required: true },
    status: {
      type: String,
      enum: ['queued', 'sending', 'sent', 'failed', 'bounced', 'Queued', 'Sent', 'Failed'],
      default: 'queued',
      index: true,
    },
    attempts: { type: Number, default: 0 },
    nextAttemptAt: { type: Date, default: Date.now, index: true },
    providerMessageId: { type: String },
    error: { type: String, default: '' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    entityType: { type: String }, // 'Order', 'Enrollment', 'Enquiry', 'User', 'Booking'
    entityId: { type: String },
    sentAt: { type: Date },
    // Backwards compatibility fields
    template: { type: String },
    relatedUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    relatedOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  },
  { timestamps: true }
)

export const EmailLog = mongoose.model('EmailLog', emailLogSchema)
export default EmailLog
