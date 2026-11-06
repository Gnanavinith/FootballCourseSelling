import { Router } from 'express'
import { enquiryController } from './enquiries.controller.js'

const router = Router()

/* Public: submit a new enquiry */
router.post('/', enquiryController.create)

export default router
