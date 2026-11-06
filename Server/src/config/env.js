import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../../.env') })
dotenv.config({ path: path.resolve(__dirname, '../../../.env') })
dotenv.config()

export const env = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/footballcourse',
  jwtSecret: process.env.JWT_SECRET || 'change-me-in-production',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@vanakkamsoccer.com',
  adminPassword: process.env.ADMIN_PASSWORD || 'Admin@12345',
  adminName: process.env.ADMIN_NAME || 'Super Admin',
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || '',
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || '',
  razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
  bunnyLibraryId: process.env.BUNNY_LIBRARY_ID || '',
  bunnyApiKey: process.env.BUNNY_API_KEY || '',
  bunnyCdnHostname: process.env.BUNNY_CDN_HOSTNAME || '',
  bunnyTokenKey: process.env.BUNNY_TOKEN_KEY || '',
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || '',
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || '',
  cloudinaryTokenKey: process.env.CLOUDINARY_TOKEN_KEY || '',
  cloudinaryCname: process.env.CLOUDINARY_CNAME || '',
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
  CLOUDINARY_TOKEN_KEY: process.env.CLOUDINARY_TOKEN_KEY || '',
  CLOUDINARY_CNAME: process.env.CLOUDINARY_CNAME || '',
  smtpHost: process.env.SMTP_HOST || '',
  smtpPort: Number(process.env.SMTP_PORT || 587),
  smtpSecure: process.env.SMTP_SECURE === 'true',
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  cookieSecure: process.env.COOKIE_SECURE === 'true',
}
