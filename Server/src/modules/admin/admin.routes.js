import { Router } from 'express'
import { authenticate, authorize } from '../../middleware/authenticate.js'
import { adminController } from './admin.controller.js'
import { paymentRequestController } from '../payments/paymentRequest.controller.js'

const router = Router()
const A = [authenticate, authorize('superadmin')]

router.get('/dashboard', ...A, adminController.dashboard)

router.get('/students', ...A, adminController.listStudents)
router.post('/students', ...A, adminController.createStudent)
router.get('/students/:id', ...A, adminController.getStudent)
router.put('/students/:id', ...A, adminController.updateStudent)
router.delete('/students/:id', ...A, adminController.deleteStudent)
router.patch('/students/:id/status', ...A, adminController.setStudentStatus)
router.post('/students/:id/reset-password', ...A, adminController.resetPassword)

router.post('/enrollments', ...A, adminController.manualEnroll)
router.patch('/enrollments/:id/extend', ...A, adminController.extendEnrollment)
router.patch('/enrollments/:id/jump', ...A, adminController.jumpEnrollment)
router.patch('/enrollments/:id/unlock-all', ...A, adminController.unlockAll)
router.patch('/enrollments/:id/pause', ...A, adminController.pauseEnrollment)
router.patch('/enrollments/:id/resume', ...A, adminController.resumeEnrollment)

router.get('/orders', ...A, adminController.listOrders)
router.get('/orders/summary', ...A, adminController.ordersSummary)
router.patch('/orders/:id/refund', ...A, adminController.refundOrder)

router.get('/notifications', ...A, adminController.listNotifications)
router.get('/notifications/unread-count', ...A, adminController.unreadNotificationCount)
router.patch('/notifications/read-all', ...A, adminController.markAllNotificationsRead)
router.delete('/notifications/clear-read', ...A, adminController.clearReadNotifications)
router.patch('/notifications/:id/read', ...A, adminController.markNotificationRead)
router.patch('/notifications/:id/unread', ...A, adminController.markNotificationUnread)
router.delete('/notifications/:id', ...A, adminController.deleteNotification)

router.get('/enquiries', ...A, adminController.listEnquiries)
router.patch('/enquiries/:id', ...A, adminController.updateEnquiry)
router.post('/enquiries/:id/reply', ...A, adminController.replyEnquiry)
router.delete('/enquiries/:id', ...A, adminController.deleteEnquiry)

router.get('/payment-requests', ...A, paymentRequestController.listAll)
router.patch('/payment-requests/:id/approve', ...A, paymentRequestController.approve)
router.patch('/payment-requests/:id/reject', ...A, paymentRequestController.reject)

export default router
