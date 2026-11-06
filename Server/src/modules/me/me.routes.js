import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate.js'
import { meController } from './me.controller.js'

const router = Router()
router.get('/courses', authenticate, meController.courses)
router.get('/courses/:courseId/weeks', authenticate, meController.weeks)
router.get('/notifications', authenticate, meController.notifications)
router.get('/notifications/unread-count', authenticate, meController.unreadNotificationCount)
router.patch('/notifications/:id/read', authenticate, meController.markNotificationRead)
router.patch('/notifications/read-all', authenticate, meController.markAllNotificationsRead)
router.get('/orders', authenticate, meController.orders)
export default router
