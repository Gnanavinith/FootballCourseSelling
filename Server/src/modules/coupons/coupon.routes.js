import { Router } from 'express'
import { authenticate, authorize, optionalAuth } from '../../middleware/authenticate.js'
import { couponController } from './coupon.controller.js'

const router = Router()
const admin = [authenticate, authorize('superadmin')]

// Student / Public validate coupon code
router.post('/validate', optionalAuth, couponController.validate)

// Admin coupon management
router.get('/', ...admin, couponController.listAdmin)
router.post('/', ...admin, couponController.create)
router.get('/:id', ...admin, couponController.getAdmin)
router.put('/:id', ...admin, couponController.update)
router.patch('/:id/status', ...admin, couponController.toggleStatus)
router.delete('/:id', ...admin, couponController.remove)

export default router

