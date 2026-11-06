import mongoose from 'mongoose'

const paymentRequestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    amount: { type: Number, required: true, min: [0, 'Amount must be 0 or more.'] },
    method: { type: String, enum: ['UPI', 'Bank transfer', 'Cash'], required: true },
    reference: { type: String, trim: true, default: '' },
    paidOn: { type: Date, required: true },
    payerName: { type: String, trim: true, default: '' },
    mobile: { type: String, trim: true, default: '' },
    note: { type: String, trim: true, default: '' },
    screenshotUrl: { type: String, default: '' },
    screenshotPublicId: { type: String, default: '' },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending', index: true },
    reviewNote: { type: String, default: '' },
    approvedAt: { type: Date },
    rejectedAt: { type: Date },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    enrollmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Enrollment', default: null },
  },
  { timestamps: true }
)

export const PaymentRequest = mongoose.model('PaymentRequest', paymentRequestSchema)
export default PaymentRequest
