import { Enrollment } from '../enrollments/enrollment.model.js'
import { Notification } from '../notifications/notification.model.js'
import { Course } from '../courses/course.model.js'
import { Video } from '../videos/video.model.js'
import { Order } from '../orders/order.model.js'
import { currentWeek, nextUnlockAt } from '../enrollments/access.service.js'

export const meService = {
  async courses(userId) {
    const enrollments = await Enrollment.find({ userId, status: 'Active' })
    const result = []
    for (const e of enrollments) {
      const course = await Course.findById(e.courseId)
      if (!course) continue
      e.totalWeeks = course.totalWeeks
      const cw = currentWeek(e)
      result.push({
        enrollmentId: e._id,
        course,
        currentWeek: cw,
        totalWeeks: course.totalWeeks,
        nextUnlockAt: nextUnlockAt(e),
        startsAt: e.startsAt,
        source: e.source || 'Paid',
        status: e.status || 'Active',
      })
    }
    return result
  },
  async weeks(userId, courseId) {
    const enrollment = await Enrollment.findOne({ userId, courseId, status: 'Active' })
    if (!enrollment) throw new Error('Not enrolled')
    const course = await Course.findById(courseId)
    enrollment.totalWeeks = course.totalWeeks
    const cw = currentWeek(enrollment)
    const videos = await Video.find({ courseId }).sort({ weekNumber: 1, order: 1 })
    const weeks = []
    for (let w = 1; w <= course.totalWeeks; w++) {
      const weekVideos = videos.filter((v) => v.weekNumber === w && v.published && v.status === 'Ready')
      let status = 'Locked'
      if (w === cw) status = 'Watching now'
      else if (w < cw) status = 'Locked' // past weeks locked per D6
      else status = `Unlocks on ${nextUnlockAt({ ...enrollment.toObject(), totalWeeks: course.totalWeeks })?.toLocaleDateString()}`
      // adjust upcoming unlock date per week
      const unlockDate = new Date(new Date(enrollment.startsAt).getTime() + enrollment.extraMs + (w - 1) * 7 * 24 * 60 * 60 * 1000)
      weeks.push({
        weekNumber: w,
        title: `Week ${w}`,
        status,
        unlocksAt: unlockDate,
        videos: w === cw ? weekVideos : [], // only current week videos
        comingSoon: w === cw && weekVideos.length === 0,
      })
    }
    return {
      course,
      currentWeek: cw,
      weeks,
      enrollment: {
        source: enrollment.source || 'Paid',
        status: enrollment.status || 'Active',
        startsAt: enrollment.startsAt,
      },
    }
  },
  async notifications(userId) {
    return Notification.find({ audience: 'student', userId }).sort({ createdAt: -1 }).limit(20)
  },
  async unreadNotificationCount(userId) {
    return Notification.countDocuments({ audience: 'student', userId, readAt: null })
  },
  async markNotificationRead(id, userId) {
    return Notification.findOneAndUpdate({ _id: id, userId }, { readAt: new Date() }, { new: true })
  },
  async markAllNotificationsRead(userId) {
    await Notification.updateMany({ audience: 'student', userId, readAt: null }, { readAt: new Date() })
    return { ok: true }
  },
  async orders(userId) {
    const docs = await Order.find({ userId }).sort({ createdAt: -1 }).populate('courseId', 'title')
    return docs.map((o) => ({
      _id: o._id,
      razorpayOrderId: o.razorpayOrderId,
      courseTitle: o.courseId?.title,
      amount: o.amount,
      status: o.status,
      createdAt: o.createdAt,
    }))
  },
}
