import { asyncHandler } from '../../utils/asyncHandler.js'
import { AppError } from '../../utils/AppError.js'
import { courseService } from './courses.service.js'

export const courseController = {
  listPublic: asyncHandler(async (req, res) => {
    res.json({ success: true, data: await courseService.listPublic() })
  }),
  getBySlug: asyncHandler(async (req, res) => {
    res.json({ success: true, data: await courseService.getBySlug(req.params.slug) })
  }),
  listAdmin: asyncHandler(async (req, res) => {
    res.json({ success: true, data: await courseService.listAdmin() })
  }),
  getAdmin: asyncHandler(async (req, res) => {
    res.json({ success: true, data: await courseService.getById(req.params.id) })
  }),
  create: asyncHandler(async (req, res) => {
    res.status(201).json({ success: true, data: await courseService.create(req.body) })
  }),
  update: asyncHandler(async (req, res) => {
    res.json({ success: true, data: await courseService.update(req.params.id, req.body) })
  }),
  remove: asyncHandler(async (req, res) => {
    res.json({ success: true, data: await courseService.remove(req.params.id) })
  }),
  duplicate: asyncHandler(async (req, res) => {
    res.status(201).json({ success: true, data: await courseService.duplicate(req.params.id) })
  }),
  status: asyncHandler(async (req, res) => {
    res.json({ success: true, data: await courseService.setStatus(req.params.id, req.body.status) })
  }),
  uploadThumbnail: asyncHandler(async (req, res) => {
    res.json({ success: true, data: await courseService.uploadThumbnail(req.params.id, req.file) })
  }),
  uploadDocuments: asyncHandler(async (req, res) => {
    res.json({ success: true, data: await courseService.uploadDocuments(req.params.id, req.files) })
  }),
  uploadSyllabus: asyncHandler(async (req, res) => {
    res.json({ success: true, data: await courseService.uploadSyllabus(req.params.id, req.file) })
  }),
  getSyllabusFile: asyncHandler(async (req, res) => {
    const course = await courseService.getSyllabusFile(req.params.id)
    const response = await fetch(course.syllabusUrl)
    if (!response.ok) {
      throw new AppError('Failed to retrieve syllabus document', 502)
    }
    const filename = `${course.slug || 'course'}-syllabus.pdf`
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`)
    res.setHeader('Cache-Control', 'public, max-age=86400')
    const buffer = await response.arrayBuffer()
    res.send(Buffer.from(buffer))
  }),
}