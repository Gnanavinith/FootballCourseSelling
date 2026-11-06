import { connectDb } from '../config/db.js'
import { User } from '../modules/users/user.model.js'
import { env } from '../config/env.js'

await connectDb()
let user = await User.findOne({ email: env.adminEmail })
if (!user) {
  const passwordHash = await User.hashPassword(env.adminPassword)
  user = await User.create({ name: env.adminName, email: env.adminEmail, passwordHash, role: 'superadmin' })
  console.log('Seeded superadmin:', env.adminEmail)
} else {
  user.role = 'superadmin'
  user.passwordHash = await User.hashPassword(env.adminPassword)
  await user.save()
  console.log('Updated superadmin:', env.adminEmail)
}
process.exit(0)
