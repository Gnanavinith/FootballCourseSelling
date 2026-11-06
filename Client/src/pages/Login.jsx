import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { authService } from '../services/auth.service.js'
import AuthLayout from '../components/auth/AuthLayout.jsx'
import Field from '../components/forms/Field.jsx'
import { usePageMeta } from '../hooks/usePageMeta.js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate({ email, password }) {
  const errors = {}
  if (!email.trim()) errors.email = 'Enter your email'
  else if (!EMAIL_RE.test(email.trim())) errors.email = 'Enter a valid email address'
  if (!password) errors.password = 'Enter your password'
  return errors
}

export default function Login() {
  usePageMeta({ title: 'Login | Vanakkam Soccer', noindex: true })

  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [touched, setTouched] = useState({})
  const [error, setError] = useState('')
  const [errorKey, setErrorKey] = useState(0)
  const [loading, setLoading] = useState(false)

  const errors = validate({ email, password })
  const show = (name) => (touched[name] ? errors[name] : undefined)
  const blur = (name) => () => setTouched((t) => ({ ...t, [name]: true }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setTouched({ email: true, password: true })
    if (Object.keys(errors).length) {
      const first = Object.keys(errors)[0]
      document.getElementById(first)?.focus()
      return
    }

    setLoading(true)
    try {
      const data = await authService.login(email.trim(), password)
      const role = data?.user?.role
      navigate(role === 'superadmin' || role === 'admin' ? '/admin' : '/dashboard', { replace: true })
    } catch (err) {
      setError(err.message || 'Login failed')
      setErrorKey((k) => k + 1)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to continue your weekly lessons."
      footer={
        <span className="text-sm text-ink-600 dark:text-ink-300">
          New to Vanakkam Soccer?{' '}
          <Link
            to="/register"
            className="font-extrabold text-gold-600 underline-offset-4 transition-colors hover:text-gold-500 hover:underline dark:text-gold-400 dark:hover:text-gold-300"
          >
            Create an account
          </Link>
        </span>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4 sm:space-y-5">
        <Field
          id="email"
          label="Email Address"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={blur('email')}
          error={show('email')}
          required
        />

        <Field
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="Your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={blur('password')}
          error={show('password')}
          labelRight={
            <Link
              to="/reset-password"
              className="text-xs font-bold text-gold-600 underline-offset-4 transition-colors hover:text-gold-500 hover:underline dark:text-gold-400 dark:hover:text-gold-300"
            >
              Forgot password?
            </Link>
          }
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
              <span className="spinner" aria-hidden="true" /> Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </button>

        <div className="flex items-center justify-center gap-2 border-t border-line pt-4 sm:pt-5 text-[11px] font-medium text-fg-3 sm:text-xs">
          <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-gold-600 dark:text-gold-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="4" y="11" width="16" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
          <span>Secure, encrypted sign-in</span>
        </div>
      </form>
    </AuthLayout>
  )
}