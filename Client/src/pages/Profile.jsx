import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Reveal from '../components/common/Reveal.jsx'
import { usePageMeta } from '../hooks/usePageMeta.js'
import { api } from '../lib/api.js'
import { authService } from '../services/auth.service.js'
import { ThemeToggle } from '../components/layout/Navbar.jsx'

const readUser = () => {
  try { return JSON.parse(localStorage.getItem('user') || 'null') } catch { return null }
}

function Avatar({ user, size = 'xl' }) {
  const [broken, setBroken] = useState(false)
  const src = user?.avatar || user?.photo || ''
  useEffect(() => setBroken(false), [src])
  const sizeClass = size === 'xl' ? 'h-24 w-24 text-2xl' : 'h-16 w-16 text-lg'
  const initials = (user?.name || '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => Array.from(w)[0] || '')
    .join('')
    .toUpperCase() || 'U'

  if (src && !broken) {
    return (
      <img
        src={src}
        alt=""
        onError={() => setBroken(true)}
        className={`${sizeClass} shrink-0 rounded-full object-cover ring-4 ring-gold-400/30`}
      />
    )
  }
  return (
    <span className={`${sizeClass} flex shrink-0 items-center justify-center rounded-full bg-gold-400 font-display font-extrabold text-ink-950 ring-4 ring-gold-400/30`}>
      {initials}
    </span>
  )
}

function Toast({ message, error, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, error ? 6000 : 3000)
    return () => clearTimeout(t)
  }, [error, onDismiss])
  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border px-5 py-3 text-sm font-semibold shadow-pop animate-fade-up ${
        error
          ? 'border-danger-500/30 bg-tint-red text-on-tint-red'
          : 'border-pitch-500/30 bg-tint-green text-on-tint-green'
      }`}
    >
      {message}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <Reveal>
      <section className="card">
        <div className="border-b border-line px-6 py-4">
          <h2 className="font-display text-base font-bold text-fg">{title}</h2>
        </div>
        <div className="card-body">{children}</div>
      </section>
    </Reveal>
  )
}

function Field({ label, error, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-fg-body">{label}</span>
      {children}
      {error && <span className="form-error">{error}</span>}
      {!error && hint && <span className="form-hint">{hint}</span>}
    </label>
  )
}

export default function Profile() {
  usePageMeta({ title: 'Profile | Vanakkam Soccer', noindex: true })

  const [user, setUser] = useState(readUser)
  const [toast, setToast] = useState(null)

  /* --- Profile form state --- */
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileErrors, setProfileErrors] = useState({})

  /* --- Password form state --- */
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [savingPw, setSavingPw] = useState(false)
  const [pwErrors, setPwErrors] = useState({})
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)

  /* --- Avatar state --- */
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileRef = useRef(null)

  useEffect(() => {
    if (!avatarFile) { setAvatarPreview(''); return }
    const url = URL.createObjectURL(avatarFile)
    setAvatarPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [avatarFile])

  const notify = (text, error = false) => setToast({ text, error })

  const saveProfile = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!name.trim() || name.trim().length < 2) errs.name = 'Enter your name (min 2 chars).'
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email address.'
    setProfileErrors(errs)
    if (Object.keys(errs).length) return

    setSavingProfile(true)
    try {
      const res = await api('/me/profile', { method: 'PUT', body: { name: name.trim(), email: email.trim(), phone: phone.trim() } })
      const updated = { ...user, ...(res.data || {}) }
      localStorage.setItem('user', JSON.stringify(updated))
      setUser(updated)
      notify('Profile updated')
    } catch (err) {
      notify(err.message || 'Could not save profile', true)
    } finally {
      setSavingProfile(false)
    }
  }

  const savePassword = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!currentPw) errs.currentPw = 'Enter your current password.'
    if (!newPw || newPw.length < 8) errs.newPw = 'New password must be at least 8 characters.'
    if (newPw !== confirmPw) errs.confirmPw = 'Passwords do not match.'
    setPwErrors(errs)
    if (Object.keys(errs).length) return

    setSavingPw(true)
    try {
      await api('/me/password', { method: 'PUT', body: { currentPassword: currentPw, newPassword: newPw } })
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
      notify('Password changed')
    } catch (err) {
      notify(err.message || 'Could not change password', true)
    } finally {
      setSavingPw(false)
    }
  }

  const uploadAvatar = async () => {
    if (!avatarFile) return
    setUploadingAvatar(true)
    try {
      const fd = new FormData()
      fd.append('avatar', avatarFile)
      const res = await api('/me/avatar', { method: 'POST', body: fd })
      const updated = { ...user, avatar: res.data?.avatarUrl || avatarPreview }
      localStorage.setItem('user', JSON.stringify(updated))
      setUser(updated)
      setAvatarFile(null)
      notify('Avatar updated')
    } catch (err) {
      notify(err.message || 'Could not upload avatar', true)
    } finally {
      setUploadingAvatar(false)
    }
  }

  const displayUser = avatarPreview
    ? { ...user, avatar: avatarPreview, photo: undefined }
    : user

  const eyeIcon = (show) => (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {show
        ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
        : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
      }
    </svg>
  )

  return (
    <main>
      <section className="section-dark hero-bg">
        <div className="container-page pb-20 pt-8 md:pb-28 md:pt-14">
          <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-ink-400 hover:text-white no-underline hover:no-underline mb-4 animate-fade-up">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            Dashboard
          </Link>
          <div className="mt-2 flex items-center justify-between gap-3 animate-fade-up">
            <p className="text-small font-semibold uppercase tracking-widest text-gold-400">Account</p>
            <ThemeToggle compact />
          </div>
          <h1 className="mt-2 animate-fade-up" style={{ animationDelay: '80ms' }}>
            Your <span className="text-gradient">Profile</span>
          </h1>
          <p className="text-lead mt-3 animate-fade-up" style={{ animationDelay: '160ms' }}>
            Manage your personal information and account settings.
          </p>
        </div>
      </section>

      <div className="container-page relative z-10 -mt-12 pb-16 md:-mt-16">
        <div className="mx-auto max-w-2xl space-y-6">
          {/* Avatar card */}
          <Reveal>
            <div className="card card-body flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
              <Avatar user={displayUser} size="xl" />
              <div className="flex-1 text-center sm:text-left">
                <p className="font-display text-xl font-bold text-fg">{user?.name || 'Student'}</p>
                <p className="text-sm text-fg-3">{user?.email}</p>
                <p className="mt-2 inline-flex rounded-full bg-tint-gold px-3 py-1 text-xs font-bold text-on-tint-gold">
                  {user?.role === 'admin' || user?.role === 'superadmin' ? 'Admin' : 'Student'}
                </p>

                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                  />
                  <button type="button" onClick={() => fileRef.current?.click()} className="btn btn-sm btn-outline">
                    Choose photo
                  </button>
                  {avatarFile && (
                    <button type="button" onClick={uploadAvatar} disabled={uploadingAvatar} className="btn btn-sm btn-primary">
                      {uploadingAvatar ? <><span className="spinner" /> Uploading…</> : 'Upload photo'}
                    </button>
                  )}
                </div>
                <p className="mt-2 text-xs text-fg-3">JPG, PNG or WebP, max 5 MB.</p>
              </div>
            </div>
          </Reveal>

          {/* Personal info */}
          <Section title="Personal information">
            <form onSubmit={saveProfile} noValidate className="space-y-4">
              <Field label="Full name" error={profileErrors.name}>
                <input
                  type="text"
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                />
              </Field>
              <Field label="Email address" error={profileErrors.email}>
                <input
                  type="email"
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </Field>
              <Field label="Phone number" hint="Optional. Used only for billing queries.">
                <input
                  type="tel"
                  className="input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                />
              </Field>
              <div className="flex justify-end">
                <button type="submit" disabled={savingProfile} className="btn btn-md btn-primary">
                  {savingProfile ? <><span className="spinner" /> Saving…</> : 'Save changes'}
                </button>
              </div>
            </form>
          </Section>

          {/* Change password */}
          <Section title="Change password">
            <form onSubmit={savePassword} noValidate className="space-y-4">
              <Field label="Current password" error={pwErrors.currentPw}>
                <div className="relative">
                  <input
                    type={showCurrentPw ? 'text' : 'password'}
                    className="input pr-11"
                    value={currentPw}
                    onChange={(e) => setCurrentPw(e.target.value)}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-3 hover:text-fg"
                    aria-label={showCurrentPw ? 'Hide password' : 'Show password'}
                  >
                    {eyeIcon(showCurrentPw)}
                  </button>
                </div>
              </Field>
              <Field label="New password" hint="At least 8 characters." error={pwErrors.newPw}>
                <div className="relative">
                  <input
                    type={showNewPw ? 'text' : 'password'}
                    className="input pr-11"
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-3 hover:text-fg"
                    aria-label={showNewPw ? 'Hide password' : 'Show password'}
                  >
                    {eyeIcon(showNewPw)}
                  </button>
                </div>
              </Field>
              <Field label="Confirm new password" error={pwErrors.confirmPw}>
                <input
                  type="password"
                  className="input"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  autoComplete="new-password"
                />
              </Field>
              <div className="flex justify-end">
                <button type="submit" disabled={savingPw} className="btn btn-md btn-dark">
                  {savingPw ? <><span className="spinner" /> Saving…</> : 'Change password'}
                </button>
              </div>
            </form>
          </Section>

          {/* Danger zone */}
          <Section title="Account">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-fg">Sign out of all devices</p>
                <p className="text-sm text-fg-3">Removes your session from this browser immediately.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  authService.logout()
                  window.location.href = '/'
                }}
                className="btn btn-sm btn-danger shrink-0"
              >
                Sign out
              </button>
            </div>
          </Section>
        </div>
      </div>

      {toast && <Toast message={toast.text} error={toast.error} onDismiss={() => setToast(null)} />}
    </main>
  )
}
