import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate.js'
import { uploadScreenshot } from '../../middleware/upload.js'
import { paymentRequestController } from './paymentRequest.controller.js'

const router = Router()
const student = [authenticate]

/* Student: submit a manual payment request (multipart, optional screenshot) */
router.post('/', ...student, uploadScreenshot, paymentRequestController.create)

/* Student: list their own payment requests */
router.get('/mine', ...student, paymentRequestController.listMine)

export default router
