import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import mongoose from 'mongoose'
import { Coupon } from '../src/modules/coupons/coupon.model.js'
import { Course } from '../src/modules/courses/course.model.js'
import { couponService } from '../src/modules/coupons/coupon.service.js'

describe('Coupon Module Unit Tests', () => {
  let testCourse = null

  before(async () => {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/footballcourse_test'
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri)
    }
    await Coupon.deleteMany({ code: { $in: ['TESTGOAL50', 'TESTFLAT300', 'TESTEXPIRED', 'TESTLIMIT'] } })
    testCourse = await Course.create({
      title: 'Striker Precision Masterclass',
      slug: `striker-precision-test-${Date.now()}`,
      price: 2000,
      originalPrice: 3000,
      status: 'Published',
    })
  })

  after(async () => {
    await Coupon.deleteMany({ code: { $in: ['TESTGOAL50', 'TESTFLAT300', 'TESTEXPIRED', 'TESTLIMIT'] } })
    if (testCourse) await Course.findByIdAndDelete(testCourse._id)
    await mongoose.disconnect()
  })

  it('validates percentage coupon with max discount cap', async () => {
    const { coupon } = await couponService.create({
      code: 'TESTGOAL50',
      discountType: 'percentage',
      discountValue: 50,
      maxDiscount: 600, // 50% of 2000 is 1000, capped at 600
      isActive: true,
    })

    assert.equal(coupon.code, 'TESTGOAL50')

    const res = await couponService.validateCoupon('TESTGOAL50', testCourse._id)
    assert.equal(res.valid, true)
    assert.equal(res.discountAmount, 600)
    assert.equal(res.finalAmount, 1400)
  })

  it('validates flat discount coupon', async () => {
    await couponService.create({
      code: 'TESTFLAT300',
      discountType: 'fixed',
      discountValue: 300,
      isActive: true,
    })

    const res = await couponService.validateCoupon('TESTFLAT300', testCourse._id)
    assert.equal(res.valid, true)
    assert.equal(res.discountAmount, 300)
    assert.equal(res.finalAmount, 1700)
  })

  it('rejects expired coupon', async () => {
    await couponService.create({
      code: 'TESTEXPIRED',
      discountType: 'fixed',
      discountValue: 100,
      expiresAt: new Date(Date.now() - 60000),
      isActive: true,
    })

    await assert.rejects(
      async () => couponService.validateCoupon('TESTEXPIRED', testCourse._id),
      /This coupon has expired/
    )
  })

  it('enforces overall usage limit', async () => {
    await couponService.create({
      code: 'TESTLIMIT',
      discountType: 'fixed',
      discountValue: 200,
      usageLimit: 1,
      isActive: true,
    })

    await couponService.recordUsage('TESTLIMIT', { userId: new mongoose.Types.ObjectId() })

    await assert.rejects(
      async () => couponService.validateCoupon('TESTLIMIT', testCourse._id),
      /reached its usage limit/
    )
  })
})
