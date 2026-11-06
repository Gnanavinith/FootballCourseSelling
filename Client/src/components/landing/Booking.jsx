import { useState } from 'react'
import Field from '../forms/Field.jsx'
import { startPayment } from '../../services/payment.service.js'

const SERVICES = [
  { id: '30m', label: '1-on-1 Video Review • 30 Min', desc: 'Technique audit & custom drill roadmap', price: 500 },
  { id: '1h', label: '1-Hour Tactical Mentorship', desc: 'Game analysis, 1v1 tactics & trial readiness', price: 1500 },
  { id: '2h', label: '2-Hour Complete Masterclass', desc: 'Full match footage breakdown & personalized coaching', price: 1999 },
]

const TIMES = ['Morning (6 AM to 10 AM)', 'Afternoon (12 PM to 4 PM)', 'Evening (5 PM to 9 PM)']

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function todayString() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function validate(f) {
  const e = {}
  if (f.name.trim().length < 2) e.name = 'Enter your full name'
  if (!f.email.trim()) e.email = 'Enter your email'
  else if (!EMAIL_RE.test(f.email.trim())) e.email = 'Enter a valid email address'
  const digits = f.phone.replace(/\D/g, '')
  if (!digits) e.phone = 'Enter your phone number'
  else if (digits.length < 10 || digits.length > 12) e.phone = 'Enter a valid 10-digit phone number'
  if (!f.date) e.date = 'Choose a preferred date'
  else if (f.date < todayString()) e.date = 'Choose today or a future date'
  if (!f.time) e.time = 'Choose a preferred time'
  return e
}

const prettyDate = (value) =>
  value
    ? new Date(`${value}T00:00:00`).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : null

const EMPTY = { name: '', email: '', phone: '', serviceId: SERVICES[0].id, date: '', time: TIMES[0], message: '' }

function readUser() {
  try { return JSON.parse(localStorage.getItem('user') || 'null') } catch { return null }
}

export default function Booking() {
  const [form, setForm] = useState(EMPTY)
  const [touched, setTouched] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [errorKey, setErrorKey] = useState(0)
  const [done, setDone] = useState(false)

  const service = SERVICES.find((s) => s.id === form.serviceId) || SERVICES[0]
  const errors = validate(form)
  const show = (n) => (touched[n] ? errors[n] : undefined)
  const set = (n) => (e) => setForm((f) => ({ ...f, [n]: e.target.value }))
  const blur = (n) => () => setTouched((t) => ({ ...t, [n]: true }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setTouched({ name: true, email: true, phone: true, date: true, time: true })

    const keys = Object.keys(errors)
    if (keys.length) {
      document.getElementById(`booking-${keys[0]}`)?.focus()
      return
    }

    const user = readUser()
    setLoading(true)
    try {
      await startPayment({
        studentId: user?.id ?? user?._id,
        serviceId: service.id,
        bookingDetails: {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          date: prettyDate(form.date) || form.date,
          time: form.time,
          serviceName: service.label,
          message: form.message?.trim() || '',
        },
        customer: {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
        },
        amount: service.price,
        description: service.label,
        onSuccess: () => {
          setDone(true)
          setLoading(false)
        },
        onError: (errMsg) => {
          setError(errMsg || 'Payment failed. Please try again.')
          setErrorKey((k) => k + 1)
          setLoading(false)
        },
        onClose: () => setLoading(false),
      })
    } catch (err) {
      setError(err?.message || 'Could not start the payment. Please try again.')
      setErrorKey((k) => k + 1)
      setLoading(false)
    }
  }

  function reset() {
    setForm(EMPTY)
    setTouched({})
    setDone(false)
  }

  return (
    <section id="booking" className="relative overflow-hidden bg-page text-fg-body py-16 sm:py-24 border-t border-line transition-colors duration-300">
      {/* Background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-20 top-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-gold-400/[0.04] blur-[120px]"
      />

      <div className="container-page relative z-10">
        <div className="grid items-start gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Summary panel on left */}
          <aside className="lg:col-span-5 rounded-3xl border border-line bg-surface p-6 sm:p-8 shadow-sm lg:sticky lg:top-28 text-fg">
            <span className="badge badge-gold mb-3 inline-flex">
              Direct Mentorship
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-fg">
              Book a 1-on-1 Session
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-fg-2 leading-relaxed">
              Get your match clips analyzed, fix technical habits in real time, and gain custom trial advice from Coach Prasanth.
            </p>

            <dl className="mt-8 space-y-4 border-t border-line pt-6 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-fg-3 text-xs uppercase font-bold tracking-wider">Plan</dt>
                <dd className="text-right font-semibold text-fg">{service.label}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-fg-3 text-xs uppercase font-bold tracking-wider">Date</dt>
                <dd className="text-right font-semibold text-fg">{prettyDate(form.date) || 'Pick a date'}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-fg-3 text-xs uppercase font-bold tracking-wider">Slot</dt>
                <dd className="text-right font-semibold text-fg">{form.time}</dd>
              </div>
              <div className="flex items-end justify-between gap-4 border-t border-line pt-4">
                <dt className="text-fg-3 text-xs uppercase font-bold tracking-wider">Total Investment</dt>
                <dd key={service.id} className="font-display text-3xl font-black text-gold-600 dark:text-gold-400">
                  {inr.format(service.price)}
                </dd>
              </div>
            </dl>

            <div className="mt-6 flex items-center gap-2 text-xs text-fg-3 pt-4 border-t border-line">
              <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-pitch-500 dark:text-pitch-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="4" y="11" width="16" height="10" rx="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
              </svg>
              <span>Instant Google Meet / Zoom confirmation via WhatsApp</span>
            </div>
          </aside>

          {/* Form on right */}
          <div className="lg:col-span-7 rounded-3xl border border-line bg-surface p-6 sm:p-8 shadow-md text-fg">
            {done ? (
              <div className="py-8 text-center animate-fade-up" role="status">
                <span className="mx-auto flex h-16 w-16 animate-pop items-center justify-center rounded-full bg-pitch-500 text-white shadow-pitch-glow">
                  <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m5 12.5 4.5 4.5L19 7.5" />
                  </svg>
                </span>
                <h3 className="mt-5 font-display text-2xl font-extrabold text-fg">Booking Confirmed!</h3>
                <p className="mx-auto mt-2 max-w-sm text-sm text-fg-2">
                  Thank you, {form.name.trim().split(' ')[0]}. Coach Prasanth has received your details for {service.label} on {prettyDate(form.date)}, {form.time}.
                </p>
                <button type="button" className="btn btn-md btn-outline mx-auto mt-6" onClick={reset}>
                  Book Another Session
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <div>
                  <h3 className="font-display text-xl font-bold text-fg">Your Football Details</h3>
                  <p className="text-xs text-fg-3 mt-0.5">Please share accurate contact details for session link delivery.</p>
                </div>

                <Field
                  id="booking-name"
                  label="Player / Parent Full Name *"
                  autoComplete="name"
                  value={form.name}
                  onChange={set('name')}
                  onBlur={blur('name')}
                  error={show('name')}
                  required
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    id="booking-email"
                    label="Email Address *"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={set('email')}
                    onBlur={blur('email')}
                    error={show('email')}
                    required
                  />
                  <Field
                    id="booking-phone"
                    label="WhatsApp Mobile Number *"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="98765 43210"
                    value={form.phone}
                    onChange={set('phone')}
                    onBlur={blur('phone')}
                    error={show('phone')}
                    required
                  />
                </div>

                {/* Service selection as cards */}
                <fieldset>
                  <legend className="label mb-2 block font-semibold text-xs uppercase tracking-wider text-fg-2">
                    Select Mentorship Format
                  </legend>
                  <div className="grid gap-3">
                    {SERVICES.map((s) => (
                      <label
                        key={s.id}
                        className={`relative flex cursor-pointer items-center justify-between gap-3 rounded-2xl border p-4 pr-16 sm:pr-5 transition-all duration-200 ${
                          form.serviceId === s.id
                            ? 'border-gold-500 bg-gold-500/10 shadow-[0_0_15px_rgba(245,158,11,0.15)] dark:border-gold-400 dark:bg-gold-400/10'
                            : 'border-line bg-surface-2/60 hover:border-gold-400/40 hover:bg-surface-2 text-fg'
                        }`}
                      >
                        <input
                          type="radio"
                          name="service"
                          value={s.id}
                          checked={form.serviceId === s.id}
                          onChange={set('serviceId')}
                          className="sr-only"
                        />
                        <div className="min-w-0 flex-1">
                          <span className="block font-display font-bold text-sm text-fg">{s.label}</span>
                          <span className="text-xs text-fg-3 block mt-0.5">{s.desc}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-display font-extrabold text-gold-600 dark:text-gold-400 text-base sm:text-lg block">
                            {inr.format(s.price)}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    id="booking-date"
                    label="Preferred Date *"
                    type="date"
                    min={todayString()}
                    value={form.date}
                    onChange={set('date')}
                    onBlur={blur('date')}
                    error={show('date')}
                    required
                  />
                  <Field
                    id="booking-time"
                    as="select"
                    label="Preferred Time Slot *"
                    value={form.time}
                    onChange={set('time')}
                    onBlur={blur('time')}
                    error={show('time')}
                  >
                    {TIMES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </Field>
                </div>

                <Field
                  id="booking-message"
                  as="textarea"
                  label="Your Current Position &amp; Questions (Optional)"
                  rows={3}
                  maxLength={500}
                  placeholder="Tell Coach your playing position, age, or specific areas you want to improve..."
                  value={form.message}
                  onChange={set('message')}
                />

                {error && (
                  <div key={errorKey} role="alert" className="rounded-xl border border-danger-500/40 bg-danger-500/10 px-4 py-3 text-xs font-semibold text-danger-700 dark:text-danger-300">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-xl btn-primary w-full justify-center shadow-glow font-extrabold"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner" aria-hidden="true" /> Securing Slot...
                    </>
                  ) : (
                    <>Confirm &amp; Book {inr.format(service.price)}</>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
