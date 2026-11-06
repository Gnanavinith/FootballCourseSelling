import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { User } from '../users/user.model.js'
import { env } from '../../config/env.js'
import { mailService, generateOtp } from '../../lib/mail.js'
import { emailService } from '../emails/email.service.js'

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, env.jwtSecret, { expiresIn: '7d' })
}

export const authService = {
  async register({ name, email, password }) {
    const existing = await User.findOne({ email })
    if (existing) throw new Error('Email already registered')
    const passwordHash = await User.hashPassword(password)
    const user = await User.create({ name, email, password: undefined, passwordHash, role: 'student' })

    // Send welcome email (non-blocking)
    emailService
      .sendTemplate('welcome', {
        to: user.email,
        toName: user.name,
        data: {
          name: user.name,
          loginUrl: `${env.clientOrigin}/login`,
        },
        dedupeKey: `welcome:${user._id}`,
        userId: user._id,
        entityType: 'User',
        entityId: user._id.toString(),
      })
      .catch((err) => console.error('[AuthService] Welcome email error:', err))

    return { user: sanitize(user), token: signToken(user) }
  },

  async login({ email, password }) {
    const user = await User.findOne({ email })
    if (!user) throw new Error('Invalid credentials')
    const ok = await user.comparePassword(password)
    if (!ok) throw new Error('Invalid credentials')
    user.lastLoginAt = new Date()
    await user.save()
    return { user: sanitize(user), token: signToken(user) }
  },

  async me(id) {
    const user = await User.findById(id).select('-passwordHash')
    if (!user) throw new Error('Not found')
    return sanitize(user)
  },

  async sendResetOtp({ email }) {
    const user = await User.findOne({ email })
    if (!user) throw new Error('No account found with this email')

    const otp = generateOtp()
    const rawToken = crypto.randomBytes(24).toString('hex')
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')
    const expires = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes

    user.passwordResetOtp = otp
    user.passwordResetOtpExpires = expires
    user.passwordResetTokenHash = tokenHash
    user.passwordResetExpires = expires
    await user.save()

    const resetUrl = `${env.clientOrigin}/reset-password?token=${rawToken}&email=${encodeURIComponent(email)}`

    // Send professional password reset email template
    await emailService.sendTemplate('password_reset', {
      to: email,
      toName: user.name,
      data: {
        name: user.name,
        resetUrl,
        expiresIn: '30 minutes',
      },
      userId: user._id,
      entityType: 'User',
      entityId: user._id.toString(),
    })

    // Also send legacy mailService if dev mode OTP is needed
    if (!env.smtpHost) {
      await mailService.sendResetOtp({ to: email, name: user.name, otp })
    }

    return { message: 'Password reset link sent to your email' }
  },

  async resetPassword({ email, otp, token, newPassword }) {
    const user = await User.findOne({ email })
    if (!user) throw new Error('No account found with this email')

    let isValid = false
    const now = new Date()

    if (token) {
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
      if (
        user.passwordResetTokenHash === tokenHash &&
        user.passwordResetExpires &&
        now <= user.passwordResetExpires
      ) {
        isValid = true
      }
    }

    if (!isValid && otp) {
      if (
        user.passwordResetOtp === otp &&
        user.passwordResetOtpExpires &&
        now <= user.passwordResetOtpExpires
      ) {
        isValid = true
      }
    }

    if (!isValid) {
      throw new Error('Invalid or expired password reset link/OTP. Please request a new one.')
    }

    const passwordHash = await User.hashPassword(newPassword)
    user.passwordHash = passwordHash
    user.passwordResetOtp = undefined
    user.passwordResetOtpExpires = undefined
    user.passwordResetTokenHash = undefined
    user.passwordResetExpires = undefined
    user.lastLoginAt = new Date()
    await user.save()

    // Send security notification: password_changed
    emailService
      .sendTemplate('password_changed', {
        to: user.email,
        toName: user.name,
        data: {
          name: user.name,
          supportEmail: 'support@vanakkamsoccer.com',
        },
        userId: user._id,
        entityType: 'User',
        entityId: user._id.toString(),
      })
      .catch((err) => console.error('[AuthService] Password changed notice error:', err))

    return { user: sanitize(user), token: signToken(user) }
  },
}

function sanitize(user) {
  const { _id, name, email, role, createdAt } = user
  return { id: _id, name, email, role, createdAt }
}
