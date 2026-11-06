import { Router } from 'express'
import { authController } from './auth.controller.js'
import { authenticate } from '../../middleware/authenticate.js'

const router = Router()
router.post('/register', authController.register)
router.post('/login', authController.login)
router.get('/me', authenticate, authController.me)
router.post('/reset-otp', authController.sendResetOtp)
router.post('/reset-password', authController.resetPassword)
export default router
