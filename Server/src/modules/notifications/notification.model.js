import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema(
  {
    audience: { type: String, enum: ['admin', 'student'], required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    body: { type: String, default: '' },
    link: { type: String, default: '' },
    readAt: { type: Date },
  },
  { timestamps: true }
)

export const Notification = mongoose.model('Notification', notificationSchema)
export default Notification
