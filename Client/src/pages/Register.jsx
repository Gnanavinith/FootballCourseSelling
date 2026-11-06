import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/auth.service.js'
import AuthLayout from '../components/auth/AuthLayout.jsx'
import Field from '../components/forms/Field.jsx'
import { usePageMeta } from '../hooks/usePageMeta.js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate({ name, email, password, confirm }) {
  const errors = {}
  const n = name.trim()
  if (n.length < 2) errors.name = 'Enter your full name (at least 2 letters)'
  else if (n.length > 60) errors.name = 'Name must be 60 characters or less'

  if (!email.trim()) errors.email = 'Enter your email'
  else if (!EMAIL_RE.test(email.trim())) errors.email = 'Enter a valid email address'

  if (password.length < 8) errors.password = 'Use at least 8 characters'
  else if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) errors.password = 'Include at least one letter and one number'

  if (!confirm) errors.confirm = 'Re-enter your password'
  else if (confirm !== password) errors.confirm = 'Passwords do not match'
  return errors
}

/* 0 to 4 */
function strength(pw) {
  let s = 0
  if (pw.length >= 8) s++
  if (/[A-Za-z]/.test(pw) && /\d/.test(pw)) s++
  if (pw.length >= 12) s++
  if (/[^A-Za-z0-9]/.test(pw) || (/[a-z]/.test(pw) && /[A-Z]/.test(pw))) s++
  return s
}

const LEVELS = [
  { label: 'Too short', bar: 'bg-danger-600', text: 'text-on-tint-red' },
  { label: 'Weak', bar: 'bg-danger-600', text: 'text-on-tint-red' },
  { label: 'Okay', bar: 'bg-gold-500', text: 'text-ink-950' },
  { label: 'Good', bar: 'bg-pitch-500', text: 'text-white' },
  { label: 'Strong', bar: 'bg-pitch-600', text: 'text-white' },
]

function StrengthMeter({ password }) {
  if (!password) return null
  const s = strength(password)
  const level = LEVELS[s]
  return (
    <div className="mt-2" aria-live="polite">
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${i < s ? level.bar : 'bg-line'}`} />
        ))}
      </div>
      <p className={`mt-1 text-xs font-semibold ${level.text}`}>{level.label}</p>
    </div>
  )
}

export default function Register() {
  usePageMeta({ title: 'Create account | Vanakkam Soccer', noindex: true })

  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [touched, setTouched] = useState({})
  const [error, setError] = useState('')
  const [errorKey, setErrorKey] = useState(0)
  const [loading, setLoading] = useState(false)

  const errors = validate(form)
  const show = (name) => (touched[name] ? errors[name] : undefined)
  const set = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }))
  const blur = (name) => () => setTouched((t) => ({ ...t, [name]: true }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setTouched({ name: true, email: true, password: true, confirm: true })
    if (Object.keys(errors).length) return

    setLoading(true)
    try {
      await authService.register(form.name.trim(), form.email.trim(), form.password)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Registration failed')
      setErrorKey((k) => k + 1)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Sign up to enrol in a course and start Week 1."
      footer={
        <span className="text-xs sm:text-sm text-fg-3">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-extrabold text-gold-600 underline-offset-4 transition-colors hover:text-gold-500 hover:underline dark:text-gold-400 dark:hover:text-gold-300"
          >
            Sign in
          </Link>
        </span>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4 sm:space-y-5">
        <Field
          id="name"
          label="Full name"
          autoComplete="name"
          placeholder="Your name"
          value={form.name}
          onChange={set('name')}
          onBlur={blur('name')}
          error={show('name')}
          required
        />
        <Field
          id="email"
          label="Email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={set('email')}
          onBlur={blur('email')}
          error={show('email')}
          required
        />

        <div>
          <Field
            id="password"
            label="Password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            hint="Use a letter and a number"
            value={form.password}
            onChange={set('password')}
            onBlur={blur('password')}
            error={show('password')}
            required
          />
          <StrengthMeter password={form.password} />
        </div>

        <Field
          id="confirm"
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          placeholder="Repeat your password"
          value={form.confirm}
          onChange={set('confirm')}
          onBlur={blur('confirm')}
          error={show('confirm')}
          required
        />

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
              <span className="spinner" aria-hidden="true" /> Creating account...
            </>
          ) : (
            'Create account'
          )}
        </button>

        <div className="flex items-center justify-center gap-2 border-t border-line pt-4 sm:pt-5 text-[11px] font-medium text-fg-3 sm:text-xs">
          <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-gold-600 dark:text-gold-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="4" y="11" width="16" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
          <span>Instant Week 1 access upon enrollment</span>
        </div>
      </form>
    </AuthLayout>
  )
}
