import dns from 'dns'
import mongoose from 'mongoose'
import { env } from './env.js'

export async function connectDb() {
  if (env.mongoUri && env.mongoUri.startsWith('mongodb+srv://')) {
    try {
      dns.setServers(['8.8.8.8', '1.1.1.1'])
    } catch {}
  }
  await mongoose.connect(env.mongoUri)
  console.log('MongoDB connected')
}
