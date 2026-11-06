import { asyncHandler } from '../../utils/asyncHandler.js'
import { AppError } from '../../utils/AppError.js'
import { uploadImageBuffer } from '../../config/cloudinary.js'
import { paymentRequestService } from './paymentRequest.service.js'

export const paymentRequestController = {
  create: asyncHandler(async (req, res) => {
    const userId = req.user.id
    const actingUserRole = req.user.role
    const { courseId, amount, method, reference, paidOn, payerName, mobile, note, targetUserId } = req.body

    let screenshotUrl = ''
    if (req.file) {
      const result = await uploadImageBuffer(req.file.buffer, 'vanakkam/payments')
      screenshotUrl = result.secure_url
    }

    const data = await paymentRequestService.create({
      userId,
      targetUserId,
      actingUserRole,
      courseId,
      amount,
      method,
      reference,
      paidOn,
      payerName,
      mobile,
      note,
      screenshotUrl,
    })
    res.status(201).json({ success: true, data })
  }),

  listMine: asyncHandler(async (req, res) => {
    const data = await paymentRequestService.listMine(req.user.id)
    res.json({ success: true, data })
  }),

  listAll: asyncHandler(async (req, res) => {
    const data = await paymentRequestService.listAll(req.query)
    res.json({ success: true, data })
  }),

  approve: asyncHandler(async (req, res) => {
    const data = await paymentRequestService.approve(req.params.id, Number(req.body.startWeek), req.user.id)
    res.json({ success: true, data })
  }),

  reject: asyncHandler(async (req, res) => {
    const data = await paymentRequestService.reject(req.params.id, req.body.reviewNote, req.user.id)
    res.json({ success: true, data })
  }),
}
