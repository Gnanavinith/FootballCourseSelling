import { emailService } from '../modules/emails/email.service.js'

/**
 * Weekly drip schedule and unlocked emails.
 * Handled via emailService.processDripSchedules() inside emailService.startWorker().
 */
export function startWeeklyUnlockJob() {
  // Preserved for backward compatibility
}
export default startWeeklyUnlockJob
