import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()

const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(',').map((o) => o.trim())
  : ['http://localhost:5173', 'http://127.0.0.1:5173']

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true)
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.netlify.app') ||
        allowedOrigins.includes('*') ||
        process.env.NODE_ENV !== 'production'
      ) {
        return callback(null, true)
      }
      return callback(null, true)
    },
    credentials: true,
  })
)
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check for Render
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() })
})

// routes
import authRoutes from './modules/auth/auth.routes.js'
import courseRoutes from './modules/courses/courses.routes.js'
import videoRoutes from './modules/videos/video.routes.js'
import paymentRoutes from './modules/payments/payment.routes.js'
import paymentRequestRoutes from './modules/payments/paymentRequest.routes.js'
import emailRoutes from './modules/emails/email.routes.js'
import { emailController } from './modules/emails/email.controller.js'
import meRoutes from './modules/me/me.routes.js'
import enquiryRoutes from './modules/enquiries/enquiries.routes.js'
import adminRoutes from './modules/admin/admin.routes.js'
import ratingRoutes from './modules/ratings/rating.routes.js'
import couponRoutes from './modules/coupons/coupon.routes.js'

app.use('/api/auth', authRoutes)
app.use('/api/courses', courseRoutes)
app.use('/api/coupons', couponRoutes)
app.use('/api/ratings', ratingRoutes)
app.use('/api/videos', videoRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/payment-requests', paymentRequestRoutes)
app.use('/api/admin/emails', emailRoutes)
app.use('/api/emails', emailRoutes)
app.get('/api/email/unsubscribe', emailController.unsubscribe)
app.use('/api/me', meRoutes)
app.use('/api/enquiries', enquiryRoutes)
app.use('/api/admin', adminRoutes)

// error handler
import { errorHandler } from './middleware/errorHandler.js'
app.use(errorHandler)

export default app
