import { api } from '../lib/api.js'

export const authService = {
  async login(email, password) {
    const data = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    return data
  },
  async register(name, email, password) {
    const data = await api('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) })
    if (data.token) localStorage.setItem('token', data.token)
    if (data.user) localStorage.setItem('user', JSON.stringify(data.user))
    return data
  },
  async sendResetOtp(email) {
    return await api('/auth/reset-otp', { method: 'POST', body: JSON.stringify({ email }) })
  },
  async resetPassword(email, otp, newPassword) {
    const data = await api('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, otp, newPassword }),
    })
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    return data
  },
  logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },
  token() {
    return localStorage.getItem('token')
  },
}
