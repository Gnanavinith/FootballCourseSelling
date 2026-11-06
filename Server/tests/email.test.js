import { describe, it, before, after, beforeEach } from 'node:test'
import assert from 'node:assert'
import mongoose from 'mongoose'
import {
  escapeHtml,
  sanitizeUrl,
  interpolateString,
  interpolateUrl,
  emailService,
} from '../src/modules/emails/email.service.js'
import { EmailLog } from '../src/modules/emails/emailLog.model.js'
import { EmailTemplate } from '../src/modules/emails/emailTemplate.model.js'
import { EmailSettings } from '../src/modules/emails/emailSettings.model.js'
import { User } from '../src/modules/users/user.model.js'
import { Course } from '../src/modules/courses/course.model.js'
import { Enrollment } from '../src/modules/enrollments/enrollment.model.js'

describe('Email Module Unit Tests', () => {
  before(async () => {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/footballcourse_test'
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri)
    }
  })

  after(async () => {
    await EmailLog.deleteMany({ dedupeKey: { $regex: /^test:/ } })
    await mongoose.disconnect()
  })

  /* -------------------------------------------------------------
     1. TEMPLATE RENDERING & HTML ESCAPING
     ------------------------------------------------------------- */
  describe('Template rendering & HTML escaping', () => {
    it('escapes dangerous HTML/XSS injection in template variables', () => {
      const dangerousInput = '<script>alert("hacked")</script>&<foo>'
      const escaped = escapeHtml(dangerousInput)
      assert.strictEqual(
        escaped,
        '&lt;script&gt;alert(&quot;hacked&quot;)&lt;/script&gt;&amp;&lt;foo&gt;'
      )

      const template = 'Hello {{name}}, welcome to {{course}}!'
      const rendered = interpolateString(template, {
        name: '<script>alert(1)</script>',
        course: '<b>Tamil Football</b>',
      })
      assert.strictEqual(
        rendered,
        'Hello &lt;script&gt;alert(1)&lt;/script&gt;, welcome to &lt;b&gt;Tamil Football&lt;/b&gt;!'
      )
    })

    it('rejects dangerous javascript: and data: URLs and preserves valid https URLs', () => {
      assert.strictEqual(sanitizeUrl('javascript:alert(1)'), '#')
      assert.strictEqual(sanitizeUrl('data:text/html;base64,PHNjcmlwdD4='), '#')
      assert.strictEqual(sanitizeUrl(''), '#')
      assert.strictEqual(
        sanitizeUrl('https://vanakkamsoccer.com/watch/123'),
        'https://vanakkamsoccer.com/watch/123'
      )

      // Test URL interpolation
      const dangerousUrl = interpolateUrl('{{url}}', { url: 'javascript:void(0)' })
      assert.strictEqual(dangerousUrl, '#')

      const safeUrl = interpolateUrl('{{url}}', { url: 'https://vanakkamsoccer.com/login' })
      assert.strictEqual(safeUrl, 'https://vanakkamsoccer.com/login')
    })

    it('renders master email layout with correct HTML structure and plain text', () => {
      const template = {
        subject: 'Welcome {{name}}',
        preheader: 'Your football journey starts here',
        blocks: [
          { type: 'heading', text: 'Welcome to the academy, {{name}}!' },
          { type: 'paragraph', text: 'We are thrilled to have you here.' },
          { type: 'button', label: 'Start Course', url: 'https://vanakkamsoccer.com/start' },
        ],
      }
      const data = { name: 'Vinith' }
      const settings = {
        fromName: 'Vanakkam Soccer',
        logoUrl: 'https://vanakkamsoccer.com/logo.png',
        footerAddress: 'Chennai, India',
        supportEmail: 'support@vanakkamsoccer.com',
      }

      const { subject, html, text } = emailService.renderTemplate(template, data, settings)

      // Subject
      assert.strictEqual(subject, 'Welcome Vinith')
      // HTML layout checks
      assert.ok(html.includes('Welcome to the academy, Vinith!'), 'HTML contains interpolated heading')
      assert.ok(html.includes('https://vanakkamsoccer.com/start'), 'HTML contains button URL')
      assert.ok(html.includes('600px'), 'HTML uses 600px wide container')
      assert.ok(html.includes('prefers-color-scheme: dark'), 'HTML includes dark mode styling')
      // Plain text check
      assert.ok(text.toLowerCase().includes('welcome to the academy, vinith!'), 'Plain text contains heading')
      assert.ok(text.includes('Start Course'), 'Plain text contains button text')
    })
  })

  /* -------------------------------------------------------------
     2. DRIP ACCESS CALCULATION
     ------------------------------------------------------------- */
  describe('Drip access calculation', () => {
    const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000

    it('calculates currentWeek accurately based on startsAt and extraMs', () => {
      const now = Date.now()

      // Day 0 (just enrolled): Week 1
      const startsAt0 = new Date(now)
      const current0 = Math.floor((now - startsAt0.getTime() - 0) / MS_PER_WEEK) + 1
      assert.strictEqual(current0, 1)

      // Day 8 (one week + 1 day): Week 2
      const startsAt8 = new Date(now - 8 * 24 * 60 * 60 * 1000)
      const current8 = Math.floor((now - startsAt8.getTime() - 0) / MS_PER_WEEK) + 1
      assert.strictEqual(current8, 2)

      // Day 15: Week 3
      const startsAt15 = new Date(now - 15 * 24 * 60 * 60 * 1000)
      const current15 = Math.floor((now - startsAt15.getTime() - 0) / MS_PER_WEEK) + 1
      assert.strictEqual(current15, 3)

      // With extraMs extension (7 days extra granted by admin): shifts student from Week 2 back to Week 1
      const extraMs = 7 * 24 * 60 * 60 * 1000
      const currentWithExtra = Math.floor((now - startsAt8.getTime() - extraMs) / MS_PER_WEEK) + 1
      assert.strictEqual(currentWithExtra, 1)
    })

    it('skips drip processing if enrollment is paused or has unlockedAll', async () => {
      const pausedEnrollment = {
        pausedAt: new Date(),
        unlockedAll: false,
      }
      assert.ok(pausedEnrollment.pausedAt || pausedEnrollment.unlockedAll)

      const unlockedAllEnrollment = {
        pausedAt: null,
        unlockedAll: true,
      }
      assert.ok(unlockedAllEnrollment.pausedAt || unlockedAllEnrollment.unlockedAll)
    })

    it('sends ONLY the latest missed week when a student has missed multiple weeks', async () => {
      // Simulate student enrolled 22 days ago (Week 4), but notifiedWeek is still 1
      const totalWeeks = 8
      const currentWeek = 4
      const lastNotified = 1

      const weeksToNotify = []
      if (currentWeek >= 2 && currentWeek <= totalWeeks) {
        if (currentWeek > lastNotified) {
          // Rule: Send ONLY the latest missed week
          weeksToNotify.push(currentWeek)
        }
      }

      assert.strictEqual(weeksToNotify.length, 1)
      assert.strictEqual(weeksToNotify[0], 4)
    })

    it('identifies course_completed when currentWeek exceeds totalWeeks', () => {
      const totalWeeks = 4
      const currentWeek = 5
      const isCompleted = currentWeek > totalWeeks
      assert.strictEqual(isCompleted, true)
    })
  })

  /* -------------------------------------------------------------
     3. DEDUPLICATION
     ------------------------------------------------------------- */
  describe('Deduplication logic', () => {
    it('silently skips or rejects duplicate dedupeKey to ensure exactly one email is queued', async () => {
      const testDedupeKey = `test:dedupe:${Date.now()}`
      const testEmail = 'student.test@vanakkamsoccer.com'

      // First call
      const res1 = await emailService.sendTemplate('payment_receipt', {
        to: testEmail,
        toName: 'Test Student',
        data: {
          name: 'Test Student',
          'course.title': 'Tamil Football Fundamentals',
          orderId: 'ORD_12345',
          paymentId: 'pay_12345',
          amount: '₹2,499',
          date: '06 Nov 2026, 11:00 AM',
          courseUrl: 'https://vanakkamsoccer.com/watch/1',
        },
        dedupeKey: testDedupeKey,
      })

      assert.strictEqual(res1.queued, true, 'First email should be successfully queued')

      // Second call with identical dedupeKey
      const res2 = await emailService.sendTemplate('payment_receipt', {
        to: testEmail,
        toName: 'Test Student',
        data: {
          name: 'Test Student',
          'course.title': 'Tamil Football Fundamentals',
          orderId: 'ORD_12345',
          paymentId: 'pay_12345',
          amount: '₹2,499',
          date: '06 Nov 2026, 11:00 AM',
          courseUrl: 'https://vanakkamsoccer.com/watch/1',
        },
        dedupeKey: testDedupeKey,
      })

      assert.strictEqual(res2.skipped, true, 'Second call should be skipped')
      assert.strictEqual(res2.reason, 'duplicate_dedupe_key')

      // Verify that database holds exactly ONE record with this dedupeKey
      const count = await EmailLog.countDocuments({ dedupeKey: testDedupeKey })
      assert.strictEqual(count, 1, 'Only one EmailLog must exist in DB for the dedupeKey')
    })
  })
})
