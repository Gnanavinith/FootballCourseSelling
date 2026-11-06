import mongoose from 'mongoose'

const auditLogSchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action: { type: String, required: true },
    targetType: { type: String, required: true },
    targetId: { type: String, default: '' },
    details: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
)

export const AuditLog = mongoose.model('AuditLog', auditLogSchema)
export default AuditLog
