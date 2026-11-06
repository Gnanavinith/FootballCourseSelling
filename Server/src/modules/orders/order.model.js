import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false, index: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: false, index: true },
    itemType: { type: String, enum: ['course', 'booking'], default: 'course' },
    serviceId: { type: String },
    bookingDetails: {
      name: { type: String },
      email: { type: String },
      phone: { type: String },
      date: { type: String },
      time: { type: String },
      serviceName: { type: String },
      message: { type: String },
    },
    amount: { type: Number, required: true },
    originalAmount: { type: Number },
    discountAmount: { type: Number, default: 0 },
    couponCode: { type: String, uppercase: true, trim: true },
    currency: { type: String, default: 'INR' },
    razorpayOrderId: { type: String, required: true, unique: true },
    razorpayPaymentId: { type: String, unique: true, sparse: true },
    status: { type: String, enum: ['Created', 'Paid', 'Failed', 'Refunded'], default: 'Created' },
    paidAt: { type: Date },
    refundedAt: { type: Date },
    refundedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
)

export const Order = mongoose.model('Order', orderSchema)
export default Order
