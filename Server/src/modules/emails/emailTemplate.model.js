import mongoose from 'mongoose'

const blockSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['heading', 'paragraph', 'button', 'details', 'note', 'divider'],
      required: true,
    },
    text: { type: String, default: '' },
    level: { type: String, enum: ['h1', 'h2'], default: 'h1' },
    label: { type: String, default: '' },
    url: { type: String, default: '' },
    items: [
      {
        label: { type: String, default: '' },
        value: { type: String, default: '' },
      },
    ],
  },
  { _id: false }
)

const emailTemplateSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    category: {
      type: String,
      enum: [
        'AUTH',
        'PAYMENTS',
        'COURSE ACCESS',
        'ENQUIRIES AND BOOKINGS',
        'ADMIN AND SYSTEM',
        'ANNOUNCEMENTS',
      ],
      required: true,
      index: true,
    },
    subject: { type: String, required: true },
    preheader: { type: String, default: '' },
    blocks: { type: [blockSchema], default: [] },
    enabled: { type: Boolean, default: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
)

export const EmailTemplate = mongoose.model('EmailTemplate', emailTemplateSchema)
export default EmailTemplate

