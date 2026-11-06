import mongoose from 'mongoose'

const enquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: '' },
    subject: { type: String, default: '' },
    message: { type: String, default: '' },
    source: { type: String, default: 'contact' },
    status: { type: String, enum: ['New', 'In progress', 'Done', 'Replied'], default: 'New' },
    note: { type: String, default: '' },
    replies: [
      {
        replyMessage: { type: String, required: true },
        repliedBy: { type: String },
        repliedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
)

export const Enquiry = mongoose.model('Enquiry', enquirySchema)
export default Enquiry
