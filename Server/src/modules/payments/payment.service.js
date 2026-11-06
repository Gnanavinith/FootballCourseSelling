import crypto from 'crypto'
import mongoose from 'mongoose'
import { razorpay } from '../../config/razorpay.js'
import { env } from '../../config/env.js'
import { Order } from '../orders/order.model.js'
import { Enrollment } from '../enrollments/enrollment.model.js'
import { Course } from '../courses/course.model.js'
import { User } from '../users/user.model.js'
import { Notification } from '../notifications/notification.model.js'
import { EmailLog } from '../emails/emailLog.model.js'
import { emailService, formatIST, formatINR } from '../emails/email.service.js'
import { couponService } from '../coupons/coupon.service.js'

export const MENTORSHIP_SERVICES = {
  '30m': { id: '30m', label: '1-on-1 Video Review • 30 Min', price: 500 },
  '1h': { id: '1h', label: '1-Hour Tactical Mentorship', price: 1500 },
  '2h': { id: '2h', label: '2-Hour Complete Masterclass', price: 1999 },
}

export const paymentService = {
  async createOrder(userId, payload) {
    const courseId = typeof payload === 'string' ? payload : (payload?.courseId || null)
    const serviceId = typeof payload === 'object' ? (payload?.serviceId || null) : null
    const bookingDetails = typeof payload === 'object' ? payload?.bookingDetails : null

    // Check if this is a mentorship booking session
    const isBooking = Boolean(serviceId && MENTORSHIP_SERVICES[serviceId]) || Boolean(courseId && MENTORSHIP_SERVICES[courseId])

    if (isBooking) {
      const sId = serviceId || courseId
      const service = MENTORSHIP_SERVICES[sId]
      const price = (typeof payload === 'object' && payload?.amount) ? Number(payload.amount) : service.price

      const rpOrder = await razorpay.orders.create({
        amount: Math.round(price * 100),
        currency: 'INR',
        receipt: `bk_${Date.now()}`,
      })

      const order = await Order.create({
        userId: userId || undefined,
        itemType: 'booking',
        serviceId: sId,
        bookingDetails: bookingDetails || {
          serviceName: service.label,
        },
        amount: price,
        currency: 'INR',
        razorpayOrderId: rpOrder.id,
        status: 'Created',
      })

      return {
        orderId: order._id,
        razorpayOrderId: rpOrder.id,
        amount: Math.round(price * 100),
        currency: 'INR',
        keyId: env.razorpayKeyId,
      }
    }

    // Otherwise, this is a course purchase
    if (!userId) {
      throw new Error('Please sign in or create an account to enroll.')
    }
    if (!mongoose.isValidObjectId(courseId)) {
      throw new Error('Invalid course selection.')
    }

    const course = await Course.findById(courseId)
    if (!course || course.status !== 'Published') throw new Error('Course not available')
    const existing = await Enrollment.findOne({ userId, courseId, status: 'Active' })
    if (existing) throw new Error('Already enrolled')

    const couponCode = typeof payload === 'object' ? payload?.couponCode : null
    let finalPrice = course.price
    let discountAmount = 0
    let originalAmount = course.price
    let validatedCoupon = null

    if (couponCode) {
      const val = await couponService.validateCoupon(couponCode, courseId, userId)
      if (val?.valid) {
        discountAmount = val.discountAmount
        finalPrice = val.finalAmount
        validatedCoupon = val.coupon
      }
    }

    // Free enrollment (e.g. 100% coupon or 0 price course)
    if (finalPrice <= 0) {
      const order = await Order.create({
        userId,
        courseId,
        itemType: 'course',
        amount: 0,
        originalAmount,
        discountAmount,
        couponCode: validatedCoupon?.code || (couponCode ? String(couponCode).toUpperCase() : undefined),
        currency: 'INR',
        razorpayOrderId: `free_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        status: 'Paid',
        paidAt: new Date(),
      })

      await Enrollment.create({
        userId,
        courseId,
        orderId: order._id,
        source: 'Free',
        startsAt: new Date(),
        status: 'Active',
      })

      if (validatedCoupon?.code) {
        await couponService.recordUsage(validatedCoupon.code, { userId, orderId: order._id })
      }

      await Notification.create({
        audience: 'admin',
        type: 'new_order',
        title: `Free Enrollment: ${course.title}`,
        body: `Enrolled using coupon ${validatedCoupon?.code || 'Free'}`,
        link: '/admin/orders',
      }).catch(() => {})

      return {
        orderId: order._id,
        isFree: true,
        amount: 0,
        currency: 'INR',
      }
    }

    const rpOrder = await razorpay.orders.create({
      amount: Math.round(finalPrice * 100),
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
    })

    const order = await Order.create({
      userId,
      courseId,
      itemType: 'course',
      amount: finalPrice,
      originalAmount,
      discountAmount,
      couponCode: validatedCoupon?.code || undefined,
      currency: 'INR',
      razorpayOrderId: rpOrder.id,
      status: 'Created',
    })

    return {
      orderId: order._id,
      razorpayOrderId: rpOrder.id,
      amount: Math.round(finalPrice * 100),
      currency: 'INR',
      keyId: env.razorpayKeyId,
    }
  },

  verifySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature) {
    const body = `${razorpayOrderId}|${razorpayPaymentId}`
    const expected = crypto.createHmac('sha256', env.razorpayKeySecret).update(body).digest('hex')
    return expected === razorpaySignature
  },

  verifyWebhookSignature(rawBody, signature) {
    const expected = crypto.createHmac('sha256', env.razorpayWebhookSecret).update(rawBody).digest('hex')
    return expected === signature
  },

  async markPaid(order, razorpayPaymentId, paidAt = new Date()) {
    const updated = await Order.findOneAndUpdate(
      { _id: order._id, status: 'Created' },
      { status: 'Paid', razorpayPaymentId, paidAt },
      { new: true }
    )
    if (!updated) return null // already processed

    // 1. Mentorship Booking Flow
    if (updated.itemType === 'booking') {
      const b = updated.bookingDetails || {}

      await Notification.create({
        audience: 'admin',
        type: 'booking',
        title: `New Mentorship Booking: ${b.name || 'Student'}`,
        body: `${b.serviceName || 'Session'} • ${b.date || ''}, ${b.time || ''} (₹${updated.amount})`,
        link: '/admin/orders',
      }).catch((e) => console.error('[Notification booking error]:', e))

      if (updated.userId) {
        await Notification.create({
          audience: 'student',
          userId: updated.userId,
          type: 'booking_confirmed',
          title: 'Booking Confirmed!',
          body: `Your mentorship appointment for ${b.serviceName || 'Training Session'} on ${b.date || ''} is confirmed.`,
          link: '/dashboard',
        }).catch((e) => console.error('[Notification student error]:', e))
      }

      // Email confirmation to student
      if (b.email) {
        await emailService.sendTemplate('booking_confirmation_user', {
          to: b.email,
          toName: b.name || 'Athlete',
          data: {
            name: b.name || 'Athlete',
            'booking.serviceName': b.serviceName || '1-on-1 Mentorship',
            date: b.date || '',
            time: b.time || '',
            location: 'Online via Google Meet / WhatsApp Video Call',
          },
          dedupeKey: `booking_user:${updated._id}`,
          userId: updated.userId || undefined,
          entityType: 'Booking',
          entityId: updated._id.toString(),
        }).catch((e) => console.error('[Booking user email error]:', e))
      }

      // Email alert to all admin recipients
      const settings = await emailService.getSettings()
      const adminRecipients = (settings.adminRecipients && settings.adminRecipients.length > 0)
        ? settings.adminRecipients
        : [env.adminEmail || 'admin@vanakkamsoccer.com']

      for (const adminTo of adminRecipients) {
        if (!adminTo || !adminTo.includes('@')) continue
        await emailService.sendTemplate('booking_new_admin', {
          to: adminTo.trim(),
          toName: 'Coach Prasanth',
          replyTo: b.email || undefined,
          data: {
            'booking.name': b.name || 'Student',
            'booking.serviceName': b.serviceName || 'Mentorship Session',
            date: b.date || '',
            time: b.time || '',
            phone: b.phone || 'Not given',
            email: b.email || 'Not given',
            message: b.message || 'No additional note',
          },
          dedupeKey: `booking_admin:${updated._id}:${adminTo.trim()}`,
          entityType: 'Booking',
          entityId: updated._id.toString(),
        }).catch((e) => console.error(`[Booking admin email error for ${adminTo}]:`, e))
      }

      return updated
    }

    // 2. Course Purchase Flow
    const course = updated.courseId ? await Course.findById(updated.courseId) : null
    const student = updated.userId ? await User.findById(updated.userId) : null

    // Record coupon usage
    if (updated.couponCode) {
      await couponService.recordUsage(updated.couponCode, {
        userId: updated.userId,
        orderId: updated._id,
      }).catch((e) => console.error('[Record coupon usage error]:', e))
    }

    if (updated.userId && updated.courseId) {
      await Enrollment.create({
        userId: updated.userId,
        courseId: updated.courseId,
        orderId: updated._id,
        source: 'Paid',
        startsAt: paidAt,
        status: 'Active',
      })
    }

    await Notification.create({
      audience: 'admin',
      type: 'new_order',
      title: `New order: ${student?.name || 'Student'} bought ${course?.title || 'Course'}`,
      body: `Amount ₹${updated.amount}`,
      link: '/admin/orders',
    })
    if (updated.userId) {
      await Notification.create({
        audience: 'student',
        userId: updated.userId,
        type: 'payment_confirmed',
        title: 'Payment confirmed',
        body: `You are enrolled in ${course?.title}`,
        link: '/my-courses',
      })
    }

    // Send professional payment_receipt email once (dedupeKey receipt:{orderId})
    if (student?.email) {
      await emailService.sendTemplate('payment_receipt', {
        to: student.email,
        toName: student.name,
        data: {
          name: student.name || 'Athlete',
          'course.title': course?.title || 'Masterclass Course',
          orderId: updated.razorpayOrderId || updated._id.toString(),
          paymentId: razorpayPaymentId || 'N/A',
          amount: formatINR(updated.amount),
          date: formatIST(paidAt),
          startUrl: `${env.clientOrigin}/watch/${course?._id}`,
        },
        dedupeKey: `receipt:${updated._id}`,
        userId: updated.userId,
        entityType: 'Order',
        entityId: updated._id.toString(),
      })
    }

    return updated
  },

  async handleVerify(userId, body = {}) {
    const razorpay_order_id = body.razorpay_order_id || body.razorpayOrderId
    const razorpay_payment_id = body.razorpay_payment_id || body.razorpayPaymentId
    const razorpay_signature = body.razorpay_signature || body.razorpaySignature

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new Error('Payment details are missing.')
    }
    if (!this.verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
      throw new Error('Invalid signature')
    }
    const order = await Order.findOne({ razorpayOrderId: razorpay_order_id })
    if (!order) throw new Error('Order not found')
    if (order.userId && userId && order.userId.toString() !== userId) throw new Error('Forbidden')
    if (order.status === 'Paid') return order
    if (order.status !== 'Created') throw new Error('Order not payable')

    return this.markPaid(order, razorpay_payment_id)
  },

  async handleWebhook(rawBody, signature, event) {
    let isValid = false
    try {
      isValid = this.verifyWebhookSignature(rawBody, signature)
    } catch {}

    if (!isValid) {
      // Alert admin of webhook signature failure
      await emailService.sendTemplate('admin_alert', {
        to: env.adminEmail,
        data: {
          'alert.title': 'Razorpay Webhook Signature Mismatch',
          'alert.details': 'Received webhook request with invalid signature.',
          timestamp: formatIST(new Date()),
        },
        dedupeKey: `alert:webhook_sig:${Date.now()}`,
      })
      throw new Error('Invalid webhook signature')
    }

    const payload = JSON.parse(rawBody.toString())
    const eventName = payload.event

    if (eventName === 'payment.captured') {
      const rp = payload.payload?.payment?.entity
      const order = await Order.findOne({ razorpayOrderId: rp?.order_id })
      if (order && order.status === 'Created') {
        await this.markPaid(order, rp.id, new Date(rp.created_at * 1000))
      }
    } else if (eventName === 'payment.failed') {
      const rp = payload.payload?.payment?.entity
      const order = await Order.findOne({ razorpayOrderId: rp?.order_id })
      if (order && order.status === 'Created') {
        await Order.findByIdAndUpdate(order._id, { status: 'Failed' })
        const course = order.courseId ? await Course.findById(order.courseId) : null
        const student = order.userId ? await User.findById(order.userId) : null

        await Notification.create({
          audience: 'admin',
          type: 'payment_failed',
          title: 'Payment failed',
          body: `Order ${order._id}`,
          link: '/admin/orders',
        })

        if (student?.email) {
          await emailService.sendTemplate('payment_failed', {
            to: student.email,
            toName: student.name,
            data: {
              name: student.name || 'Athlete',
              'course.title': course?.title || 'Masterclass',
              retryUrl: `${env.clientOrigin}/courses/${order.courseId}`,
            },
            userId: order.userId,
            entityType: 'Order',
            entityId: order._id.toString(),
          })
        }
      }
    } else if (eventName === 'refund.processed') {
      const rp = payload.payload?.refund?.entity
      const paymentId = rp?.payment_id
      const order = await Order.findOne({ razorpayPaymentId: paymentId })
      if (order && order.status === 'Paid') {
        await Order.findByIdAndUpdate(order._id, { status: 'Refunded', refundedAt: new Date() })
        if (order.courseId) await Enrollment.findOneAndUpdate({ orderId: order._id }, { status: 'Refunded' })
        const course = order.courseId ? await Course.findById(order.courseId) : null
        const student = order.userId ? await User.findById(order.userId) : null

        await Notification.create({
          audience: 'student',
          userId: order.userId,
          type: 'refund',
          title: 'Refund processed',
          body: 'Access ended',
          link: '/payments',
        })

        if (student?.email) {
          await emailService.sendTemplate('refund_processed', {
            to: student.email,
            toName: student.name,
            data: {
              name: student.name || 'Athlete',
              'course.title': course?.title || 'Masterclass',
              amount: formatINR(order.amount),
              refundId: rp?.id || 'Refund-Processed',
            },
            userId: order.userId,
            entityType: 'Order',
            entityId: order._id.toString(),
          })
        }
      }
    }
    return { received: true }
  },
}
