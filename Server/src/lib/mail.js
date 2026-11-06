import nodemailer from 'nodemailer'
import { env } from '../config/env.js'

const transporter = nodemailer.createTransport({
  host: env.smtpHost,
  port: env.smtpPort,
  secure: env.smtpSecure,
  auth: env.smtpUser ? { user: env.smtpUser, pass: env.smtpPass } : undefined,
})

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

function resetPasswordHtml(otp, name) {
  return `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Vanakkam Soccer</h1>
      </div>
      <div style="background: #f7f7f5; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #deded8;">
        <h2 style="color: #0a0a09; margin-top: 0;">Reset Your Password</h2>
        <p>Hello ${name || 'there'},</p>
        <p>We received a request to reset your password. Use the One-Time Password (OTP) below to set a new password:</p>
        <div style="background: #ffffff; border: 2px solid #f59e0b; border-radius: 8px; padding: 15px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #d97706; margin: 20px 0;">
          ${otp}
        </div>
        <p style="color: #52524d; font-size: 14px;">This OTP will expire in 15 minutes. If you didn't request this reset, please ignore this email.</p>
        <p style="color: #52524d; font-size: 14px; margin-top: 24px;">— The Vanakkam Soccer Team</p>
      </div>
    </body>
    </html>
  `
}

export const mailService = {
  async sendResetOtp({ to, name, otp }) {
    const html = resetPasswordHtml(otp, name)

    // If SMTP is not configured, log the OTP to console for development
    if (!env.smtpHost) {
      console.log(`[DEV MODE] Password reset OTP for ${to}: ${otp}`)
      return { messageId: 'dev-mode', accepted: [to] }
    }

    return await transporter.sendMail({
      from: `"Vanakkam Soccer" <${env.smtpUser || 'noreply@vanakkamsoccer.com'}>`,
      to,
      subject: 'Your password reset OTP — Vanakkam Soccer',
      html,
    })
  },
}

export { generateOtp }
