import { AppError } from '../../utils/AppError.js'
import { PaymentRequest } from './paymentRequest.model.js'
import { Course } from '../courses/course.model.js'
import { Enrollment } from '../enrollments/enrollment.model.js'
import { User } from '../users/user.model.js'
import { Notification } from '../notifications/notification.model.js'
import { AuditLog } from '../audit/auditLog.model.js'
import { uploadImageBuffer } from '../../config/cloudinary.js'
import { emailService, formatINR } from '../emails/email.service.js'
import { env } from '../../config/env.js'

const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000

async function audit(adminId, action, targetType, targetId, details) {
  await AuditLog.create({ adminId, action, targetType, targetId, details })
}

export const paymentRequestService = {
  async create({
    userId,
    targetUserId,
    actingUserRole,
    courseId,
    amount,
    method,
    reference,
    paidOn,
    payerName,
    mobile,
    note,
    screenshotUrl,
  }) {
    /* Admin can submit on behalf of a student; otherwise the request is for the signed-in user */
    const isAdmin = actingUserRole === 'superadmin' || actingUserRole === 'admin'
    const finalUserId = isAdmin && targetUserId ? targetUserId : userId

    if (isAdmin && targetUserId) {
      const student = await User.findById(targetUserId)
      if (!student || student.role !== 'student') throw new AppError('Student not found', 404)
    }

    const course = await Course.findById(courseId)
    if (!course) throw new AppError('Course not found', 404)

    const numAmount = Number(amount)
    if (!numAmount || numAmount <= 0) throw new AppError('Enter a valid amount.', 400)

    const pr = await PaymentRequest.create({
      userId: finalUserId,
      courseId,
      amount: numAmount,
      method,
      reference: reference || '',
      paidOn: new Date(paidOn),
      payerName: payerName || '',
      mobile: mobile || '',
      note: note || '',
      screenshotUrl: screenshotUrl || '',
      status: 'Pending',
    })

    await pr.populate('courseId', 'title price')

    // In-app notification for admin panel
    Notification.create({
      audience: 'admin',
      type: 'payment_request',
      title: `Payment request: ₹${numAmount} (${course?.title || 'Course'})`,
      body: `From ${payerName || 'Student'} via ${method}. Ref: ${reference || 'None'}`,
      link: '/admin/payments',
    }).catch((err) => console.error('[PaymentRequestService] Admin notif error:', err))

    return pr
  },

  async listMine(userId) {
    return PaymentRequest.find({ userId })
      .populate('courseId', 'title price')
      .sort({ createdAt: -1 })
  },

  async listAll({ page = 1, limit = 100, status } = {}) {
    const filter = {}
    if (status) filter.status = status
    return PaymentRequest.find(filter)
      .populate('userId', 'name email')
      .populate('courseId', 'title price')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
  },

  async approve(id, startWeek, adminId) {
    const pr = await PaymentRequest.findById(id)
    if (!pr) throw new AppError('Payment request not found', 404)
    if (pr.status !== 'Pending') throw new AppError('This request has already been processed.', 400)

    const existing = await Enrollment.findOne({ userId: pr.userId, courseId: pr.courseId })
    if (existing) throw new AppError('Student is already enrolled in this course.', 400)

    const course = await Course.findById(pr.courseId)
    if (!course) throw new AppError('Course not found', 404)

    const week = Math.max(1, Number(startWeek) || 1)
    const startsAt = new Date(Date.now() - (week - 1) * MS_PER_WEEK)

    const enrollment = await Enrollment.create({
      userId: pr.userId,
      courseId: pr.courseId,
      source: 'Manual',
      startsAt,
      status: 'Active',
    })

    pr.status = 'Approved'
    pr.approvedAt = new Date()
    pr.reviewedBy = adminId
    pr.enrollmentId = enrollment._id
    await pr.save()

    await audit(adminId, 'approve_payment', 'PaymentRequest', id, { startWeek: week, enrollmentId: enrollment._id })
    await Notification.create({
      audience: 'student',
      userId: pr.userId,
      type: 'enrollment',
      title: 'Payment approved',
      body: `Your payment for ${course.title} was approved. Videos unlocked from Week ${week}.`,
      link: '/my-courses',
    })

    const student = await User.findById(pr.userId)
    if (student?.email) {
      await emailService.sendTemplate('manual_payment_receipt', {
        to: student.email,
        toName: student.name,
        data: {
          name: student.name || 'Athlete',
          'course.title': course.title,
          amount: formatINR(pr.amount || course.price),
          referenceId: pr.referenceNumber || pr.utrNumber || pr._id.toString(),
          startWeek: String(week),
          startUrl: `${env.clientOrigin}/watch/${course._id}`,
        },
        dedupeKey: `manual-receipt:${pr._id}`,
        userId: student._id,
        entityType: 'Enrollment',
        entityId: enrollment._id.toString(),
      })
    }

    return { enrollment, paymentRequest: pr }
  },

  async reject(id, reviewNote, adminId) {
    const pr = await PaymentRequest.findById(id)
    if (!pr) throw new AppError('Payment request not found', 404)
    if (pr.status !== 'Pending') throw new AppError('This request has already been processed.', 400)

    pr.status = 'Rejected'
    pr.reviewNote = reviewNote || ''
    pr.rejectedAt = new Date()
    pr.reviewedBy = adminId
    await pr.save()

    await audit(adminId, 'reject_payment', 'PaymentRequest', id, { reviewNote })
    await Notification.create({
      audience: 'student',
      userId: pr.userId,
      type: 'payment_rejected',
      title: 'Payment rejected',
      body: reviewNote || 'Your payment request was rejected.',
    })

    return pr
  },
}
