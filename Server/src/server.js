import { connectDb } from './config/db.js'
import app from './app.js'
import { env } from './config/env.js'
import { startWeeklyUnlockJob } from './jobs/weeklyUnlockMail.job.js'
import { emailService } from './modules/emails/email.service.js'

await connectDb()
startWeeklyUnlockJob()
emailService.startWorker()
app.listen(env.port, () => console.log(`Server listening on ${env.port}`))
