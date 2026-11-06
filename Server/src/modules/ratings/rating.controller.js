import { asyncHandler } from '../../utils/asyncHandler.js'
import { ratingService } from './rating.service.js'

export const ratingController = {
  list: asyncHandler(async (req, res) => {
    const ratings = await ratingService.listForCourse(req.params.courseId)
    const stats = await ratingService.stats(req.params.courseId)
    res.json({ success: true, data: { ratings, stats } })
  }),

  submit: asyncHandler(async (req, res) => {
    const data = await ratingService.submit({
      courseId: req.params.courseId,
      userId: req.user.id,
      rating: Number(req.body.rating),
      review: req.body.review || '',
    })
    res.status(201).json({ success: true, data })
  }),
}
