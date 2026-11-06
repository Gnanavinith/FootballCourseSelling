import { asyncHandler } from '../../utils/asyncHandler.js'
import { meService } from './me.service.js'

export const meController = {
  courses: asyncHandler(async (req, res) => {
    const data = await meService.courses(req.user.id)
    res.json({ success: true, data })
  }),
  weeks: asyncHandler(async (req, res) => {
    const data = await meService.weeks(req.user.id, req.params.courseId)
    res.json({ success: true, data })
  }),
  notifications: asyncHandler(async (req, res) => {
    const data = await meService.notifications(req.user.id)
    res.json({ success: true, data })
  }),
  unreadNotificationCount: asyncHandler(async (req, res) => {
    const count = await meService.unreadNotificationCount(req.user.id)
    res.json({ success: true, data: { count } })
  }),
  markNotificationRead: asyncHandler(async (req, res) => {
    const data = await meService.markNotificationRead(req.params.id, req.user.id)
    res.json({ success: true, data })
  }),
  markAllNotificationsRead: asyncHandler(async (req, res) => {
    const data = await meService.markAllNotificationsRead(req.user.id)
    res.json({ success: true, data })
  }),
  orders: asyncHandler(async (req, res) => {
    const data = await meService.orders(req.user.id)
    res.json({ success: true, data })
  }),
}
