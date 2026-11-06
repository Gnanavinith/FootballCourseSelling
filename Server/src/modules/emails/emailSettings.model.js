import mongoose from 'mongoose'

const emailSettingsSchema = new mongoose.Schema(
  {
    fromName: { type: String, default: 'Vanakkam Soccer' },
    fromEmail: { type: String, default: '' },
    replyTo: { type: String, default: 'support@vanakkamsoccer.com' },
    adminRecipients: { type: [String], default: [] },
    logoUrl: { type: String, default: 'https://vanakkamsoccer.com/logo.png' },
    footerAddress: { type: String, default: 'Vanakkam Soccer Academy, Chennai, Tamil Nadu, India' },
    supportEmail: { type: String, default: 'support@vanakkamsoccer.com' },
    whatsappNumber: { type: String, default: '+91 98765 43210' },
    youtubeUrl: { type: String, default: 'https://youtube.com/@vanakkamsoccer' },
    digestHourIST: { type: Number, default: 8, min: 0, max: 23 },
    dailyLimit: { type: Number, default: 500 },
    perTemplateEnabled: { type: Map, of: Boolean, default: {} },
    broadcastAudit: [
      {
        adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        adminEmail: String,
        audience: String,
        subject: String,
        recipientCount: Number,
        sentAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
)

export const EmailSettings = mongoose.model('EmailSettings', emailSettingsSchema)
export default EmailSettings

