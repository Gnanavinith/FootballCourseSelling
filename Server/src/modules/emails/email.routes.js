import { Router } from 'express'
import { authenticate, authorize } from '../../middleware/authenticate.js'
import { emailController } from './email.controller.js'

const router = Router()

// Superadmin check
const superadminOnly = [authenticate, authorize('superadmin')]

// Overview
router.get('/overview', ...superadminOnly, emailController.overview)

// Templates
router.get('/templates', ...superadminOnly, emailController.listTemplates)
router.get('/templates/:key', ...superadminOnly, emailController.getTemplate)
router.put('/templates/:key', ...superadminOnly, emailController.saveTemplate)
router.delete('/templates/:key', ...superadminOnly, emailController.resetTemplate)
router.post('/templates/:key/preview', ...superadminOnly, emailController.previewTemplate)
router.post('/templates/:key/test', ...superadminOnly, emailController.testTemplate)

// Logs / Outbox
router.get('/logs', ...superadminOnly, emailController.listLogs)
router.get('/logs/:id', ...superadminOnly, emailController.getLog)
router.post('/logs/:id/retry', ...superadminOnly, emailController.retryLog)
router.post('/logs/retry-failed', ...superadminOnly, emailController.retryAllFailed)

// Broadcast
router.post('/broadcast/count', ...superadminOnly, emailController.broadcastCount)
router.post('/broadcast', ...superadminOnly, emailController.sendBroadcast)

// Settings
router.get('/settings', ...superadminOnly, emailController.getSettings)
router.put('/settings', ...superadminOnly, emailController.updateSettings)
router.post('/settings/test', ...superadminOnly, emailController.testSmtp)

// Backward-compatible endpoints
router.get('/email-logs', ...superadminOnly, emailController.listLogs)
router.post('/email-logs/:id/resend', ...superadminOnly, emailController.retryLog)

export default router
