import mongoose from 'mongoose'
import { Coupon } from './coupon.model.js'
import { Course } from '../courses/course.model.js'
import { User } from '../users/user.model.js'
import { AppError } from '../../utils/AppError.js'
import { emailService, formatIST } from '../emails/email.service.js'
import { env } from '../../config/env.js'

export const couponService = {
  async listAdmin() {
    return Coupon.find()
      .populate('courseId', 'title slug price')
      .sort({ createdAt: -1 })
      .lean()
  },

  async getAdmin(id) {
    if (!mongoose.isValidObjectId(id)) throw new AppError('Invalid coupon id', 400)
    const coupon = await Coupon.findById(id).populate('courseId', 'title slug price').lean()
    if (!coupon) throw new AppError('Coupon not found', 404)
    return coupon
  },

  async create(data) {
    const code = String(data.code || '').trim().toUpperCase()
    if (!code) throw new AppError('Coupon code is required', 400)

    const existing = await Coupon.findOne({ code })
    if (existing) throw new AppError(`Coupon code "${code}" already exists`, 409)

    const discountType = data.discountType === 'fixed' ? 'fixed' : 'percentage'
    const discountValue = Number(data.discountValue)
    if (isNaN(discountValue) || discountValue <= 0) {
      throw new AppError('Discount value must be greater than 0', 400)
    }
    if (discountType === 'percentage' && discountValue > 100) {
      throw new AppError('Percentage discount cannot exceed 100%', 400)
    }

    let courseId = null
    let targetCourse = null
    if (data.courseId && mongoose.isValidObjectId(data.courseId)) {
      targetCourse = await Course.findById(data.courseId)
      if (targetCourse) courseId = targetCourse._id
    }

    const coupon = await Coupon.create({
      code,
      description: data.description || '',
      discountType,
      discountValue,
      minOrderAmount: Number(data.minOrderAmount) || 0,
      maxDiscount: data.maxDiscount ? Number(data.maxDiscount) : null,
      courseId,
      usageLimit: data.usageLimit ? Number(data.usageLimit) : null,
      perUserLimit: Number(data.perUserLimit) || 1,
      startsAt: data.startsAt ? new Date(data.startsAt) : new Date(),
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      isActive: data.isActive !== false,
    })

    // Notify registered students if requested
    let emailsQueued = 0
    if (data.notifyStudents) {
      emailsQueued = await this.broadcastCouponEmail(coupon, targetCourse)
    }

    return { coupon, emailsQueued }
  },

  async broadcastCouponEmail(coupon, course = null) {
    try {
      const students = await User.find({
        role: 'student',
        isActive: true,
        emailOptOut: { $ne: true },
      }).select('name email')

      if (!students.length) return 0

      const discountText =
        coupon.discountType === 'percentage'
          ? `${coupon.discountValue}% OFF`
          : `₹${coupon.discountValue} OFF`

      const expiryText = coupon.expiresAt
        ? `Valid until ${formatIST(coupon.expiresAt)}`
        : 'Limited time academy offer'

      const baseUrl = env.clientOrigin || 'http://localhost:5173'
      const actionUrl = course
        ? `${baseUrl}/courses/${course.slug}`
        : `${baseUrl}/courses`

      // Queue in background so admin request doesn't wait
      setImmediate(async () => {
        for (const student of students) {
          if (!student.email || !student.email.includes('@')) continue
          await emailService.sendTemplate('coupon_announcement', {
            to: student.email,
            toName: student.name || 'Student',
            data: {
              name: student.name || 'Athlete',
              couponCode: coupon.code,
              discountText,
              expiryText,
              actionUrl,
            },
            dedupeKey: `coupon_announcement:${coupon._id}:${student._id}`,
            userId: student._id.toString(),
            entityType: 'Coupon',
            entityId: coupon._id.toString(),
            isBroadcast: true,
          }).catch((err) => {
            console.error(`[Coupon Email Error for ${student.email}]:`, err?.message)
          })
        }
      })

      return students.length
    } catch (err) {
      console.error('[broadcastCouponEmail error]:', err)
      return 0
    }
  },

  async update(id, data) {
    if (!mongoose.isValidObjectId(id)) throw new AppError('Invalid coupon id', 400)

    const coupon = await Coupon.findById(id)
    if (!coupon) throw new AppError('Coupon not found', 404)

    if (data.code) {
      const code = String(data.code).trim().toUpperCase()
      if (code !== coupon.code) {
        const existing = await Coupon.findOne({ code, _id: { $ne: id } })
        if (existing) throw new AppError(`Coupon code "${code}" is already in use`, 409)
        coupon.code = code
      }
    }

    if (data.description !== undefined) coupon.description = data.description
    if (data.discountType !== undefined) {
      coupon.discountType = data.discountType === 'fixed' ? 'fixed' : 'percentage'
    }
    if (data.discountValue !== undefined) {
      const val = Number(data.discountValue)
      if (isNaN(val) || val <= 0) throw new AppError('Discount value must be greater than 0', 400)
      if (coupon.discountType === 'percentage' && val > 100) {
        throw new AppError('Percentage discount cannot exceed 100%', 400)
      }
      coupon.discountValue = val
    }
    if (data.minOrderAmount !== undefined) coupon.minOrderAmount = Number(data.minOrderAmount) || 0
    if (data.maxDiscount !== undefined) coupon.maxDiscount = data.maxDiscount ? Number(data.maxDiscount) : null
    if (data.courseId !== undefined) {
      coupon.courseId = data.courseId && mongoose.isValidObjectId(data.courseId) ? data.courseId : null
    }
    if (data.usageLimit !== undefined) coupon.usageLimit = data.usageLimit ? Number(data.usageLimit) : null
    if (data.perUserLimit !== undefined) coupon.perUserLimit = Number(data.perUserLimit) || 1
    if (data.expiresAt !== undefined) coupon.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null
    if (data.isActive !== undefined) coupon.isActive = Boolean(data.isActive)

    await coupon.save()
    return coupon
  },

  async toggleStatus(id) {
    if (!mongoose.isValidObjectId(id)) throw new AppError('Invalid coupon id', 400)
    const coupon = await Coupon.findById(id)
    if (!coupon) throw new AppError('Coupon not found', 404)

    coupon.isActive = !coupon.isActive
    await coupon.save()
    return coupon
  },

  async remove(id) {
    if (!mongoose.isValidObjectId(id)) throw new AppError('Invalid coupon id', 400)
    const deleted = await Coupon.findByIdAndDelete(id)
    if (!deleted) throw new AppError('Coupon not found', 404)
    return { success: true, message: 'Coupon deleted successfully' }
  },

  async validateCoupon(code, courseId, userId = null) {
    const trimmed = String(code || '').trim().toUpperCase()
    if (!trimmed) throw new AppError('Please enter a coupon code.', 400)

    const coupon = await Coupon.findOne({ code: trimmed })
    if (!coupon) throw new AppError('Invalid coupon code.', 404)

    if (!coupon.isActive) {
      throw new AppError('This coupon is no longer active.', 400)
    }

    const now = new Date()
    if (coupon.startsAt && now < coupon.startsAt) {
      throw new AppError('This coupon is not valid yet.', 400)
    }
    if (coupon.expiresAt && now > coupon.expiresAt) {
      throw new AppError('This coupon has expired.', 400)
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw new AppError('This coupon has reached its usage limit.', 400)
    }

    if (userId && coupon.perUserLimit && Array.isArray(coupon.usedBy)) {
      const userRedemptions = coupon.usedBy.filter(
        (u) => u.userId && u.userId.toString() === userId.toString()
      ).length
      if (userRedemptions >= coupon.perUserLimit) {
        throw new AppError(`You have already used this coupon (limit ${coupon.perUserLimit} per student).`, 400)
      }
    }

    // Verify course requirement
    if (coupon.courseId) {
      if (!courseId || coupon.courseId.toString() !== courseId.toString()) {
        throw new AppError('This coupon is valid only for a specific course.', 400)
      }
    }

    // Lookup course price if courseId is passed
    let coursePrice = 0
    if (courseId && mongoose.isValidObjectId(courseId)) {
      const course = await Course.findById(courseId).select('price title')
      if (course) coursePrice = course.price
    }

    if (coupon.minOrderAmount > 0 && coursePrice < coupon.minOrderAmount) {
      throw new AppError(`Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon.`, 400)
    }

    // Compute discount
    let discountAmount = 0
    if (coupon.discountType === 'percentage') {
      const rawDiscount = (coursePrice * coupon.discountValue) / 100
      const capped = coupon.maxDiscount ? Math.min(rawDiscount, coupon.maxDiscount) : rawDiscount
      discountAmount = Math.round(capped)
    } else {
      discountAmount = coupon.discountValue
    }

    // Discount cannot exceed course price
    discountAmount = Math.min(coursePrice, discountAmount)
    const finalAmount = Math.max(0, coursePrice - discountAmount)

    return {
      valid: true,
      coupon: {
        _id: coupon._id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        description: coupon.description,
        maxDiscount: coupon.maxDiscount,
        minOrderAmount: coupon.minOrderAmount,
        expiresAt: coupon.expiresAt,
      },
      originalAmount: coursePrice,
      discountAmount,
      finalAmount,
    }
  },

  async recordUsage(code, { userId, orderId }) {
    if (!code) return null
    const coupon = await Coupon.findOne({ code: String(code).trim().toUpperCase() })
    if (!coupon) return null

    coupon.usedCount = (coupon.usedCount || 0) + 1
    coupon.usedBy.push({
      userId: userId || undefined,
      orderId: orderId || undefined,
      usedAt: new Date(),
    })
    await coupon.save()
    return coupon
  },
}
export default couponService

