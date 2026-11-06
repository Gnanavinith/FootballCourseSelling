import { v2 as cloudinary } from 'cloudinary'
import { AppError } from '../utils/AppError.js'

let configured = false

function client() {
  if (!configured) {
    const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
      throw new AppError('Image upload is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to Server/.env and restart the server.', 500)
    }
    cloudinary.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
      secure: true,
    })
    configured = true
  }
  return cloudinary
}

export function uploadImageBuffer(buffer, folder = 'vanakkam/courses') {
  const c = client()
  return new Promise((resolve, reject) => {
    const stream = c.uploader.upload_stream(
      { folder, resource_type: 'image', transformation: [{ width: 1280, height: 720, crop: 'fill', gravity: 'auto' }] },
      (err, result) => (err ? reject(new AppError(`Cloudinary upload failed: ${err.message}`, 502)) : resolve(result))
    )
    stream.end(buffer)
  })
}

export function uploadDocumentBuffer(buffer, folder = 'vanakkam/courses/documents') {
  const c = client()
  return new Promise((resolve, reject) => {
    const stream = c.uploader.upload_stream(
      { folder, resource_type: 'raw' },
      (err, result) => (err ? reject(new AppError(`Document upload failed: ${err.message}`, 502)) : resolve(result))
    )
    stream.end(buffer)
  })
}

export async function deleteImage(publicId) {
  if (!publicId) return
  try { await client().uploader.destroy(publicId, { invalidate: true }) }
  catch (e) { console.error('Cloudinary delete failed:', e.message) }
}

export const optimiseUrl = (url) => url.replace('/upload/', '/upload/f_auto,q_auto/')
