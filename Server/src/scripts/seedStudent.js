import { connectDb } from '../config/db.js'
import { User } from '../modules/users/user.model.js'

await connectDb()
const email = 'student@example.com'
let user = await User.findOne({ email })
if (!user) {
  const passwordHash = await User.hashPassword('Student@12345')
  user = await User.create({ name: 'Test Student', email, passwordHash, role: 'student' })
  console.log('Seeded student:', email)
} else {
  user.passwordHash = await User.hashPassword('Student@12345')
  await user.save()
  console.log('Updated student:', email)
}
process.exit(0)
