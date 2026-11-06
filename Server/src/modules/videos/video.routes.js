import { Router } from 'express'
import { authenticate, authorize } from '../../middleware/authenticate.js'
import { videoController } from './video.controller.js'

const router = Router()
router.get('/', videoController.list)
router.get('/:id/playback', authenticate, videoController.playback)
router.get('/:id/preview', authenticate, authorize('superadmin'), videoController.preview)
router.post('/upload-url', authenticate, authorize('superadmin'), videoController.uploadUrl)
router.patch('/reorder', authenticate, authorize('superadmin'), videoController.reorder)
router.patch('/:id/publish', authenticate, authorize('superadmin'), videoController.publish)
router.post('/:id/retry', authenticate, authorize('superadmin'), videoController.retry)
router.post('/webhook', videoController.webhook)
router.get('/:id', videoController.get)
router.post('/', authenticate, authorize('superadmin'), videoController.create)
router.put('/:id', authenticate, authorize('superadmin'), videoController.update)
router.delete('/:id', authenticate, authorize('superadmin'), videoController.remove)
export default router
