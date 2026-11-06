import { couponService } from './coupon.service.js'

export const couponController = {
  async listAdmin(req, res, next) {
    try {
      const coupons = await couponService.listAdmin()
      res.json({ success: true, coupons })
    } catch (err) {
      next(err)
    }
  },

  async getAdmin(req, res, next) {
    try {
      const coupon = await couponService.getAdmin(req.params.id)
      res.json({ success: true, coupon })
    } catch (err) {
      next(err)
    }
  },

  async create(req, res, next) {
    try {
      const result = await couponService.create(req.body)
      res.status(201).json({
        success: true,
        message: result.emailsQueued > 0
          ? `Coupon created! Announcement queued for ${result.emailsQueued} students.`
          : 'Coupon created successfully.',
        ...result,
      })
    } catch (err) {
      next(err)
    }
  },

  async update(req, res, next) {
    try {
      const coupon = await couponService.update(req.params.id, req.body)
      res.json({ success: true, message: 'Coupon updated successfully.', coupon })
    } catch (err) {
      next(err)
    }
  },

  async toggleStatus(req, res, next) {
    try {
      const coupon = await couponService.toggleStatus(req.params.id)
      res.json({
        success: true,
        message: `Coupon ${coupon.isActive ? 'activated' : 'deactivated'}.`,
        coupon,
      })
    } catch (err) {
      next(err)
    }
  },

  async remove(req, res, next) {
    try {
      const result = await couponService.remove(req.params.id)
      res.json(result)
    } catch (err) {
      next(err)
    }
  },

  async validate(req, res, next) {
    try {
      const { code, courseId } = req.body
      const userId = req.user?.id || null
      const result = await couponService.validateCoupon(code, courseId, userId)
      res.json({ success: true, ...result })
    } catch (err) {
      next(err)
    }
  },
}

