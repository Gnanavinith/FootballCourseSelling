import crypto from 'node:crypto'
import { v2 as cloudinary } from 'cloudinary'
import { env } from '../config/env.js'

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
})

export function createUploadTicket({ courseId, weekNumber }) {
  const publicId = `football-course/${courseId}/week-${weekNumber}-${crypto.randomBytes(6).toString('hex')}`

  const params = {
    public_id: publicId,
    timestamp: Math.round(Date.now() / 1000),
    type: 'authenticated',
  }

  const signature = cloudinary.utils.api_sign_request(params, env.CLOUDINARY_API_SECRET)

  return {
    uploadUrl: `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/video/upload`,
    apiKey: env.CLOUDINARY_API_KEY,
    publicId,
    params,
    signature,
  }
}

export function buildPlaybackUrl(publicId, secondsValid) {
  const options = {
    resource_type: 'video',
    type: 'authenticated',
    sign_url: true,
    format: 'mp4',
  }
  if (env.CLOUDINARY_TOKEN_KEY) {
    options.auth_token = { key: env.CLOUDINARY_TOKEN_KEY, duration: secondsValid }
    options.private_cdn = true
    options.secure_distribution = env.CLOUDINARY_CNAME
  }
  return cloudinary.url(publicId, options)
}

export function deleteVideo(publicId) {
  return cloudinary.uploader.destroy(publicId, {
    resource_type: 'video',
    type: 'authenticated',
    invalidate: true,
  })
}
