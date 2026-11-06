import { asyncHandler } from '../../utils/asyncHandler.js'
import { videoService } from './video.service.js'

export const videoController = {
  list: asyncHandler(async (req, res) => {
    const videos = await videoService.list({ courseId: req.query.courseId, weekNumber: req.query.weekNumber })
    res.json({ success: true, data: videos })
  }),
  get: asyncHandler(async (req, res) => {
    const video = await videoService.getById(req.params.id)
    res.json({ success: true, data: video })
  }),
  create: asyncHandler(async (req, res) => {
    const video = await videoService.create(req.body)
    res.status(201).json({ success: true, data: video })
  }),
  update: asyncHandler(async (req, res) => {
    const video = await videoService.update(req.params.id, req.body)
    res.json({ success: true, data: video })
  }),
  remove: asyncHandler(async (req, res) => {
    const result = await videoService.remove(req.params.id)
    res.json({ success: true, data: result })
  }),
  uploadUrl: asyncHandler(async (req, res) => {
    const result = await videoService.uploadUrl(req.body)
    res.status(201).json({ success: true, data: result })
  }),
  publish: asyncHandler(async (req, res) => {
    const video = await videoService.publish(req.params.id, req.body.published)
    res.json({ success: true, data: video })
  }),
  reorder: asyncHandler(async (req, res) => {
    const videos = await videoService.reorder(req.body)
    res.json({ success: true, data: videos })
  }),
  retry: asyncHandler(async (req, res) => {
    const video = await videoService.retry(req.params.id)
    res.json({ success: true, data: video })
  }),
  preview: asyncHandler(async (req, res) => {
    const data = await videoService.preview(req.params.id)
    res.json({ success: true, data })
  }),
  playback: asyncHandler(async (req, res) => {
    const data = await videoService.playback(req.params.id, req.user.id)
    res.json({ success: true, data })
  }),
  webhook: asyncHandler(async (req, res) => {
    res.json({ success: true })
  }),
}
