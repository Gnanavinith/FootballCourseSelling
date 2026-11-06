import { describe, it, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert'
import mongoose from 'mongoose'
import { User } from '../src/modules/users/user.model.js'
import { authService } from '../src/modules/auth/auth.service.js'
import { mailService } from '../src/lib/mail.js'

// Capture emails sent in dev mode (no SMTP)
const sentEmails = []
const originalSend = mailService.sendResetOtp
mailService.sendResetOtp = async ({ to, name, otp }) => {
  sentEmails.push({ to, name, otp })
  return { messageId: 'test', accepted: [to] }
}

let testUserId

describe('Password Reset with OTP', () => {
  beforeEach(async () => {
    await mongoose.connect('mongodb://127.0.0.1:27017/footballcourse_test')
    sentEmails.length = 0
    await User.deleteMany({})
    testUserId = undefined
  })

  afterEach(async () => {
    await User.deleteMany({})
    await mongoose.disconnect()
  })

  it('should send OTP to a registered email', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      passwordHash: await User.hashPassword('Password123'),
      role: 'student',
    })
    testUserId = user._id

    const result = await authService.sendResetOtp({ email: 'test@example.com' })
    assert.strictEqual(result.message, 'OTP sent to your email')

    // Verify OTP was stored on the user
    const updated = await User.findById(user._id)
    assert.ok(updated.passwordResetOtp, 'OTP should be stored on user')
    assert.ok(updated.passwordResetOtpExpires, 'OTP expiry should be stored')
    assert.ok(updated.passwordResetOtpExpires > new Date(), 'OTP expiry should be in the future')

    // Verify email was "sent"
    assert.strictEqual(sentEmails.length, 1)
    assert.strictEqual(sentEmails[0].to, 'test@example.com')
    assert.strictEqual(sentEmails[0].otp, updated.passwordResetOtp)
  })

  it('should throw when email is not registered', async () => {
    await assert.rejects(
      authService.sendResetOtp({ email: 'nonexistent@example.com' }),
      (err) => err.message === 'No account found with this email'
    )
  })

  it('should reset password with valid OTP and login with new password', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'reset@example.com',
      passwordHash: await User.hashPassword('OldPassword123'),
      role: 'student',
    })

    // Send OTP
    await authService.sendResetOtp({ email: 'reset@example.com' })
    const updated = await User.findById(user._id)
    const otp = updated.passwordResetOtp

    // Reset password with valid OTP
    const result = await authService.resetPassword({
      email: 'reset@example.com',
      otp,
      newPassword: 'NewPassword456',
    })
    assert.ok(result.token, 'Should return a token on success')
    assert.strictEqual(result.user.email, 'reset@example.com')

    // Verify old password no longer works
    await assert.rejects(
      authService.login({ email: 'reset@example.com', password: 'OldPassword123' }),
      (err) => err.message === 'Invalid credentials'
    )

    // Verify new password works
    const loggedIn = await authService.login({
      email: 'reset@example.com',
      password: 'NewPassword456',
    })
    assert.ok(loggedIn.token, 'Should login with new password')
    assert.strictEqual(loggedIn.user.email, 'reset@example.com')

    // Verify OTP fields are cleared
    const afterReset = await User.findById(user._id)
    assert.ok(!afterReset.passwordResetOtp, 'OTP should be cleared after reset')
    assert.ok(!afterReset.passwordResetOtpExpires, 'OTP expiry should be cleared after reset')
  })

  it('should reject reset with invalid OTP', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'otpfail@example.com',
      passwordHash: await User.hashPassword('Password123'),
      role: 'student',
    })

    await authService.sendResetOtp({ email: 'otpfail@example.com' })

    await assert.rejects(
      authService.resetPassword({
        email: 'otpfail@example.com',
        otp: '000000',
        newPassword: 'NewPassword456',
      }),
      (err) => err.message === 'Invalid OTP'
    )
  })

  it('should reject reset for unregistered email', async () => {
    await assert.rejects(
      authService.resetPassword({
        email: 'nonexistent@example.com',
        otp: '123456',
        newPassword: 'NewPassword456',
      }),
      (err) => err.message === 'No account found with this email'
    )
  })

  it('should reject reset with no OTP request', async () => {
    await User.create({
      name: 'Test User',
      email: 'norequest@example.com',
      passwordHash: await User.hashPassword('Password123'),
      role: 'student',
    })

    await assert.rejects(
      authService.resetPassword({
        email: 'norequest@example.com',
        otp: '123456',
        newPassword: 'NewPassword456',
      }),
      (err) => err.message === 'No reset request found. Please request a new OTP.'
    )
  })
})
