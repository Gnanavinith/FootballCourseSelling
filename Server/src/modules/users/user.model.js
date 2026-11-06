import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    mobile: { type: String, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['student', 'superadmin'], default: 'student' },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
    passwordResetOtp: { type: String },
    passwordResetOtpExpires: { type: Date },
    passwordResetOtpVerified: { type: Boolean, default: false },
    passwordResetTokenHash: { type: String },
    passwordResetExpires: { type: Date },
    emailOptOut: { type: Boolean, default: false },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
)

userSchema.virtual('enrollments', {
  ref: 'Enrollment',
  localField: '_id',
  foreignField: 'userId',
})

userSchema.methods.comparePassword = function comparePassword(plain) {
  return bcrypt.compare(plain, this.passwordHash)
}

userSchema.statics.hashPassword = function hashPassword(plain) {
  return bcrypt.hash(plain, 10)
}

export const User = mongoose.model('User', userSchema)
export default User
