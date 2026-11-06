import { User } from '../users/user.model.js'
import { Course } from '../courses/course.model.js'
import { Enrollment } from '../enrollments/enrollment.model.js'
import { Order } from '../orders/order.model.js'
import { Enquiry } from '../enquiries/enquiry.model.js'
import { Notification } from '../notifications/notification.model.js'
import { AuditLog } from '../audit/auditLog.model.js'
import bcrypt from 'bcryptjs'
import { currentWeek, nextUnlockAt } from '../enrollments/access.service.js'
import { emailService } from '../emails/email.service.js'
import { env } from '../../config/env.js'

async function audit(adminId, action, targetType, targetId, details) {
  await AuditLog.create({ adminId, action, targetType, targetId, details })
}

export const adminService = {
  async dashboard() {
    const totalStudents = await User.countDocuments({ role: 'student' })
    const totalRevenueAgg = await Order.aggregate([{ $match: { status: 'Paid' } }, { $group: { _id: null, total: { $sum: '$amount' } } }])
    const totalRevenue = totalRevenueAgg[0]?.total || 0
    const startOfMonth = new Date(); startOfMonth.setDate(1); startOfMonth.setHours(0,0,0,0)
    const ordersThisMonth = await Order.countDocuments({ status: 'Paid', createdAt: { $gte: startOfMonth } })
    const latestOrders = await Order.find().sort({ createdAt: -1 }).limit(10).populate('userId courseId')
    const latestEnquiries = await Enquiry.find().sort({ createdAt: -1 }).limit(10)
    const newStudents = await User.find({ role: 'student', createdAt: { $gte: new Date(Date.now() - 7*24*60*60*1000) } }).limit(10)
    return { totalStudents, totalRevenue, ordersThisMonth, latestOrders, latestEnquiries, newStudents }
  },

  async listStudents({ search, course, status, joined, page = 1, limit = 20 }) {
    const filter = { role: 'student' }
    if (search) filter.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }]
    if (status) filter.isActive = status === 'active'
    const students = await User.find(filter)
      .populate({ path: 'enrollments', populate: { path: 'courseId', select: 'title totalWeeks' } })
      .skip((page-1)*limit).limit(limit).sort({ createdAt: -1 })
    return students
  },

  async getStudent(id) {
    const student = await User.findById(id)
    if (!student) throw new Error('Student not found')
    const enrollments = await Enrollment.find({ userId: id }).populate('courseId orderId')
    const withWeeks = enrollments.map((e) => {
      const course = e.courseId
      if (course) e.totalWeeks = course.totalWeeks
      return { ...e.toObject(), currentWeek: course ? currentWeek(e) : null, nextUnlockAt: course ? nextUnlockAt(e) : null }
    })
    return { student, enrollments: withWeeks }
  },

  async createStudent(data, adminId) {
    const hash = await User.hashPassword(data.password || 'Temp@1234')
    const user = await User.create({ name: data.name, email: data.email, mobile: data.mobile, passwordHash: hash, role: 'student', isActive: true })
    await audit(adminId, 'create_student', 'User', user._id.toString(), data)
    return user
  },

  async updateStudent(id, data, adminId) {
    const user = await User.findByIdAndUpdate(id, data, { new: true })
    await audit(adminId, 'update_student', 'User', id, data)
    return user
  },

  async deleteStudent(id, adminId) {
    // anonymise
    await User.findByIdAndUpdate(id, { name: 'Deleted User', email: `deleted-${id}@example.com`, isActive: false })
    await audit(adminId, 'delete_student', 'User', id, {})
    return { anonymised: true }
  },

  async setStudentStatus(id, isActive, adminId) {
    const user = await User.findByIdAndUpdate(id, { isActive }, { new: true })
    await audit(adminId, 'toggle_student_status', 'User', id, { isActive })
    await Notification.create({ audience: 'student', userId: id, type: 'access_changed', title: isActive ? 'Account enabled' : 'Account disabled', body: '' })
    return user
  },

  async resetPassword(id, adminId) {
    const token = Math.random().toString(36).slice(2)
    await audit(adminId, 'reset_password', 'User', id, {})
    return { token, expiresIn: 1800 }
  },

  async manualEnroll(userId, courseId, adminId) {
    const existing = await Enrollment.findOne({ userId, courseId })
    if (existing) throw new Error('Already enrolled')
    const enrollment = await Enrollment.create({ userId, courseId, source: 'Manual', startsAt: new Date(), status: 'Active' })
    await audit(adminId, 'manual_enroll', 'Enrollment', enrollment._id.toString(), { userId, courseId })
    await Notification.create({ audience: 'student', userId, type: 'enrollment', title: 'Enrolled', body: '', link: '/my-courses' })

    const student = await User.findById(userId)
    const course = await Course.findById(courseId)
    if (student?.email && course) {
      emailService
        .sendTemplate('manual_enrollment', {
          to: student.email,
          toName: student.name,
          data: {
            name: student.name || 'Athlete',
            'course.title': course.title,
            startUrl: `${env.clientOrigin}/my-courses`,
          },
          userId: student._id,
          entityType: 'Enrollment',
          entityId: enrollment._id.toString(),
        })
        .catch(console.error)
    }

    return enrollment
  },

  async extendEnrollment(id, days, adminId) {
    const e = await Enrollment.findById(id)
    if (!e) throw new Error('Enrollment not found')
    e.extraMs = (e.extraMs || 0) + days * 24 * 60 * 60 * 1000
    await e.save()
    await audit(adminId, 'extend_enrollment', 'Enrollment', id, { days })
    await Notification.create({ audience: 'student', userId: e.userId, type: 'schedule_changed', title: 'Schedule extended', body: `Extended by ${days} days` })

    const student = await User.findById(e.userId)
    const course = await Course.findById(e.courseId)
    if (student?.email && course) {
      emailService
        .sendTemplate('schedule_changed', {
          to: student.email,
          toName: student.name,
          data: {
            name: student.name || 'Athlete',
            'course.title': course.title,
            changeDetails: `Your course schedule has been extended by ${days} day(s).`,
            dashboardUrl: `${env.clientOrigin}/dashboard`,
          },
          userId: student._id,
          entityType: 'Enrollment',
          entityId: e._id.toString(),
        })
        .catch(console.error)
    }

    return e
  },

  async jumpEnrollment(id, week, adminId) {
    const e = await Enrollment.findById(id)
    if (!e) throw new Error('Enrollment not found')
    const course = await Course.findById(e.courseId)
    e.startsAt = new Date(Date.now() - (week - 1) * 7 * 24 * 60 * 60 * 1000)
    e.extraMs = 0
    e.pausedAt = undefined
    await e.save()
    await audit(adminId, 'jump_enrollment', 'Enrollment', id, { week })
    await Notification.create({ audience: 'student', userId: e.userId, type: 'schedule_changed', title: `Moved to Week ${week}`, body: '' })

    const student = await User.findById(e.userId)
    if (student?.email && course) {
      emailService
        .sendTemplate('schedule_changed', {
          to: student.email,
          toName: student.name,
          data: {
            name: student.name || 'Athlete',
            'course.title': course.title,
            changeDetails: `Your training has been updated to Week ${week}.`,
            dashboardUrl: `${env.clientOrigin}/watch/${course._id}`,
          },
          userId: student._id,
          entityType: 'Enrollment',
          entityId: e._id.toString(),
        })
        .catch(console.error)
    }

    return e
  },

  async unlockAll(id, adminId) {
    const e = await Enrollment.findByIdAndUpdate(id, { unlockedAll: true }, { new: true })
    await audit(adminId, 'unlock_all', 'Enrollment', id, {})
    await Notification.create({ audience: 'student', userId: e.userId, type: 'all_unlocked', title: 'All weeks unlocked', body: '' })
    return e
  },

  async pauseEnrollment(id, adminId) {
    const e = await Enrollment.findById(id)
    if (!e) throw new Error('Enrollment not found')
    if (!e.pausedAt) e.pausedAt = new Date()
    await e.save()
    await audit(adminId, 'pause_enrollment', 'Enrollment', id, {})

    const student = await User.findById(e.userId)
    const course = await Course.findById(e.courseId)
    if (student?.email && course) {
      emailService
        .sendTemplate('schedule_changed', {
          to: student.email,
          toName: student.name,
          data: {
            name: student.name || 'Athlete',
            'course.title': course.title,
            changeDetails: `Your course has been temporarily paused. Your weekly unlock timer will resume when unpaused.`,
            dashboardUrl: `${env.clientOrigin}/dashboard`,
          },
          userId: student._id,
          entityType: 'Enrollment',
          entityId: e._id.toString(),
        })
        .catch(console.error)
    }

    return e
  },

  async resumeEnrollment(id, adminId) {
    const e = await Enrollment.findById(id)
    if (!e) throw new Error('Enrollment not found')
    if (e.pausedAt) {
      e.extraMs = (e.extraMs || 0) + (Date.now() - new Date(e.pausedAt).getTime())
      e.pausedAt = undefined
      await e.save()
    }
    await audit(adminId, 'resume_enrollment', 'Enrollment', id, {})
    return e
  },

  async listOrders({ search, status, course, from, to, page = 1, limit = 20 }) {
    const filter = {}
    if (status) filter.status = status
    if (course) filter.courseId = course
    if (from || to) filter.createdAt = {}
    if (from) filter.createdAt.$gte = new Date(from)
    if (to) filter.createdAt.$lte = new Date(to)
    return Order.find(filter).populate('userId courseId').skip((page-1)*limit).limit(limit).sort({ createdAt: -1 })
  },

  async refundOrder(id, adminId) {
    const order = await Order.findByIdAndUpdate(id, { status: 'Refunded', refundedAt: new Date(), refundedBy: adminId }, { new: true })
    if (!order) throw new Error('Order not found')
    await Enrollment.findOneAndUpdate({ orderId: id }, { status: 'Refunded' })
    await audit(adminId, 'refund_order', 'Order', id, {})
    const student = await User.findById(order.userId)
    await Notification.create({ audience: 'student', userId: order.userId, type: 'refund', title: 'Refund processed', body: 'Access ended' })
    return order
  },

  async ordersSummary(by) {
    return Order.aggregate([{ $match: { status: 'Paid' } }, { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }])
  },

  async listNotifications({ page = 1, limit = 20, status, type, search, paginated }) {
    const { Notification } = await import('../notifications/notification.model.js')
    const filter = { audience: 'admin' }
    if (status === 'unread') filter.readAt = null
    else if (status === 'read') filter.readAt = { $ne: null }
    if (type && type !== 'all') filter.type = type
    if (search && search.trim()) {
      filter.$or = [
        { title: new RegExp(search.trim(), 'i') },
        { body: new RegExp(search.trim(), 'i') },
      ]
    }
    const total = await Notification.countDocuments(filter)
    const unreadCount = await Notification.countDocuments({ audience: 'admin', readAt: null })
    const items = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))

    if (paginated === 'true' || paginated === true) {
      return { items, total, page: Number(page), limit: Number(limit), unreadCount }
    }
    return items
  },
  async unreadNotificationCount() {
    const { Notification } = await import('../notifications/notification.model.js')
    return Notification.countDocuments({ audience: 'admin', readAt: null })
  },
  async markNotificationRead(id) {
    const { Notification } = await import('../notifications/notification.model.js')
    return Notification.findByIdAndUpdate(id, { readAt: new Date() }, { new: true })
  },
  async markNotificationUnread(id) {
    const { Notification } = await import('../notifications/notification.model.js')
    return Notification.findByIdAndUpdate(id, { readAt: null }, { new: true })
  },
  async markAllNotificationsRead() {
    const { Notification } = await import('../notifications/notification.model.js')
    await Notification.updateMany({ audience: 'admin', readAt: null }, { readAt: new Date() })
    return { ok: true }
  },
  async deleteNotification(id) {
    const { Notification } = await import('../notifications/notification.model.js')
    return Notification.findByIdAndDelete(id)
  },
  async clearReadNotifications() {
    const { Notification } = await import('../notifications/notification.model.js')
    await Notification.deleteMany({ audience: 'admin', readAt: { $ne: null } })
    return { ok: true }
  },

  async listEnquiries({ status, source, search, page = 1, limit = 20 }) {
    const filter = {}
    if (status) filter.status = status
    if (source) filter.source = source
    if (search) filter.$or = [{ name: new RegExp(search, 'i') }, { subject: new RegExp(search, 'i') }]
    return Enquiry.find(filter).skip((page-1)*limit).limit(limit).sort({ createdAt: -1 })
  },

  async updateEnquiry(id, data, adminId) {
    const e = await Enquiry.findByIdAndUpdate(id, data, { new: true })
    await audit(adminId, 'update_enquiry', 'Enquiry', id, data)
    return e
  },

  async deleteEnquiry(id, adminId) {
    await Enquiry.findByIdAndDelete(id)
    await audit(adminId, 'delete_enquiry', 'Enquiry', id, {})
    return { deleted: true }
  },

  /* ------------------------------------------------------------------ */
  /* 1-on-1 Sessions                                                    */
  /* ------------------------------------------------------------------ */
  async listSessions({ search, status, paymentStatus, from, to, page = 1, limit = 50 } = {}) {
    const filter = { itemType: 'booking' }

    if (paymentStatus && paymentStatus !== 'All') {
      filter.status = paymentStatus
    }

    if (status && status !== 'All') {
      filter['bookingDetails.status'] = status
    }

    if (search && search.trim()) {
      const q = search.trim()
      const regex = new RegExp(q, 'i')
      filter.$or = [
        { 'bookingDetails.name': regex },
        { 'bookingDetails.email': regex },
        { 'bookingDetails.phone': regex },
        { 'bookingDetails.serviceName': regex },
        { razorpayPaymentId: regex },
        { razorpayOrderId: regex },
      ]
    }

    if (from || to) {
      filter.createdAt = {}
      if (from) filter.createdAt.$gte = new Date(from)
      if (to) filter.createdAt.$lte = new Date(to)
    }

    const p = Math.max(1, Number(page) || 1)
    const l = Math.max(1, Number(limit) || 50)

    const [sessions, total, allSessions] = await Promise.all([
      Order.find(filter)
        .populate('userId', 'name email phone avatar')
        .sort({ createdAt: -1 })
        .skip((p - 1) * l)
        .limit(l),
      Order.countDocuments(filter),
      Order.find({ itemType: 'booking' }).select('amount status bookingDetails createdAt'),
    ])

    // Calculate overall metrics
    const summary = {
      totalBookings: allSessions.length,
      paidBookings: allSessions.filter((s) => s.status === 'Paid').length,
      totalRevenue: allSessions
        .filter((s) => s.status === 'Paid')
        .reduce((sum, s) => sum + Number(s.amount || 0), 0),
      scheduledCount: allSessions.filter((s) => (s.bookingDetails?.status || 'Scheduled') === 'Scheduled').length,
      completedCount: allSessions.filter((s) => s.bookingDetails?.status === 'Completed').length,
      cancelledCount: allSessions.filter((s) => s.bookingDetails?.status === 'Cancelled').length,
    }

    return {
      sessions,
      total,
      page: p,
      limit: l,
      totalPages: Math.ceil(total / l) || 1,
      summary,
    }
  },

  async getSession(id) {
    const session = await Order.findOne({ _id: id, itemType: 'booking' }).populate('userId', 'name email phone avatar')
    if (!session) throw new Error('1-on-1 session not found')
    return session
  },

  async updateSession(id, data, adminId) {
    const session = await Order.findOne({ _id: id, itemType: 'booking' })
    if (!session) throw new Error('1-on-1 session not found')

    const currentDetails = session.bookingDetails || {}
    const newDetails = { ...currentDetails }

    if (data.status) {
      newDetails.status = data.status
      if (data.status === 'Completed') newDetails.completedAt = new Date()
      if (data.status === 'Cancelled') newDetails.cancelledAt = new Date()
    }
    if (data.meetingLink !== undefined) newDetails.meetingLink = String(data.meetingLink).trim()
    if (data.coachNotes !== undefined) newDetails.coachNotes = String(data.coachNotes).trim()
    if (data.date) newDetails.date = String(data.date).trim()
    if (data.time) newDetails.time = String(data.time).trim()

    session.bookingDetails = newDetails
    await session.save()

    await audit(adminId, 'update_session', 'Order', id, data)

    // Notify student if meeting link or schedule was added/updated
    if (session.userId && (data.meetingLink || data.date || data.time)) {
      await Notification.create({
        audience: 'student',
        userId: session.userId,
        type: 'session_updated',
        title: '1-on-1 Session Updated',
        body: `Details for ${newDetails.serviceName || 'your session'} on ${newDetails.date || ''} have been updated.`,
        link: '/dashboard',
      }).catch(console.error)
    }

    return session
  },

  async sendSessionReminder(id, adminId) {
    const session = await Order.findOne({ _id: id, itemType: 'booking' })
    if (!session) throw new Error('1-on-1 session not found')

    const b = session.bookingDetails || {}
    if (!b.email) throw new Error('No email found for this session booking')

    await emailService.sendTemplate('booking_reminder', {
      to: b.email,
      toName: b.name || 'Athlete',
      data: {
        name: b.name || 'Athlete',
        'booking.serviceName': b.serviceName || '1-on-1 Training Session',
        date: b.date || '',
        time: b.time || '',
        location: b.meetingLink || 'Online via Google Meet / WhatsApp Video Call',
      },
      userId: session.userId || undefined,
      entityType: 'Booking',
      entityId: session._id.toString(),
    })

    await audit(adminId, 'send_session_reminder', 'Order', id, { email: b.email })
    return { ok: true, sentTo: b.email }
  },
}
