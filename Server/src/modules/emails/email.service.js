import crypto from 'crypto'
import mongoose from 'mongoose'
import nodemailer from 'nodemailer'
import cron from 'node-cron'
import { convert } from 'html-to-text'
import { env } from '../../config/env.js'
import { EmailLog } from './emailLog.model.js'
import { EmailTemplate } from './emailTemplate.model.js'
import { EmailSettings } from './emailSettings.model.js'
import { DEFAULT_TEMPLATES } from './email.templates.js'
import { renderBlock, renderEmailLayout } from './email.layout.js'
import { User } from '../users/user.model.js'
import { Enrollment } from '../enrollments/enrollment.model.js'
import { Course } from '../courses/course.model.js'
import { Order } from '../orders/order.model.js'
import { Enquiry } from '../enquiries/enquiry.model.js'

/* ------------------------------------------------------------------ */
/* Transporter & Pooling                                               */
/* ------------------------------------------------------------------ */
let transporter = null

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpSecure,
      auth: env.smtpUser ? { user: env.smtpUser, pass: env.smtpPass } : undefined,
    })
  }
  return transporter
}

/* ------------------------------------------------------------------ */
/* Helpers: escaping, date, currency, tokens                          */
/* ------------------------------------------------------------------ */
export function escapeHtml(str) {
  if (str === null || str === undefined) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function sanitizeUrl(url) {
  if (!url) return '#'
  const trimmed = String(url).trim()
  if (/^https?:\/\//i.test(trimmed) || /^mailto:/i.test(trimmed) || /^tel:/i.test(trimmed)) {
    return escapeHtml(trimmed)
  }
  return '#'
}

export function formatIST(date) {
  if (!date) return ''
  const d = new Date(date)
  return (
    d.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }) + ' IST'
  )
}

export function formatINR(amount) {
  const num = Number(amount) || 0
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num)
}

export function generateUnsubscribeToken(userId, email) {
  const payload = `${userId}:${email}`
  const hmac = crypto.createHmac('sha256', env.jwtSecret).update(payload).digest('hex')
  return Buffer.from(`${payload}:${hmac}`).toString('base64url')
}

export function verifyUnsubscribeToken(token) {
  try {
    const raw = Buffer.from(token, 'base64url').toString('utf-8')
    const parts = raw.split(':')
    if (parts.length < 3) return null
    const [userId, email, hmac] = [parts[0], parts[1], parts.slice(2).join(':')]
    const expected = crypto
      .createHmac('sha256', env.jwtSecret)
      .update(`${userId}:${email}`)
      .digest('hex')
    if (crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(expected))) {
      return { userId, email }
    }
  } catch {}
  return null
}

/* ------------------------------------------------------------------ */
/* Template string interpolation with escaping                        */
/* ------------------------------------------------------------------ */
export function interpolateString(templateStr = '', data = {}) {
  return templateStr.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, key) => {
    let val = data[key]
    if (val === undefined && key.includes('.')) {
      val = key.split('.').reduce((acc, part) => acc?.[part], data)
    }
    return escapeHtml(val !== undefined && val !== null ? val : '')
  })
}

export function interpolateUrl(urlStr = '', data = {}) {
  const raw = urlStr.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, key) => {
    let val = data[key]
    if (val === undefined && key.includes('.')) {
      val = key.split('.').reduce((acc, part) => acc?.[part], data)
    }
    return val !== undefined && val !== null ? String(val) : ''
  })
  return sanitizeUrl(raw)
}

/* ------------------------------------------------------------------ */
/* Settings Singleton helper                                          */
/* ------------------------------------------------------------------ */
export async function getSettings() {
  let settings = await EmailSettings.findOne()
  if (!settings) {
    settings = await EmailSettings.create({
      fromName: 'Vanakkam Soccer',
      fromEmail: env.smtpUser || 'noreply@vanakkamsoccer.com',
      replyTo: 'support@vanakkamsoccer.com',
      adminRecipients: [env.adminEmail || 'admin@vanakkamsoccer.com'],
      logoUrl: 'https://vanakkamsoccer.com/logo.png',
      footerAddress: 'Vanakkam Soccer Academy, Chennai, Tamil Nadu, India',
      supportEmail: 'support@vanakkamsoccer.com',
      whatsappNumber: '+91 98765 43210',
      youtubeUrl: 'https://youtube.com/@vanakkamsoccer',
      digestHourIST: 8,
      dailyLimit: 500,
    })
  }
  return settings
}

/* ------------------------------------------------------------------ */
/* Main Email Service                                                  */
/* ------------------------------------------------------------------ */
export const emailService = {
  getSettings,
  /**
   * Loads template definition, preferring DB override over code default.
   */
  async getTemplate(key) {
    const dbTpl = await EmailTemplate.findOne({ key })
    if (dbTpl) return dbTpl.toObject()
    const def = DEFAULT_TEMPLATES[key]
    if (def) return { ...def, isDefault: true }
    return null
  },

  /**
   * Renders a template into HTML & Plain-text with safe variables.
   */
  renderTemplate(template, data = {}, settings = {}, unsubscribeUrl = null) {
    const subject = interpolateString(template.subject || '', data)
    const preheader = interpolateString(template.preheader || '', data)

    const renderedBlocks = (template.blocks || []).map((b) => {
      const copy = { ...b }
      if (copy.text) copy.text = interpolateString(copy.text, data)
      if (copy.label) copy.label = interpolateString(copy.label, data)
      if (copy.url) copy.url = interpolateUrl(copy.url, data)
      if (Array.isArray(copy.items)) {
        copy.items = copy.items.map((it) => ({
          label: interpolateString(it.label, data),
          value: interpolateString(it.value, data),
        }))
      }
      return renderBlock(copy)
    })

    const contentHtml = renderedBlocks.join('\n')
    const html = renderEmailLayout({
      preheader,
      contentHtml,
      settings,
      unsubscribeUrl,
    })

    const text = convert(html, {
      wordwrap: 130,
      selectors: [
        { selector: 'a', options: { hideLinkHrefIfSameAsText: true } },
        { selector: 'img', format: 'skip' },
      ],
    })

    return { subject, html, text }
  },

  /**
   * Core non-blocking queue method.
   * Inserts into EmailLog as 'queued'.
   */
  async sendTemplate(key, { to, toName = '', replyTo = null, data = {}, dedupeKey = null, userId = null, entityType = null, entityId = null, isBroadcast = false }) {
    try {
      if (!to || !to.includes('@')) return { skipped: true, reason: 'invalid_email' }

      const settings = await getSettings()

      // Per-template enabled check
      if (settings.perTemplateEnabled && settings.perTemplateEnabled.get(key) === false) {
        return { skipped: true, reason: 'template_disabled_in_settings' }
      }

      // Load template
      const template = await this.getTemplate(key)
      if (!template) {
        console.warn(`[EmailService] Template '${key}' not found.`)
        return { skipped: true, reason: 'template_not_found' }
      }
      if (template.enabled === false) {
        return { skipped: true, reason: 'template_disabled' }
      }

      // Check user opt-out for broadcast emails
      let unsubscribeUrl = null
      if (isBroadcast) {
        if (userId) {
          const user = await User.findById(userId)
          if (user?.emailOptOut) {
            return { skipped: true, reason: 'user_opted_out' }
          }
          const token = generateUnsubscribeToken(user._id.toString(), to)
          unsubscribeUrl = `${env.clientOrigin}/api/email/unsubscribe?token=${token}`
        }
      }

      // Render
      const { subject, html, text } = this.renderTemplate(template, data, settings, unsubscribeUrl)

      // Create queued log entry (safe against dedupe collision)
      const log = await EmailLog.create({
        dedupeKey: dedupeKey || undefined,
        templateKey: key,
        to: to.trim().toLowerCase(),
        toName: toName ? toName.trim() : '',
        replyTo: replyTo ? String(replyTo).trim() : undefined,
        subject,
        html,
        text,
        status: 'queued',
        attempts: 0,
        nextAttemptAt: new Date(),
        userId: userId || undefined,
        entityType: entityType || undefined,
        entityId: entityId ? String(entityId) : undefined,
        template: html, // backwards compatibility
        relatedUserId: userId || undefined,
      })

      // Dispatch processing immediately (outside unit test runner) so user/admin doesn't have to wait for cron
      if (process.env.NODE_ENV !== 'test') {
        setImmediate(() => {
          this.processQueue().catch((err) => console.error('[EmailService Immediate Process Error]:', err))
        })
      }

      return { queued: true, logId: log._id }
    } catch (err) {
      // Duplicate key error (E11000) for dedupeKey -> silently skip
      if (err.code === 11000 || String(err.message).includes('E11000')) {
        return { skipped: true, reason: 'duplicate_dedupe_key' }
      }
      console.error(`[EmailService] sendTemplate error for ${key}:`, err)
      return { error: err.message }
    }
  },

  /**
   * Backwards-compatible queue method for existing legacy callers.
   */
  async queue({ to, template, subject, relatedUserId, relatedOrderId }) {
    try {
      const text = convert(template || subject, { wordwrap: 130 })
      return await EmailLog.create({
        to: to.trim().toLowerCase(),
        templateKey: 'custom',
        subject: subject || 'Vanakkam Soccer Notification',
        html: template || `<p>${subject}</p>`,
        text,
        status: 'queued',
        relatedUserId,
        relatedOrderId,
        userId: relatedUserId,
        template,
      })
    } catch (e) {
      console.error('[EmailService] legacy queue error:', e)
    }
  },

  /**
   * Background Queue Worker.
   * Runs every minute: grabs up to 20 queued logs, updates atomically to 'sending', sends and updates.
   */
  async processQueue() {
    if (mongoose.connection.readyState !== 1) return
    const settings = await getSettings()

    // Daily limit check
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    const sentToday = await EmailLog.countDocuments({
      status: 'sent',
      sentAt: { $gte: startOfDay },
    })
    const dailyLimit = settings.dailyLimit || 500
    if (sentToday >= dailyLimit) {
      console.warn(`[EmailWorker] Daily limit reached (${sentToday}/${dailyLimit}). Skipping batch.`)
      return
    }

    const availableSlots = Math.min(20, dailyLimit - sentToday)

    const candidates = await EmailLog.find({
      status: 'queued',
      nextAttemptAt: { $lte: new Date() },
      attempts: { $lt: 4 },
    })
      .sort({ createdAt: 1 })
      .limit(availableSlots)

    for (const item of candidates) {
      // Atomic flip from 'queued' to 'sending'
      const log = await EmailLog.findOneAndUpdate(
        { _id: item._id, status: 'queued' },
        { status: 'sending' },
        { new: true }
      )
      if (!log) continue // picked up by another worker/process

      log.attempts += 1
      const fromAddress = `"${settings.fromName || 'Vanakkam Soccer'}" <${settings.fromEmail || env.smtpUser || 'noreply@vanakkamsoccer.com'}>`

      const mailOptions = {
        from: fromAddress,
        to: log.toName ? `"${log.toName}" <${log.to}>` : log.to,
        replyTo: log.replyTo || settings.replyTo || 'support@vanakkamsoccer.com',
        subject: log.subject,
        html: log.html,
        text: log.text,
      }

      // Add List-Unsubscribe header for broadcast emails
      if (log.templateKey === 'broadcast' && log.userId) {
        const token = generateUnsubscribeToken(log.userId.toString(), log.to)
        const unsubUrl = `${env.clientOrigin}/api/email/unsubscribe?token=${token}`
        mailOptions.headers = {
          'List-Unsubscribe': `<${unsubUrl}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        }
      }

      try {
        if (!env.smtpHost) {
          // Development / testing mode when SMTP is not configured
          console.log(`[EmailWorker: DEV MOCK] Sent '${log.templateKey}' to ${log.to}`)
          log.status = 'sent'
          log.sentAt = new Date()
          log.providerMessageId = `mock-${Date.now()}`
          log.error = ''
        } else {
          const mailer = getTransporter()
          const info = await mailer.sendMail(mailOptions)
          log.status = 'sent'
          log.sentAt = new Date()
          log.providerMessageId = info.messageId || ''
          log.error = ''
        }
      } catch (err) {
        log.error = err.message || 'Send error'
        if (log.attempts >= 4) {
          log.status = 'failed'
          // Alert admin once per failed email
          const alertDedupe = `alert:email_failed:${log._id}`
          const alertRecipients = settings.adminRecipients?.length
            ? settings.adminRecipients
            : [env.adminEmail || 'admin@vanakkamsoccer.com']
          for (const adminTo of alertRecipients) {
            await this.sendTemplate('admin_alert', {
              to: adminTo,
              data: {
                'alert.title': `Email Delivery Failed (${log.templateKey})`,
                'alert.details': `Failed to deliver email '${log.subject}' to ${log.to} after ${log.attempts} attempts. Error: ${log.error}`,
                timestamp: formatIST(new Date()),
              },
              dedupeKey: `${alertDedupe}:${adminTo}`,
            })
          }
        } else {
          // Exponential backoff: 1 min, 5 min, 30 min
          const backoffMinutes = log.attempts === 1 ? 1 : log.attempts === 2 ? 5 : 30
          log.status = 'queued'
          log.nextAttemptAt = new Date(Date.now() + backoffMinutes * 60 * 1000)
        }
      }
      await log.save()
    }
  },

  /**
   * Weekly Drip Cron Job (runs every 15 min in Asia/Kolkata).
   * Calculates student unlocked weeks, locks previous weeks, sends notifications.
   */
  async processDripSchedules() {
    const now = new Date()
    const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000
    const MS_24_HOURS = 24 * 60 * 60 * 1000

    const enrollments = await Enrollment.find({ status: 'Active' })

    for (const e of enrollments) {
      if (e.pausedAt || e.unlockedAll) continue

      const course = await Course.findById(e.courseId)
      const student = await User.findById(e.userId)
      if (!course || !student || !student.isActive) continue

      const totalWeeks = Number(course.totalWeeks || course.weeks) || 1
      const startMs = new Date(e.startsAt).getTime()
      const extraMs = e.extraMs || 0
      const elapsed = now.getTime() - startMs - extraMs
      if (elapsed < 0) continue

      const currentWeek = Math.floor(elapsed / MS_PER_WEEK) + 1

      // 1. Check week_unlocked for weeks 2..totalWeeks
      if (currentWeek >= 2 && currentWeek <= totalWeeks) {
        const lastNotified = e.notifiedWeek || 1
        if (currentWeek > lastNotified) {
          // If the server was down, send ONLY the latest missed week
          await this.sendTemplate('week_unlocked', {
            to: student.email,
            toName: student.name,
            data: {
              name: student.name,
              'course.title': course.title,
              'week.number': String(currentWeek),
              watchUrl: `${env.clientOrigin}/watch/${course._id}`,
            },
            dedupeKey: `week:${e._id}:${currentWeek}`,
            userId: student._id,
            entityType: 'Enrollment',
            entityId: e._id.toString(),
          })
          e.notifiedWeek = currentWeek
          await e.save()
        }
      }

      // 2. Check week_ending_soon: within 24h of current week closing
      if (currentWeek <= totalWeeks) {
        const currentWeekEndMs = startMs + extraMs + currentWeek * MS_PER_WEEK
        const msUntilClose = currentWeekEndMs - now.getTime()
        if (msUntilClose > 0 && msUntilClose <= MS_24_HOURS) {
          await this.sendTemplate('week_ending_soon', {
            to: student.email,
            toName: student.name,
            data: {
              name: student.name,
              'course.title': course.title,
              'week.number': String(currentWeek),
              closesAt: formatIST(new Date(currentWeekEndMs)),
              watchUrl: `${env.clientOrigin}/watch/${course._id}`,
            },
            dedupeKey: `ending:${e._id}:${currentWeek}`,
            userId: student._id,
            entityType: 'Enrollment',
            entityId: e._id.toString(),
          })
        }
      }

      // 3. Check course_completed: after final week ends
      if (currentWeek > totalWeeks) {
        await this.sendTemplate('course_completed', {
          to: student.email,
          toName: student.name,
          data: {
            name: student.name,
            'course.title': course.title,
            dashboardUrl: `${env.clientOrigin}/dashboard`,
          },
          dedupeKey: `completed:${e._id}`,
          userId: student._id,
          entityType: 'Enrollment',
          entityId: e._id.toString(),
        })
      }
    }
  },

  /**
   * Daily Admin Digest Cron Job (runs at digestHourIST, default 08:00 IST).
   */
  async processDailyDigest() {
    const settings = await getSettings()
    const now = new Date()
    const past24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    const [newStudents, orders, pendingEnquiries, failedEmails] = await Promise.all([
      User.countDocuments({ role: 'student', createdAt: { $gte: past24h } }),
      Order.find({ status: 'Paid', paidAt: { $gte: past24h } }),
      Enquiry.countDocuments({ status: { $in: ['New', 'In progress'] } }),
      EmailLog.countDocuments({ status: 'failed', createdAt: { $gte: past24h } }),
    ])

    const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.amount) || 0), 0)
    const dateFormatted = new Date().toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })

    const recipients = settings.adminRecipients?.length
      ? settings.adminRecipients
      : [env.adminEmail || 'admin@vanakkamsoccer.com']

    for (const to of recipients) {
      await this.sendTemplate('admin_daily_digest', {
        to,
        data: {
          date: dateFormatted,
          newStudents: String(newStudents),
          ordersCount: String(orders.length),
          revenue: formatINR(totalRevenue),
          pendingEnquiries: String(pendingEnquiries),
          failedEmails: String(failedEmails),
        },
        dedupeKey: `digest:${dateFormatted}:${to}`,
      })
    }
  },

  /**
   * Start Cron Workers:
   * 1. Queue sender worker (every minute)
   * 2. Drip access & reminder worker (every 15 min, Asia/Kolkata)
   * 3. Daily digest worker (every hour, triggers at digestHourIST)
   */
  startWorker() {
    // 1. Process email queue every minute
    cron.schedule('* * * * *', () => {
      this.processQueue().catch((err) => console.error('[EmailWorker] Error:', err))
    })

    // Immediate run on startup
    this.processQueue().catch((err) => console.error('[EmailWorker Startup] Error:', err))

    // 2. Drip schedule check every 15 minutes
    cron.schedule(
      '*/15 * * * *',
      () => {
        this.processDripSchedules().catch((err) => console.error('[DripWorker] Error:', err))
      },
      { timezone: 'Asia/Kolkata' }
    )

    // 3. Daily digest cron: check hourly, run when current IST hour matches digestHourIST
    cron.schedule(
      '0 * * * *',
      async () => {
        try {
          const settings = await getSettings()
          const currentHour = Number(
            new Date().toLocaleString('en-US', {
              timeZone: 'Asia/Kolkata',
              hour: 'numeric',
              hour12: false,
            })
          )
          if (currentHour === (settings.digestHourIST ?? 8)) {
            await this.processDailyDigest()
          }
        } catch (err) {
          console.error('[DigestWorker] Error:', err)
        }
      },
      { timezone: 'Asia/Kolkata' }
    )

    console.log('[EmailService] Queue worker and cron jobs started.')
  },
}

export default emailService
