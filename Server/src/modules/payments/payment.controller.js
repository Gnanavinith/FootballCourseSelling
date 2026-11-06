import { asyncHandler } from '../../utils/asyncHandler.js'
import { paymentService } from './payment.service.js'

export const paymentController = {
  createOrder: asyncHandler(async (req, res) => {
    const data = await paymentService.createOrder(req.user?.id || req.body.studentId, req.body)
    res.status(201).json({ success: true, data })
  }),
  verify: asyncHandler(async (req, res) => {
    const order = await paymentService.handleVerify(req.user?.id, req.body)
    res.json({ success: true, data: order })
  }),
  webhook: asyncHandler(async (req, res) => {
    const signature = req.headers['x-razorpay-signature']
    const result = await paymentService.handleWebhook(req.body, signature)
    res.json({ success: true, data: result })
  }),
}
