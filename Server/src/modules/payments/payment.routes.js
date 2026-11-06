import { Router } from 'express'
import { optionalAuth } from '../../middleware/authenticate.js'
import { paymentController } from './payment.controller.js'

const router = Router()
router.post('/order', optionalAuth, paymentController.createOrder)
router.post('/verify', optionalAuth, paymentController.verify)
export default router
