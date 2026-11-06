import { asyncHandler } from '../../utils/asyncHandler.js'
import { EmailLog } from './emailLog.model.js'
import { EmailTemplate } from './emailTemplate.model.js'
import { EmailSettings } from './emailSettings.model.js'
import { DEFAULT_TEMPLATES } from './email.templates.js'
import {
  emailService,
  getSettings,
  verifyUnsubscribeToken,
  formatIST,
} from './email.service.js'
import { User } from '../users/user.model.js'
import { Enrollment } from '../enrollments/enrollment.model.js'
import nodemailer from 'nodemailer'
import { env } from '../../config/env.js'

// In-memory rate limiting map for test and broadcast endpoints
const rateLimits = new Map()
function checkRateLimit(key, maxRequests, windowMs) {
  const now = Date.now()
  const record = rateLimits.get(key) || { count: 0, resetAt: now + windowMs }
  if (now > record.resetAt) {
    record.count = 0
    record.resetAt = now + windowMs
  }
  record.count += 1
  rateLimits.set(key, record)
  return record.count <= maxRequests
}

export const emailController = {
  // ==========================================
  // Overview
  // ==========================================
  overview: asyncHandler(async (req, res) => {
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)

    const [sentToday, queued, failed, optedOut, recentFailures] = await Promise.all([
      EmailLog.countDocuments({ status: 'sent', sentAt: { $gte: startOfDay } }),
      EmailLog.countDocuments({ status: { $in: ['queued', 'sending'] } }),
      EmailLog.countDocuments({ status: 'failed' }),
      User.countDocuments({ emailOptOut: true }),
      EmailLog.find({ status: 'failed' }).sort({ updatedAt: -1 }).limit(10),
    ])

    res.json({
      success: true,
      data: {
        sentToday,
        queued,
        failed,
        optedOut,
        recentFailures,
      },
    })
  }),

  // ==========================================
  // Templates
  // ==========================================
  listTemplates: asyncHandler(async (req, res) => {
    const dbTemplates = await EmailTemplate.find()
    const dbMap = new Map(dbTemplates.map((t) => [t.key, t]))

    const list = Object.values(DEFAULT_TEMPLATES).map((def) => {
      const dbTpl = dbMap.get(def.key)
      if (dbTpl) {
        return {
          key: dbTpl.key,
          name: dbTpl.name,
          category: dbTpl.category,
          subject: dbTpl.subject,
          enabled: dbTpl.enabled,
          isCustomized: true,
          updatedAt: dbTpl.updatedAt,
        }
      }
      return {
        key: def.key,
        name: def.name,
        category: def.category,
        subject: def.subject,
        enabled: true,
        isCustomized: false,
        updatedAt: null,
      }
    })

    res.json({ success: true, data: list })
  }),

  getTemplate: asyncHandler(async (req, res) => {
    const { key } = req.params
    const def = DEFAULT_TEMPLATES[key]
    if (!def) {
      return res.status(404).json({ success: false, message: 'Template not found' })
    }

    const dbTpl = await EmailTemplate.findOne({ key })
    const template = dbTpl ? dbTpl.toObject() : def

    res.json({
      success: true,
      data: {
        ...template,
        requiredVariables: def.requiredVariables || [],
        sampleData: def.sampleData || {},
        isCustomized: !!dbTpl,
      },
    })
  }),

  saveTemplate: asyncHandler(async (req, res) => {
    const { key } = req.params
    const def = DEFAULT_TEMPLATES[key]
    if (!def) {
      return res.status(404).json({ success: false, message: 'Unknown template key' })
    }

    const { subject, preheader, blocks, enabled } = req.body

    // Validation: check that required variables are still present
    const required = def.requiredVariables || []
    const combinedContent = [
      subject || '',
      preheader || '',
      ...(blocks || []).map((b) => `${b.text || ''} ${b.label || ''} ${b.url || ''} ${(b.items || []).map((i) => i.value).join(' ')}`),
    ].join(' ')

    const missing = required.filter((v) => !combinedContent.includes(`{{${v}}}`))
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot save: missing required variable(s): ${missing.map((m) => `{{${m}}}`).join(', ')}`,
      })
    }

    const updated = await EmailTemplate.findOneAndUpdate(
      { key },
      {
        key,
        name: def.name,
        category: def.category,
        subject,
        preheader,
        blocks,
        enabled: enabled !== undefined ? enabled : true,
        updatedBy: req.user?.id,
      },
      { upsert: true, new: true }
    )

    res.json({ success: true, data: updated })
  }),

  resetTemplate: asyncHandler(async (req, res) => {
    const { key } = req.params
    await EmailTemplate.deleteOne({ key })
    const def = DEFAULT_TEMPLATES[key]
    res.json({
      success: true,
      message: 'Template reset to default',
      data: def || null,
    })
  }),

  previewTemplate: asyncHandler(async (req, res) => {
    const { key } = req.params
    const def = DEFAULT_TEMPLATES[key] || {}
    const { subject, preheader, blocks, data } = req.body

    const template = {
      subject: subject || def.subject || '',
      preheader: preheader !== undefined ? preheader : def.preheader || '',
      blocks: blocks || def.blocks || [],
    }

    const settings = await getSettings()
    const mergedData = { ...(def.sampleData || {}), ...(data || {}) }
    const { subject: renderedSubject, html, text } = emailService.renderTemplate(template, mergedData, settings)

    res.json({
      success: true,
      data: { subject: renderedSubject, html, text },
    })
  }),

  testTemplate: asyncHandler(async (req, res) => {
    const adminKey = `test_rate:${req.user?.id || 'admin'}`
    if (!checkRateLimit(adminKey, 10, 60 * 1000)) {
      return res.status(429).json({ success: false, message: 'Too many test requests. Please wait a minute.' })
    }

    const { key } = req.params
    const { to } = req.body
    const targetEmail = to || req.user?.email || env.adminEmail

    const def = DEFAULT_TEMPLATES[key]
    if (!def) {
      return res.status(404).json({ success: false, message: 'Template not found' })
    }

    const result = await emailService.sendTemplate(key, {
      to: targetEmail,
      toName: 'Test Recipient',
      data: def.sampleData || {},
      dedupeKey: `test:${key}:${Date.now()}`,
    })

    res.json({
      success: true,
      message: `Test email queued for ${targetEmail}`,
      result,
    })
  }),

  // ==========================================
  // Logs / Outbox
  // ==========================================
  listLogs: asyncHandler(async (req, res) => {
    const { status, templateKey, search, from, to, page = 1, limit = 20 } = req.query
    const filter = {}

    if (status && status !== 'all') {
      filter.status = status
    }
    if (templateKey && templateKey !== 'all') {
      filter.templateKey = templateKey
    }
    if (search) {
      const q = search.trim()
      filter.$or = [{ to: new RegExp(q, 'i') }, { subject: new RegExp(q, 'i') }]
    }
    if (from || to) {
      filter.createdAt = {}
      if (from) filter.createdAt.$gte = new Date(from)
      if (to) filter.createdAt.$lte = new Date(to)
    }

    const pageNum = Math.max(1, Number(page) || 1)
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 20))

    const [logs, total] = await Promise.all([
      EmailLog.find(filter)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      EmailLog.countDocuments(filter),
    ])

    res.json({
      success: true,
      data: {
        logs,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
      },
    })
  }),

  getLog: asyncHandler(async (req, res) => {
    const log = await EmailLog.findById(req.params.id)
    if (!log) {
      return res.status(404).json({ success: false, message: 'Log not found' })
    }
    res.json({ success: true, data: log })
  }),

  retryLog: asyncHandler(async (req, res) => {
    const log = await EmailLog.findByIdAndUpdate(
      req.params.id,
      {
        status: 'queued',
        attempts: 0,
        nextAttemptAt: new Date(),
        error: '',
      },
      { new: true }
    )
    if (!log) {
      return res.status(404).json({ success: false, message: 'Log not found' })
    }
    res.json({ success: true, message: 'Email re-queued for delivery', data: log })
  }),

  retryAllFailed: asyncHandler(async (req, res) => {
    const result = await EmailLog.updateMany(
      { status: 'failed' },
      {
        status: 'queued',
        attempts: 0,
        nextAttemptAt: new Date(),
        error: '',
      }
    )
    res.json({
      success: true,
      message: `Re-queued ${result.modifiedCount} failed emails`,
      modifiedCount: result.modifiedCount,
    })
  }),

  // ==========================================
  // Broadcast
  // ==========================================
  broadcastCount: asyncHandler(async (req, res) => {
    const { audience = 'all', courseId, weekNumber, studentIds } = req.body

    let count = 0
    if (audience === 'all') {
      count = await User.countDocuments({ role: 'student', emailOptOut: { $ne: true } })
    } else if (audience === 'course' && courseId) {
      const enrollments = await Enrollment.find({ courseId, status: 'Active' })
      const userIds = [...new Set(enrollments.map((e) => e.userId.toString()))]
      count = await User.countDocuments({ _id: { $in: userIds }, emailOptOut: { $ne: true } })
    } else if (audience === 'week' && courseId && weekNumber) {
      const enrollments = await Enrollment.find({ courseId, status: 'Active' })
      const targetWeek = Number(weekNumber)
      const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000
      const matchedUserIds = []
      const now = Date.now()

      for (const e of enrollments) {
        if (e.pausedAt || e.unlockedAll) continue
        const startMs = new Date(e.startsAt).getTime()
        const extraMs = e.extraMs || 0
        const cw = Math.floor((now - startMs - extraMs) / MS_PER_WEEK) + 1
        if (cw === targetWeek) matchedUserIds.push(e.userId)
      }
      count = await User.countDocuments({ _id: { $in: matchedUserIds }, emailOptOut: { $ne: true } })
    } else if (audience === 'selected' && Array.isArray(studentIds)) {
      count = await User.countDocuments({ _id: { $in: studentIds }, emailOptOut: { $ne: true } })
    }

    res.json({ success: true, data: { count } })
  }),

  sendBroadcast: asyncHandler(async (req, res) => {
    const adminKey = `broadcast_rate:${req.user?.id || 'admin'}`
    if (!checkRateLimit(adminKey, 5, 60 * 1000)) {
      return res.status(429).json({ success: false, message: 'Too many broadcast attempts. Please wait.' })
    }

    const { audience = 'all', courseId, weekNumber, studentIds, subject, body, actionLabel, actionUrl } = req.body

    if (!subject || !body) {
      return res.status(400).json({ success: false, message: 'Subject and body are required' })
    }

    // Determine target users
    let users = []
    if (audience === 'all') {
      users = await User.find({ role: 'student', emailOptOut: { $ne: true } }).select('_id name email')
    } else if (audience === 'course' && courseId) {
      const enrollments = await Enrollment.find({ courseId, status: 'Active' })
      const uIds = [...new Set(enrollments.map((e) => e.userId.toString()))]
      users = await User.find({ _id: { $in: uIds }, emailOptOut: { $ne: true } }).select('_id name email')
    } else if (audience === 'week' && courseId && weekNumber) {
      const enrollments = await Enrollment.find({ courseId, status: 'Active' })
      const targetWeek = Number(weekNumber)
      const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000
      const matchedUserIds = []
      const now = Date.now()
      for (const e of enrollments) {
        if (e.pausedAt || e.unlockedAll) continue
        const startMs = new Date(e.startsAt).getTime()
        const extraMs = e.extraMs || 0
        const cw = Math.floor((now - startMs - extraMs) / MS_PER_WEEK) + 1
        if (cw === targetWeek) matchedUserIds.push(e.userId)
      }
      users = await User.find({ _id: { $in: matchedUserIds }, emailOptOut: { $ne: true } }).select('_id name email')
    } else if (audience === 'selected' && Array.isArray(studentIds)) {
      users = await User.find({ _id: { $in: studentIds }, emailOptOut: { $ne: true } }).select('_id name email')
    }

    // Audit record
    const settings = await getSettings()
    settings.broadcastAudit.unshift({
      adminId: req.user?.id,
      adminEmail: req.user?.email,
      audience,
      subject,
      recipientCount: users.length,
      sentAt: new Date(),
    })
    await settings.save()

    // Queue in background in batches of 50 with a 2-second pause
    ;(async () => {
      const batchSize = 50
      for (let i = 0; i < users.length; i += batchSize) {
        const batch = users.slice(i, i + batchSize)
        await Promise.all(
          batch.map((u) =>
            emailService.sendTemplate('broadcast', {
              to: u.email,
              toName: u.name,
              data: {
                name: u.name,
                subject,
                body,
                actionLabel: actionLabel || 'Visit Academy',
                actionUrl: actionUrl || `${env.clientOrigin}/my-courses`,
              },
              dedupeKey: `broadcast:${Date.now()}:${u._id}`,
              userId: u._id,
              isBroadcast: true,
            })
          )
        )
        if (i + batchSize < users.length) {
          await new Promise((resolve) => setTimeout(resolve, 2000))
        }
      }
    })().catch((err) => console.error('[Broadcast Worker Error]:', err))

    res.json({
      success: true,
      message: `Broadcast initiated for ${users.length} recipients`,
      recipientCount: users.length,
    })
  }),

  // ==========================================
  // Settings
  // ==========================================
  getSettings: asyncHandler(async (req, res) => {
    const settings = await getSettings()
    res.json({ success: true, data: settings })
  }),

  updateSettings: asyncHandler(async (req, res) => {
    const settings = await getSettings()
    const allowed = [
      'fromName',
      'fromEmail',
      'replyTo',
      'adminRecipients',
      'logoUrl',
      'footerAddress',
      'supportEmail',
      'whatsappNumber',
      'youtubeUrl',
      'digestHourIST',
      'dailyLimit',
      'perTemplateEnabled',
    ]
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        settings[key] = req.body[key]
      }
    }
    await settings.save()
    res.json({ success: true, message: 'Settings saved', data: settings })
  }),

  testSmtp: asyncHandler(async (req, res) => {
    if (!env.smtpHost) {
      return res.json({
        success: true,
        mock: true,
        message: 'No SMTP_HOST set in environment variables (Running in local Mock mode). Emails are recorded in database logs.',
      })
    }

    try {
      const transporter = nodemailer.createTransport({
        host: env.smtpHost,
        port: env.smtpPort,
        secure: env.smtpSecure,
        auth: env.smtpUser ? { user: env.smtpUser, pass: env.smtpPass } : undefined,
      })
      await transporter.verify()
      res.json({
        success: true,
        message: `SMTP connection to ${env.smtpHost}:${env.smtpPort} verified successfully!`,
      })
    } catch (err) {
      res.status(500).json({
        success: false,
        message: `SMTP verification failed: ${err.message}`,
      })
    }
  }),

  // ==========================================
  // Public Unsubscribe
  // ==========================================
  unsubscribe: asyncHandler(async (req, res) => {
    const { token } = req.query
    if (!token) {
      return res.status(400).send('<h1>Invalid unsubscribe request</h1><p>Missing token.</p>')
    }

    const payload = verifyUnsubscribeToken(token)
    if (!payload) {
      return res.status(400).send('<h1>Invalid or expired link</h1><p>The unsubscribe signature could not be verified.</p>')
    }

    await User.findByIdAndUpdate(payload.userId, { emailOptOut: true })

    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <title>Unsubscribed — Vanakkam Soccer</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #F7F7F5; color: #232321; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
          .card { background: #FFFFFF; border: 1px solid #DEDED8; border-radius: 12px; padding: 40px; max-width: 480px; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
          h1 { color: #0A0A09; font-size: 22px; margin-top: 0; }
          p { color: #52524D; font-size: 15px; line-height: 1.6; }
          a { color: #0B663A; font-weight: 600; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>Unsubscribed Successfully</h1>
          <p>You will no longer receive announcement and promotional emails from Vanakkam Soccer at <strong>${escapeHtml(payload.email)}</strong>.</p>
          <p style="font-size: 13px; color: #70706A;">Note: Important transactional emails regarding course purchases, password resets, and enrolled module updates will still be delivered.</p>
          <p style="margin-top: 24px;"><a href="${env.clientOrigin}">Return to Vanakkam Soccer</a></p>
        </div>
      </body>
      </html>
    `)
  }),
}
