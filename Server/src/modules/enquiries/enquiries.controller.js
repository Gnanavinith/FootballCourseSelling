import { asyncHandler } from '../../utils/asyncHandler.js'
import { enquiryService } from './enquiries.service.js'

export const enquiryController = {
  create: asyncHandler(async (req, res) => {
    const data = await enquiryService.create(req.body)
    res.status(201).json({ success: true, data })
  }),
}
