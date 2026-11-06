import { authService } from './auth.service.js'

export const authController = {
  async register(req, res, next) {
    try {
      const { name, email, password } = req.body || {}
      if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' })
      const result = await authService.register({ name, email, password })
      res.status(201).json(result)
    } catch (err) {
      next(err)
    }
  },
  async login(req, res, next) {
    try {
      const { email, password } = req.body || {}
      if (!email || !password) return res.status(400).json({ message: 'Missing fields' })
      const result = await authService.login({ email, password })
      res.json(result)
    } catch (err) {
      next(err)
    }
  },
  async me(req, res, next) {
    try {
      const user = await authService.me(req.user.id)
      res.json({ user })
    } catch (err) {
      next(err)
    }
  },
  async sendResetOtp(req, res, next) {
    try {
      const { email } = req.body || {}
      if (!email) return res.status(400).json({ message: 'Email is required' })
      const result = await authService.sendResetOtp({ email })
      res.json(result)
    } catch (err) {
      next(err)
    }
  },
  async resetPassword(req, res, next) {
    try {
      const { email, otp, newPassword } = req.body || {}
      if (!email || !otp || !newPassword) return res.status(400).json({ message: 'Missing fields' })
      const result = await authService.resetPassword({ email, otp, newPassword })
      res.json(result)
    } catch (err) {
      next(err)
    }
  },
}
