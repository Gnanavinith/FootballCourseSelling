import { useState } from 'react'
import { FaWhatsapp } from 'react-icons/fa'
import Field from './Field.jsx'
import Reveal from '../common/Reveal.jsx'
import { api } from '../../lib/api.js'

const SEND_TO_API = true

const WHATSAPP_NUMBER = '919361405307'
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi Coach Prasanth, I would like to know more about the Vanakkam Soccer football training programs.')}`

const DEFAULT_COURSES = ['Beginner Football Skills', 'Advanced Dribbling & 1v1', 'Shooting & Finishing Masterclass']
const NOT_SURE = 'Not sure yet, help me choose'

const STEPS = [
  { n: 1, title: 'Tell Us Your Current Level', text: 'Share your age, playing position, and what skill you want to master most.', chip: 'bg-gold-400 text-ink-950' },
  { n: 2, title: 'Understand The 7-Day Unlock', text: 'Learn how lessons pace your training so you build genuine muscle memory.', chip: 'bg-pitch-500 text-white' },
  { n: 3, title: 'Honest Grassroots Advice', text: 'No high-pressure sales. We want you to join only if it truly fits your goals.', chip: 'bg-slate-200 text-ink-800 dark:bg-white/15 dark:text-white' },
]

const EMPTY = { name: '', email: '', phone: '', course: NOT_SURE, message: '', website: '' }

function validate(v) {
  const e = {}
  if (!v) return e
  if (v.name && v.name.trim().length < 2) e.name = 'Please enter your full name'
  if (!v.email || !v.email.trim()) e.email = 'Please enter your email address'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) e.email = 'Enter a valid email address'
  if (!v.phone || !v.phone.trim()) e.phone = 'Please enter your mobile number'
  else {
    const digits = v.phone.replace(/\D/g, '')
    if (!/^[0-9+\-\s]+$/.test(v.phone) || digits.length < 10 || digits.length > 13) e.phone = 'Enter a valid 10-digit mobile number'
  }
  if (!v.course) e.course = 'Please select a program'
  return e
}

async function sendEnquiry(payload) {
  if (!SEND_TO_API) {
    await new Promise((resolve) => setTimeout(resolve, 700))
    return
  }
  await api('/enquiries', { method: 'POST', body: JSON.stringify(payload) })
}

export default function EnquiryForm({ courses = DEFAULT_COURSES, embedded = false }) {
  const [values, setValues] = useState(EMPTY)
  const [touched, setTouched] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [errorKey, setErrorKey] = useState(0)
  const [sent, setSent] = useState(false)

  const errors = validate(values)
  const show = (n) => (touched[n] ? errors[n] : undefined)
  const set = (n) => (e) => setValues((v) => ({ ...v, [n]: e.target.value }))
  const blur = (n) => () => setTouched((t) => ({ ...t, [n]: true }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setTouched({ name: true, email: true, phone: true, course: true })

    const keys = Object.keys(errors)
    if (keys.length) {
      document.getElementById(`enquiry-${keys[0]}`)?.focus()
      return
    }

    if (values.website) {
      setSent(true)
      return
    }

    setLoading(true)
    try {
      await sendEnquiry({
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        course: values.course,
        subject: values.course,
        message: values.message.trim(),
      })
      setSent(true)
    } catch (err) {
      setError(err.message || 'Could not send your enquiry. Please message us directly on WhatsApp.')
      setErrorKey((k) => k + 1)
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setValues(EMPTY)
    setTouched({})
    setSent(false)
  }

  const guidance = (
    <div className="lg:col-span-5 flex flex-col justify-between h-full">
            <Reveal>
              <span className="badge badge-gold mb-3 inline-flex">
                Talk to Us
              </span>
              <h2 className="font-display text-3xl font-extrabold uppercase tracking-tight text-ink-950 dark:text-white sm:text-4xl">
                Have Doubts
                <span className="text-gradient block font-black">
                  Before Enrolling?
                </span>
              </h2>
              <p className="mt-3 text-sm text-ink-600 dark:text-ink-300 leading-relaxed sm:text-base">
                We know making decisions about sports training matters. Tell us about your child's age or your current gameplay, and we will give you an honest recommendation.
              </p>

              {/* Steps list */}
              <ol className="relative mt-8 space-y-6 before:absolute before:bottom-4 before:left-[1.125rem] before:top-4 before:w-px before:bg-slate-200 dark:before:bg-white/10">
                {STEPS.map((s) => (
                  <li key={s.n} className="relative flex items-start gap-4">
                    <span className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-display text-xs font-black shadow-sm ${s.chip}`}>
                      {s.n}
                    </span>
                    <div>
                      <p className="font-display font-bold text-ink-950 dark:text-white text-sm">{s.title}</p>
                      <p className="text-xs text-ink-600 dark:text-ink-300 mt-0.5 leading-relaxed">{s.text}</p>
                    </div>
                  </li>
                ))}
              </ol>

              {/* WhatsApp direct card */}
              <div className="mt-8 rounded-2xl border border-pitch-500/30 bg-pitch-500/10 p-5 backdrop-blur-md">
                <p className="text-xs font-bold text-pitch-700 dark:text-pitch-300 uppercase tracking-wider">Fastest Way to Reach Us</p>
                <p className="text-xs text-ink-700 dark:text-ink-200 mt-1">Get immediate answers from Coach Prasanth directly on WhatsApp.</p>
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-lg btn-green w-full mt-4 justify-center text-sm font-bold shadow-pitch-glow gap-2"
                >
                  <FaWhatsapp className="h-5 w-5" /> Chat on WhatsApp
                </a>
              </div>
            </Reveal>
    </div>
  );

  const formCol = (
    <Reveal delay={120}>
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-md dark:border-white/10 dark:bg-white/[0.03] dark:backdrop-blur-md dark:shadow-card">
                {sent ? (
                  <div className="py-10 text-center animate-fade-up" role="status">
                    <span className="mx-auto flex h-16 w-16 animate-pop items-center justify-center rounded-full bg-pitch-500 text-white shadow-pitch-glow">
                      <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="m5 12.5 4.5 4.5L19 7.5" />
                      </svg>
                    </span>
                    <h3 className="mt-5 font-display text-2xl font-extrabold text-ink-950 dark:text-white">We Received Your Enquiry!</h3>
                    <p className="mx-auto mt-2 max-w-sm text-sm text-ink-600 dark:text-ink-300">
                      Thank you, {values.name.trim().split(' ')[0]}. A coach will contact you on {values.phone || 'your number'} shortly.
                    </p>
                    <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                      <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer" className="btn btn-md btn-green justify-center gap-2">
                        <FaWhatsapp className="h-4 w-4" /> Message Coach Directly
                      </a>
                      <button type="button" onClick={reset} className="btn btn-md btn-outline justify-center">
                        Send Another Enquiry
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} noValidate className="space-y-5">
                    <div>
                      <h3 className="font-display text-xl font-bold text-ink-950 dark:text-white">Send An Enquiry</h3>
                      <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5">Takes under 60 seconds. We respond within a few hours.</p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field
                        id="enquiry-name"
                        label="Full Name *"
                        autoComplete="name"
                        value={values.name}
                        onChange={set('name')}
                        onBlur={blur('name')}
                        error={show('name')}
                        required
                      />
                      <Field
                        id="enquiry-email"
                        label="Email Address *"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        value={values.email}
                        onChange={set('email')}
                        onBlur={blur('email')}
                        error={show('email')}
                        required
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field
                        id="enquiry-phone"
                        label="Mobile / WhatsApp *"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        placeholder="98765 43210"
                        value={values.phone}
                        onChange={set('phone')}
                        onBlur={blur('phone')}
                        error={show('phone')}
                        required
                      />
                      <Field
                        id="enquiry-course"
                        as="select"
                        label="Preferred Program *"
                        value={values.course}
                        onChange={set('course')}
                        onBlur={blur('course')}
                        error={show('course')}
                      >
                        <option value={NOT_SURE}>{NOT_SURE}</option>
                        {courses.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </Field>
                    </div>

                    <Field
                      id="enquiry-message"
                      as="textarea"
                      label="Your Question or Playing Goal (Optional)"
                      rows={3}
                      maxLength={500}
                      placeholder="e.g. My 13-year-old son plays striker, which program will help him most?"
                      value={values.message}
                      onChange={set('message')}
                    />

                    {/* Hidden anti-bot spam trap */}
                    <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                      <label>
                        Website
                        <input type="text" name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={set('website')} />
                      </label>
                    </div>

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
                          <span className="spinner" aria-hidden="true" /> Sending...
                        </>
                      ) : (
                        'Submit Enquiry'
                      )}
                    </button>

                    <p className="text-[11px] text-center text-ink-500 dark:text-ink-400">
                      Your phone number and details are strictly used to reply to this enquiry.
                    </p>
                  </form>
                )}
        </div>
      </Reveal>
  );

  if (embedded) {
    return (
      <div className="w-full">
        {formCol}
      </div>
    );
  }

  return (
    <section className="relative overflow-hidden bg-slate-50 text-ink-950 py-16 sm:py-24 border-t border-slate-200 transition-colors duration-300 dark:bg-[#06090e] dark:border-white/5 dark:text-white">
      <div className="container-page">
        <div className="grid items-start gap-8 lg:grid-cols-12 lg:gap-12">
          {guidance}
          <div className="lg:col-span-7">{formCol}</div>
        </div>
      </div>
    </section>
  );
}
