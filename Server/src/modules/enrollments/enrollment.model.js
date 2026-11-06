import mongoose from 'mongoose'

const enrollmentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
    source: { type: String, enum: ['Paid', 'Manual'], default: 'Paid' },
    startsAt: { type: Date, required: true },
    extraMs: { type: Number, default: 0 },
    pausedAt: { type: Date },
    unlockedAll: { type: Boolean, default: false },
    status: { type: String, enum: ['Active', 'Disabled', 'Refunded'], default: 'Active' },
    notifiedWeek: { type: Number, default: 0 },
  },
  { timestamps: true }
)

enrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true })

export const Enrollment = mongoose.model('Enrollment', enrollmentSchema)
export default Enrollment
