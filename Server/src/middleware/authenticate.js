import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { User } from '../modules/users/user.model.js'

export async function authenticate(req, res, next) {
  const cookieToken = req.cookies?.token
  const header = req.headers.authorization || ''
  const bearerToken = header.startsWith('Bearer ') ? header.slice(7) : null
  const token = cookieToken || bearerToken
  if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' })
  try {
    const payload = jwt.verify(token, env.jwtSecret)
    const user = await User.findById(payload.id).select('-passwordHash')
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }
    req.user = { id: user._id.toString(), role: user.role, email: user.email }
    next()
  } catch {
    res.status(401).json({ success: false, message: 'Invalid token' })
  }
}

export async function optionalAuth(req, res, next) {
  const cookieToken = req.cookies?.token
  const header = req.headers.authorization || ''
  const bearerToken = header.startsWith('Bearer ') ? header.slice(7) : null
  const token = cookieToken || bearerToken
  if (!token) {
    req.user = null
    return next()
  }
  try {
    const payload = jwt.verify(token, env.jwtSecret)
    const user = await User.findById(payload.id).select('-passwordHash')
    if (user && user.isActive) {
      req.user = { id: user._id.toString(), role: user.role, email: user.email }
    } else {
      req.user = null
    }
  } catch {
    req.user = null
  }
  next()
}

export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden' })
    }
    next()
  }
}
