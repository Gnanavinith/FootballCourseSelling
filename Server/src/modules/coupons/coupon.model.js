import mongoose from 'mongoose'

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required.'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage',
    },
    discountValue: {
      type: Number,
      required: [true, 'Discount value is required.'],
      min: [0, 'Discount value must be at least 0.'],
    },
    minOrderAmount: {
      type: Number,
      default: 0,
      min: [0, 'Minimum order amount must be 0 or more.'],
    },
    maxDiscount: {
      type: Number,
      default: null,
      min: [0, 'Maximum discount must be 0 or more.'],
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      default: null,
    },
    usageLimit: {
      type: Number,
      default: null,
      min: [1, 'Usage limit must be at least 1.'],
    },
    perUserLimit: {
      type: Number,
      default: 1,
      min: [1, 'Per-user limit must be at least 1.'],
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    usedBy: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
        usedAt: { type: Date, default: Date.now },
      },
    ],
    startsAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
)

export const Coupon = mongoose.model('Coupon', couponSchema)
export default Coupon

