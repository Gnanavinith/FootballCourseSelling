import { Router } from 'express'
import { authenticate, authorize } from '../../middleware/authenticate.js'
import { uploadImage, uploadDocuments, uploadSyllabusFile } from '../../middleware/upload.js'
import { courseController } from './courses.controller.js'

const router = Router()
const admin = [authenticate, authorize('superadmin')]

/* Public website (published courses only) */
router.get('/', courseController.listPublic)
router.get('/slug/:slug', courseController.getBySlug)

/* Admin panel. Keep these BEFORE any "/:id" route so "admin" is not read as an id. */
router.get('/admin/list', ...admin, courseController.listAdmin)
router.get('/admin/:id', ...admin, courseController.getAdmin)

/* Public syllabus PDF stream */
router.get('/:id/syllabus/file', courseController.getSyllabusFile)

router.post('/', ...admin, courseController.create)
router.put('/:id', ...admin, courseController.update)
router.delete('/:id', ...admin, courseController.remove)
router.post('/:id/duplicate', ...admin, courseController.duplicate)
router.patch('/:id/status', ...admin, courseController.status)
router.post('/:id/thumbnail', ...admin, uploadImage, courseController.uploadThumbnail)
router.post('/:id/syllabus', ...admin, uploadSyllabusFile, courseController.uploadSyllabus)
router.post('/:id/documents', ...admin, uploadDocuments, courseController.uploadDocuments)

export default router