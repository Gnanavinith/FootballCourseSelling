import mongoose from 'mongoose'

const videoSchema = new mongoose.Schema(
  {
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    weekNumber: { type: Number, required: true, min: 1 },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    bunnyVideoId: { type: String, default: '' },
    status: { type: String, enum: ['Uploading', 'Processing', 'Ready', 'Failed'], default: 'Uploading' },
    published: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    durationSeconds: { type: Number, default: 0 },
  },
  { timestamps: true }
)

export const Video = mongoose.model('Video', videoSchema)
export default Video
