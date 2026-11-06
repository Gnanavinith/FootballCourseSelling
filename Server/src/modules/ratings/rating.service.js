import { Rating } from './rating.model.js'
import { Enrollment } from '../enrollments/enrollment.model.js'

export const ratingService = {
  /* Get all ratings for a course, with user info */
  async listForCourse(courseId) {
    return Rating.find({ courseId }).sort({ createdAt: -1 }).lean()
  },

  /* Get average rating and count */
  async stats(courseId) {
    const agg = await Rating.aggregate([
      { $match: { courseId } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ])
    return agg[0] || { avg: 0, count: 0 }
  },

  /* Submit or update a rating (user must be enrolled) */
  async submit({ courseId, userId, rating, review }) {
    const enrollment = await Enrollment.findOne({ courseId, userId, status: 'Active' })
    if (!enrollment) throw new Error('You must be enrolled in this course to rate it.')

    const existing = await Rating.findOne({ courseId, userId })
    if (existing) {
      existing.rating = rating
      existing.review = review || ''
      return existing.save()
    }
    return Rating.create({ courseId, userId, rating, review })
  },
}
