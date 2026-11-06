import { Enquiry } from './enquiry.model.js'
import { Notification } from '../notifications/notification.model.js'
import { emailService } from '../emails/email.service.js'
import { env } from '../../config/env.js'

export const enquiryService = {
  async create(body) {
    const { name, email, phone, subject, course, message, source = 'website' } = body
    if (!name || !email) throw new Error('Name and email are required')

    const cleanName = name.trim()
    const cleanEmail = email.trim()
    const cleanPhone = phone ? phone.trim() : ''
    const enquirySubject = (subject || course || 'General Course Enquiry').trim()
    const cleanMessage = (message || '').trim()

    const enquiry = await Enquiry.create({
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      subject: enquirySubject,
      course: course ? course.trim() : undefined,
      message: cleanMessage,
      source,
      status: 'New',
    })

    // Clean phone number for WhatsApp link
    const cleanPhoneDigits = cleanPhone.replace(/[^0-9]/g, '')
    const whatsAppLink = cleanPhoneDigits
      ? `https://wa.me/${cleanPhoneDigits.startsWith('91') ? cleanPhoneDigits : '91' + cleanPhoneDigits}?text=${encodeURIComponent(`Hi ${cleanName}, thank you for reaching out to Vanakkam Soccer regarding: ${enquirySubject}`)}`
      : 'https://wa.me/919361405307'

    // Fetch email settings to get admin recipient list
    const settings = await emailService.getSettings()
    const adminRecipients = (settings.adminRecipients && settings.adminRecipients.length > 0)
      ? settings.adminRecipients
      : [env.adminEmail || 'admin@vanakkamsoccer.com']

    const templateData = {
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone || 'Not given',
      subject: enquirySubject,
      'enquiry.subject': enquirySubject,
      enquiry: {
        subject: enquirySubject,
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone || 'Not given',
        message: cleanMessage || 'No message provided',
      },
      course: course ? course.trim() : enquirySubject,
      message: cleanMessage || 'No message provided',
      whatsAppLink,
    }

    // Auto-reply to customer: enquiry_received_user
    emailService
      .sendTemplate('enquiry_received_user', {
        to: cleanEmail,
        toName: cleanName,
        data: templateData,
        entityType: 'Enquiry',
        entityId: enquiry._id.toString(),
      })
      .catch((err) => console.error('[EnquiryService] User auto-reply error:', err))

    // Notification to all configured admin recipients: enquiry_new_admin
    for (const recipient of adminRecipients) {
      if (!recipient || !recipient.includes('@')) continue
      emailService
        .sendTemplate('enquiry_new_admin', {
          to: recipient.trim(),
          toName: 'Admin Team',
          replyTo: cleanEmail,
          data: templateData,
          entityType: 'Enquiry',
          entityId: enquiry._id.toString(),
        })
        .catch((err) => console.error(`[EnquiryService] Admin alert error for ${recipient}:`, err))
    }

    // In-app notification for admin panel
    Notification.create({
      audience: 'admin',
      type: 'enquiry',
      title: `New enquiry: ${cleanName}`,
      body: enquirySubject ? `${enquirySubject} - ${cleanMessage.slice(0, 80)}` : cleanMessage.slice(0, 80),
      link: '/admin/enquiries',
    }).catch((err) => console.error('[EnquiryService] Admin notif error:', err))

    return enquiry
  },

  async reply(id, replyMessage, adminUser = null) {
    const enquiry = await Enquiry.findById(id)
    if (!enquiry) throw new Error('Enquiry not found')
    if (!replyMessage || !replyMessage.trim()) throw new Error('Reply message is required')

    // Send professional enquiry_reply email
    await emailService.sendTemplate('enquiry_reply', {
      to: enquiry.email,
      toName: enquiry.name,
      data: {
        name: enquiry.name,
        'enquiry.subject': enquiry.subject || 'Course Enquiry',
        replyMessage: replyMessage.trim(),
        originalMessage: enquiry.message || '',
      },
      entityType: 'Enquiry',
      entityId: enquiry._id.toString(),
    })

    // Update status to Replied & record history
    enquiry.status = 'Replied'
    if (!enquiry.replies) enquiry.replies = []
    enquiry.replies.push({
      replyMessage: replyMessage.trim(),
      repliedBy: adminUser?.email || 'admin',
      repliedAt: new Date(),
    })
    const existingNote = enquiry.note ? enquiry.note + '\n\n' : ''
    enquiry.note = `${existingNote}[Email Replied on ${new Date().toLocaleDateString('en-IN')}]: ${replyMessage.trim()}`
    await enquiry.save()

    return enquiry
  },
}

export default enquiryService
