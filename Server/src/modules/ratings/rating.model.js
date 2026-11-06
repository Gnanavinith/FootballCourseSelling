import mongoose from 'mongoose'

const ratingSchema = new mongoose.Schema(
  {
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String, default: '', trim: true },
  },
  { timestamps: true }
)

ratingSchema.index({ courseId: 1, userId: 1 }, { unique: true })

export const Rating = mongoose.model('Rating', ratingSchema)
export default Rating
