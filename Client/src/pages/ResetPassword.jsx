import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/auth.service.js'
import Field from '../components/forms/Field.jsx'
import AuthLayout from '../components/auth/AuthLayout.jsx'
import { usePageMeta } from '../hooks/usePageMeta.js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function ResetPassword() {
  usePageMeta({ title: 'Reset Password | Vanakkam Soccer', noindex: true })

  const navigate = useNavigate()

  const [step, setStep] = useState('email') // 'email' | 'otp' | 'success'
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [touched, setTouched] = useState({})
  const [error, setError] = useState('')
  const [errorKey, setErrorKey] = useState(0)
  const [loading, setLoading] = useState(false)

  const blur = (name) => () => setTouched((t) => ({ ...t, [name]: true }))

  async function handleSendOtp(e) {
    e.preventDefault()
    setError('')
    if (!email.trim()) {
      setError('Enter your email')
      setTouched({ email: true })
      return
    }
    if (!EMAIL_RE.test(email.trim())) {
      setError('Enter a valid email address')
      setTouched({ email: true })
      return
    }

    setLoading(true)
    try {
      await authService.sendResetOtp(email.trim())
      setStep('otp')
    } catch (err) {
      setError(err.message || 'Could not send OTP. Please try again.')
      setErrorKey((k) => k + 1)
    } finally {
      setLoading(false)
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault()
    setError('')

    if (!otp.trim()) {
      setError('Enter the OTP')
      setTouched({ otp: true })
      return
    }
    if (!newPassword) {
      setError('Enter a new password')
      setTouched({ newPassword: true })
      return
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters')
      setTouched({ newPassword: true })
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      setTouched({ confirmPassword: true })
      return
    }

    setLoading(true)
    try {
      await authService.resetPassword(email.trim(), otp.trim(), newPassword)
      setStep('success')
    } catch (err) {
      setError(err.message || 'Reset failed. Please try again.')
      setErrorKey((k) => k + 1)
    } finally {
      setLoading(false)
    }
  }

  if (step === 'success') {
    return (
      <AuthLayout
        title="Password Reset"
        subtitle="Your password has been reset successfully."
        footer={
          <Link to="/login" className="btn btn-lg btn-primary btn-block">
            Sign in
          </Link>
        }
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-tint-green text-on-tint-green mx-auto mb-6">
          <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title={step === 'email' ? 'Reset your password' : 'Enter the OTP'}
      subtitle={
        step === 'email'
          ? 'Enter your email and we will send a one-time password (OTP) to reset your password.'
          : `We sent a 6-digit OTP to <strong>${email}</strong>. Enter it below along with your new password.`
      }
    >
      <form onSubmit={step === 'email' ? handleSendOtp : handleResetPassword} noValidate className="mt-8 space-y-5">
        {step === 'email' ? (
          <Field
            id="email"
            label="Email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={blur('email')}
            error={touched.email ? error || undefined : undefined}
            required
          />
        ) : (
          <>
            <Field
              id="otp"
              label="OTP (6 digits)"
              type="text"
              inputMode="numeric"
              maxLength="6"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              onBlur={blur('otp')}
              error={touched.otp ? error || undefined : undefined}
              required
            />
            <Field
              id="newPassword"
              label="New password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              onBlur={blur('newPassword')}
              error={touched.newPassword ? error || undefined : undefined}
              required
            />
            <Field
              id="confirmPassword"
              label="Confirm new password"
              type="password"
              autoComplete="new-password"
              placeholder="Repeat your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={blur('confirmPassword')}
              error={touched.confirmPassword ? error || undefined : undefined}
              required
            />
          </>
        )}

        {error && (
          <div
            key={errorKey}
            role="alert"
            className="animate-shake flex items-start gap-2.5 rounded-xl border border-danger-500/40 bg-danger-500/10 px-4 py-3 text-xs font-semibold text-danger-700 dark:text-danger-300 sm:text-sm"
          >
            <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          className="btn btn-lg sm:btn-xl btn-primary w-full justify-center font-extrabold shadow-glow active:scale-[0.98] transition-all cursor-pointer mt-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner" aria-hidden="true" />
              {step === 'email' ? 'Sending OTP...' : 'Resetting password...'}
            </>
          ) : (
            step === 'email' ? 'Send OTP' : 'Reset Password'
          )}
        </button>

        {step === 'otp' && (
          <p className="mt-4 text-center text-xs sm:text-sm text-fg-3">
            Didn't receive the OTP?{' '}
            <button
              type="button"
              onClick={handleSendOtp}
              className="font-bold text-gold-600 dark:text-gold-400 underline hover:underline cursor-pointer"
            >
              Resend OTP
            </button>
          </p>
        )}

        <p className="mt-6 text-center text-xs sm:text-sm text-fg-3">
          Remember your password?{' '}
          <Link to="/login" className="font-extrabold text-gold-600 dark:text-gold-400 underline hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
