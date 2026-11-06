import { Video } from './video.model.js'
import { Course } from '../courses/course.model.js'
import { Enrollment } from '../enrollments/enrollment.model.js'
import { currentWeek } from '../enrollments/access.service.js'
import { createUploadTicket, deleteVideo, buildPlaybackUrl } from '../../lib/cloudinary.js'

export const videoService = {
  async list({ courseId, weekNumber }) {
    const filter = {}
    if (courseId) filter.courseId = courseId
    if (weekNumber) filter.weekNumber = Number(weekNumber)
    return Video.find(filter).sort({ weekNumber: 1, order: 1 })
  },
  async getById(id) {
    const video = await Video.findById(id)
    if (!video) throw new Error('Video not found')
    return video
  },
  async create(data) {
    return Video.create(data)
  },
  async update(id, data) {
    const video = await Video.findByIdAndUpdate(id, data, { new: true, runValidators: true })
    if (!video) throw new Error('Video not found')
    return video
  },
  async remove(id) {
    const video = await Video.findById(id)
    if (!video) throw new Error('Video not found')
    await deleteVideo(video.bunnyVideoId)
    await video.deleteOne()
    return { deleted: true }
  },
  async uploadUrl({ courseId, weekNumber }) {
    const ticket = createUploadTicket({ courseId, weekNumber })
    const video = await Video.create({
      courseId,
      title: 'Untitled',
      weekNumber,
      bunnyVideoId: ticket.publicId,
      status: 'Uploading',
    })
    return { video, ...ticket }
  },
  async publish(id, published) {
    return Video.findByIdAndUpdate(id, { published }, { new: true })
  },
  async reorder({ courseId, weekNumber, orderedIds }) {
    const updates = orderedIds.map((id, idx) => Video.findByIdAndUpdate(id, { order: idx }))
    await Promise.all(updates)
    return Video.find({ courseId, weekNumber }).sort({ order: 1 })
  },
  async retry(id) {
    return Video.findByIdAndUpdate(id, { status: 'Processing' }, { new: true })
  },
  async preview(id) {
    const video = await Video.findById(id)
    if (!video) throw new Error('Video not found')
    const expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000)
    return { url: buildPlaybackUrl(video.bunnyVideoId, Math.floor((expiresAt.getTime() - Date.now()) / 1000)), expiresAt }
  },
  async playback(videoId, userId) {
    const video = await Video.findById(videoId)
    if (!video || !video.published || video.status !== 'Ready') {
      throw new Error('Video not available')
    }
    const enrollment = await Enrollment.findOne({ userId, courseId: video.courseId, status: 'Active' })
    if (!enrollment) throw new Error('No active enrollment')
    /* Only students who have successfully paid can watch weekly training videos. */
    if (enrollment.source !== 'Paid') {
      throw new Error('Payment required to watch this video')
    }
    const course = await Course.findById(video.courseId)
    enrollment.totalWeeks = course.totalWeeks
    const cw = currentWeek(enrollment)
    if (!enrollment.unlockedAll && video.weekNumber !== cw) {
      throw new Error('This video is not available this week')
    }
    const msLeftInWeek = new Date(enrollment.startsAt).getTime() + (enrollment.extraMs || 0) + cw * 7 * 24 * 60 * 60 * 1000 - Date.now()
    const cap = Math.min(4 * 60 * 60 * 1000, Math.max(0, msLeftInWeek))
    const expiresAt = new Date(Date.now() + cap)
    return { url: buildPlaybackUrl(video.bunnyVideoId, Math.floor((expiresAt.getTime() - Date.now()) / 1000)), expiresAt }
  },
}
