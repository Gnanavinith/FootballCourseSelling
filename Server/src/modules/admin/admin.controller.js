import { asyncHandler } from '../../utils/asyncHandler.js'
import { adminService } from './admin.service.js'
import enquiryService from '../enquiries/enquiries.service.js'

export const adminController = {
  dashboard: asyncHandler(async (req, res) => {
    const data = await adminService.dashboard()
    res.json({ success: true, data })
  }),
  listStudents: asyncHandler(async (req, res) => {
    const data = await adminService.listStudents(req.query)
    res.json({ success: true, data })
  }),
  getStudent: asyncHandler(async (req, res) => {
    const data = await adminService.getStudent(req.params.id)
    res.json({ success: true, data })
  }),
  createStudent: asyncHandler(async (req, res) => {
    const data = await adminService.createStudent(req.body, req.user.id)
    res.status(201).json({ success: true, data })
  }),
  updateStudent: asyncHandler(async (req, res) => {
    const data = await adminService.updateStudent(req.params.id, req.body, req.user.id)
    res.json({ success: true, data })
  }),
  deleteStudent: asyncHandler(async (req, res) => {
    const data = await adminService.deleteStudent(req.params.id, req.user.id)
    res.json({ success: true, data })
  }),
  setStudentStatus: asyncHandler(async (req, res) => {
    const data = await adminService.setStudentStatus(req.params.id, req.body.isActive, req.user.id)
    res.json({ success: true, data })
  }),
  resetPassword: asyncHandler(async (req, res) => {
    const data = await adminService.resetPassword(req.params.id, req.user.id)
    res.json({ success: true, data })
  }),
  manualEnroll: asyncHandler(async (req, res) => {
    const data = await adminService.manualEnroll(req.body.userId, req.body.courseId, req.user.id)
    res.status(201).json({ success: true, data })
  }),
  extendEnrollment: asyncHandler(async (req, res) => {
    const data = await adminService.extendEnrollment(req.params.id, req.body.days, req.user.id)
    res.json({ success: true, data })
  }),
  jumpEnrollment: asyncHandler(async (req, res) => {
    const data = await adminService.jumpEnrollment(req.params.id, req.body.week, req.user.id)
    res.json({ success: true, data })
  }),
  unlockAll: asyncHandler(async (req, res) => {
    const data = await adminService.unlockAll(req.params.id, req.user.id)
    res.json({ success: true, data })
  }),
  pauseEnrollment: asyncHandler(async (req, res) => {
    const data = await adminService.pauseEnrollment(req.params.id, req.user.id)
    res.json({ success: true, data })
  }),
  resumeEnrollment: asyncHandler(async (req, res) => {
    const data = await adminService.resumeEnrollment(req.params.id, req.user.id)
    res.json({ success: true, data })
  }),
  listOrders: asyncHandler(async (req, res) => {
    const data = await adminService.listOrders(req.query)
    res.json({ success: true, data })
  }),
  refundOrder: asyncHandler(async (req, res) => {
    const data = await adminService.refundOrder(req.params.id, req.user.id)
    res.json({ success: true, data })
  }),
  ordersSummary: asyncHandler(async (req, res) => {
    const data = await adminService.ordersSummary(req.query.by)
    res.json({ success: true, data })
  }),
  listEnquiries: asyncHandler(async (req, res) => {
    const data = await adminService.listEnquiries(req.query)
    res.json({ success: true, data })
  }),
  updateEnquiry: asyncHandler(async (req, res) => {
    const data = await adminService.updateEnquiry(req.params.id, req.body, req.user.id)
    res.json({ success: true, data })
  }),
  listNotifications: asyncHandler(async (req, res) => {
    const data = await adminService.listNotifications(req.query)
    res.json({ success: true, data })
  }),
  unreadNotificationCount: asyncHandler(async (req, res) => {
    const data = await adminService.unreadNotificationCount()
    res.json({ success: true, data: { count: data } })
  }),
  markNotificationRead: asyncHandler(async (req, res) => {
    const data = await adminService.markNotificationRead(req.params.id)
    res.json({ success: true, data })
  }),
  markNotificationUnread: asyncHandler(async (req, res) => {
    const data = await adminService.markNotificationUnread(req.params.id)
    res.json({ success: true, data })
  }),
  markAllNotificationsRead: asyncHandler(async (req, res) => {
    const data = await adminService.markAllNotificationsRead()
    res.json({ success: true, data })
  }),
  deleteNotification: asyncHandler(async (req, res) => {
    const data = await adminService.deleteNotification(req.params.id)
    res.json({ success: true, data })
  }),
  clearReadNotifications: asyncHandler(async (req, res) => {
    const data = await adminService.clearReadNotifications()
    res.json({ success: true, data })
  }),

  deleteEnquiry: asyncHandler(async (req, res) => {
    const data = await adminService.deleteEnquiry(req.params.id, req.user.id)
    res.json({ success: true, data })
  }),
  replyEnquiry: asyncHandler(async (req, res) => {
    const data = await enquiryService.reply(req.params.id, req.body.replyMessage, req.user)
    res.json({ success: true, data })
  }),

  /* 1-on-1 Sessions */
  listSessions: asyncHandler(async (req, res) => {
    const data = await adminService.listSessions(req.query)
    res.json({ success: true, data })
  }),
  getSession: asyncHandler(async (req, res) => {
    const data = await adminService.getSession(req.params.id)
    res.json({ success: true, data })
  }),
  updateSession: asyncHandler(async (req, res) => {
    const data = await adminService.updateSession(req.params.id, req.body, req.user.id)
    res.json({ success: true, data })
  }),
  sendSessionReminder: asyncHandler(async (req, res) => {
    const data = await adminService.sendSessionReminder(req.params.id, req.user.id)
    res.json({ success: true, data })
  }),
}
