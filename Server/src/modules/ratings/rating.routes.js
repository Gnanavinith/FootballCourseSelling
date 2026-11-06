import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate.js'
import { ratingController } from './rating.controller.js'

const router = Router()

router.get('/:courseId/ratings', ratingController.list)
router.post('/:courseId/ratings', authenticate, ratingController.submit)

export default router
