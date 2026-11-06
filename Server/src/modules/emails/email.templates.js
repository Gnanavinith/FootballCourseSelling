/**
 * Vanakkam Soccer: Default Email Templates Definition
 * Code defaults are loaded whenever there is no database override.
 */

export const DEFAULT_TEMPLATES = {
  // ==========================================
  // AUTH
  // ==========================================
  welcome: {
    key: 'welcome',
    name: 'Welcome to Vanakkam Soccer',
    category: 'AUTH',
    subject: 'Welcome to Vanakkam Soccer',
    preheader: 'Your professional football training journey starts now.',
    requiredVariables: ['name', 'loginUrl'],
    sampleData: {
      name: 'Vinith',
      loginUrl: 'https://vanakkamsoccer.com/login',
    },
    blocks: [
      {
        type: 'heading',
        level: 'h1',
        text: 'Welcome to Vanakkam Soccer, {{name}}!',
      },
      {
        type: 'paragraph',
        text: 'We are thrilled to have you in the academy. Whether you are building first-touch confidence or tactical match sharpness, our curriculum is engineered to take your game to the next level.',
      },
      {
        type: 'note',
        text: 'All masterclass videos, training playbooks, and coach analysis are available inside your student portal.',
      },
      {
        type: 'button',
        label: 'Log in to Academy',
        url: '{{loginUrl}}',
      },
      {
        type: 'paragraph',
        text: 'If you have questions, reply directly to this email or reach us on WhatsApp anytime.',
      },
    ],
  },

  verify_email: {
    key: 'verify_email',
    name: 'Verify Email Address',
    category: 'AUTH',
    subject: 'Confirm your email address',
    preheader: 'Please verify your email address to activate your account.',
    requiredVariables: ['name', 'verifyUrl'],
    sampleData: {
      name: 'Vinith',
      verifyUrl: 'https://vanakkamsoccer.com/verify-email?token=xyz123',
    },
    blocks: [
      {
        type: 'heading',
        level: 'h1',
        text: 'Confirm your email address',
      },
      {
        type: 'paragraph',
        text: 'Hi {{name}}, please verify your email address by clicking the button below. This link is valid for 24 hours.',
      },
      {
        type: 'button',
        label: 'Verify Email',
        url: '{{verifyUrl}}',
      },
      {
        type: 'note',
        text: 'If you did not sign up for Vanakkam Soccer, please ignore this email.',
      },
    ],
  },

  password_reset: {
    key: 'password_reset',
    name: 'Password Reset Request',
    category: 'AUTH',
    subject: 'Reset your password',
    preheader: 'Use this secure link to choose a new password.',
    requiredVariables: ['name', 'resetUrl'],
    sampleData: {
      name: 'Vinith',
      resetUrl: 'https://vanakkamsoccer.com/reset-password?token=sec_abc123',
      expiresIn: '30 minutes',
    },
    blocks: [
      {
        type: 'heading',
        level: 'h1',
        text: 'Reset your password',
      },
      {
        type: 'paragraph',
        text: 'Hi {{name}}, we received a request to reset the password for your Vanakkam Soccer account. Click the button below to choose a new password.',
      },
      {
        type: 'button',
        label: 'Reset Password',
        url: '{{resetUrl}}',
      },
      {
        type: 'note',
        text: 'This link is single-use and will expire in 30 minutes. If you did not make this request, you can safely ignore this email — your account remains secure.',
      },
    ],
  },

  password_changed: {
    key: 'password_changed',
    name: 'Password Changed Notice',
    category: 'AUTH',
    subject: 'Your password was changed',
    preheader: 'Security notice regarding your Vanakkam Soccer account.',
    requiredVariables: ['name'],
    sampleData: {
      name: 'Vinith',
      supportEmail: 'support@vanakkamsoccer.com',
    },
    blocks: [
      {
        type: 'heading',
        level: 'h1',
        text: 'Your password was changed',
      },
      {
        type: 'paragraph',
        text: 'Hi {{name}}, this is a confirmation that the password for your Vanakkam Soccer account was successfully changed.',
      },
      {
        type: 'note',
        text: 'If you did not make this change, please contact us immediately at {{supportEmail}} to secure your account.',
      },
    ],
  },

  // ==========================================
  // PAYMENTS
  // ==========================================
  payment_receipt: {
    key: 'payment_receipt',
    name: 'Payment Receipt (Student)',
    category: 'PAYMENTS',
    subject: 'Payment received: {{course.title}}',
    preheader: 'Your payment was successful and Week 1 is now available.',
    requiredVariables: ['name', 'course.title', 'orderId', 'paymentId', 'amount', 'date', 'startUrl'],
    sampleData: {
      name: 'Vinith',
      'course.title': 'Complete Grassroots Football Masterclass',
      orderId: 'ORD-78912',
      paymentId: 'pay_ABC123XYZ',
      amount: '₹1,999',
      date: '12 Nov 2026, 6:30 PM IST',
      startUrl: 'https://vanakkamsoccer.com/watch/6ae1a9d630316d02e153222d',
    },
    blocks: [
      {
        type: 'heading',
        level: 'h1',
        text: 'Payment Received',
      },
      {
        type: 'paragraph',
        text: 'Hi {{name}}, thank you for your payment. You are now enrolled in {{course.title}}. Week 1 has been unlocked and is ready to stream.',
      },
      {
        type: 'details',
        items: [
          { label: 'Course', value: '{{course.title}}' },
          { label: 'Order ID', value: '{{orderId}}' },
          { label: 'Payment ID', value: '{{paymentId}}' },
          { label: 'Amount Paid', value: '{{amount}}' },
          { label: 'Date', value: '{{date}}' },
        ],
      },
      {
        type: 'button',
        label: 'Start Week 1',
        url: '{{startUrl}}',
      },
      {
        type: 'note',
        text: 'Each subsequent week will unlock automatically every 7 days. You will receive an email as soon as each module becomes available.',
      },
    ],
  },

  payment_failed: {
    key: 'payment_failed',
    name: 'Payment Failed Notice',
    category: 'PAYMENTS',
    subject: 'Your payment did not go through',
    preheader: 'There was a problem processing your course payment.',
    requiredVariables: ['name', 'course.title', 'retryUrl'],
    sampleData: {
      name: 'Vinith',
      'course.title': 'Complete Grassroots Football Masterclass',
      retryUrl: 'https://vanakkamsoccer.com/courses/complete-grassroots',
    },
    blocks: [
      {
        type: 'heading',
        level: 'h1',
        text: 'Payment not completed',
      },
      {
        type: 'paragraph',
        text: 'Hi {{name}}, your recent attempt to purchase {{course.title}} could not be completed. Your card or bank was not charged.',
      },
      {
        type: 'button',
        label: 'Return to Course',
        url: '{{retryUrl}}',
      },
      {
        type: 'note',
        text: 'You can retry the transaction using UPI, card, or net banking. If the amount was debited from your account, it will automatically reverse within 3 to 5 business days.',
      },
    ],
  },

  refund_processed: {
    key: 'refund_processed',
    name: 'Refund Processed',
    category: 'PAYMENTS',
    subject: 'Refund processed for {{course.title}}',
    preheader: 'Your refund has been initiated and course access stopped.',
    requiredVariables: ['name', 'course.title', 'amount'],
    sampleData: {
      name: 'Vinith',
      'course.title': 'Complete Grassroots Football Masterclass',
      amount: '₹1,999',
      refundId: 'rfnd_987654',
    },
    blocks: [
      {
        type: 'heading',
        level: 'h1',
        text: 'Refund processed',
      },
      {
        type: 'paragraph',
        text: 'Hi {{name}}, we have processed a refund of {{amount}} for {{course.title}}. Course access has now stopped.',
      },
      {
        type: 'note',
        text: 'The refunded amount should reflect in your original payment method within 5 to 7 business days, depending on your bank.',
      },
    ],
  },

  manual_payment_receipt: {
    key: 'manual_payment_receipt',
    name: 'Manual Payment Receipt',
    category: 'PAYMENTS',
    subject: 'Payment received: {{course.title}}',
    preheader: 'Your manual payment has been recorded and approved.',
    requiredVariables: ['name', 'course.title', 'amount', 'startWeek', 'startUrl'],
    sampleData: {
      name: 'Vinith',
      'course.title': 'Complete Grassroots Football Masterclass',
      amount: '₹1,999',
      referenceId: 'UPI-REF-5544',
      startWeek: '1',
      startUrl: 'https://vanakkamsoccer.com/my-courses',
    },
    blocks: [
      {
        type: 'heading',
        level: 'h1',
        text: 'Payment Approved',
      },
      {
        type: 'paragraph',
        text: 'Hi {{name}}, your manual payment for {{course.title}} has been approved by the academy admin. Your enrollment is now active from Week {{startWeek}}.',
      },
      {
        type: 'details',
        items: [
          { label: 'Course', value: '{{course.title}}' },
          { label: 'Amount', value: '{{amount}}' },
          { label: 'Reference', value: '{{referenceId}}' },
          { label: 'Active Week', value: 'Week {{startWeek}}' },
        ],
      },
      {
        type: 'button',
        label: 'Open Training Library',
        url: '{{startUrl}}',
      },
    ],
  },

  // ==========================================
  // COURSE ACCESS
  // ==========================================
  manual_enrollment: {
    key: 'manual_enrollment',
    name: 'Manual Enrollment (Complimentary)',
    category: 'COURSE ACCESS',
    subject: 'You are enrolled: {{course.title}}',
    preheader: 'You have been enrolled in {{course.title}}.',
    requiredVariables: ['name', 'course.title', 'startUrl'],
    sampleData: {
      name: 'Vinith',
      'course.title': 'Tactical Vision & Scanning Masterclass',
      startUrl: 'https://vanakkamsoccer.com/my-courses',
    },
    blocks: [
      {
        type: 'heading',
        level: 'h1',
        text: 'You are enrolled!',
      },
      {
        type: 'paragraph',
        text: 'Hi {{name}}, our coaching staff has enrolled you in {{course.title}}. Your training sessions are ready inside your academy library.',
      },
      {
        type: 'button',
        label: 'Go to Course',
        url: '{{startUrl}}',
      },
    ],
  },

  week_unlocked: {
    key: 'week_unlocked',
    name: 'Weekly Module Unlocked',
    category: 'COURSE ACCESS',
    subject: 'Week {{week.number}} is now open: {{course.title}}',
    preheader: 'Your next week of football coaching has unlocked.',
    requiredVariables: ['name', 'course.title', 'week.number', 'watchUrl'],
    sampleData: {
      name: 'Vinith',
      'course.title': 'Complete Grassroots Football Masterclass',
      'week.number': '2',
      'week.title': 'First Touch Under Pressure',
      watchUrl: 'https://vanakkamsoccer.com/watch/6ae1a9d630316d02e153222d',
    },
    blocks: [
      {
        type: 'heading',
        level: 'h1',
        text: 'Week {{week.number}} is now open',
      },
      {
        type: 'paragraph',
        text: 'Hi {{name}}, your new training module for {{course.title}} is now active. Log in to watch the drill breakdowns and match study videos.',
      },
      {
        type: 'button',
        label: 'Watch Week {{week.number}}',
        url: '{{watchUrl}}',
      },
      {
        type: 'note',
        text: 'Remember to practice the ball-mastery drills daily before moving to the tactical match scenarios.',
      },
    ],
  },

  week_ending_soon: {
    key: 'week_ending_soon',
    name: 'Week Ending Soon (24h Reminder)',
    category: 'COURSE ACCESS',
    subject: 'Week {{week.number}} closes tomorrow',
    preheader: '24 hours remaining to complete your weekly training.',
    requiredVariables: ['name', 'course.title', 'week.number', 'watchUrl'],
    sampleData: {
      name: 'Vinith',
      'course.title': 'Complete Grassroots Football Masterclass',
      'week.number': '2',
      watchUrl: 'https://vanakkamsoccer.com/watch/6ae1a9d630316d02e153222d',
    },
    blocks: [
      {
        type: 'heading',
        level: 'h1',
        text: 'Week {{week.number}} closes tomorrow',
      },
      {
        type: 'paragraph',
        text: 'Hi {{name}}, Week {{week.number}} of {{course.title}} will close in approximately 24 hours. The next weekly module will unlock immediately after.',
      },
      {
        type: 'button',
        label: 'Finish Week {{week.number}} Lessons',
        url: '{{watchUrl}}',
      },
    ],
  },

  course_completed: {
    key: 'course_completed',
    name: 'Course Completed',
    category: 'COURSE ACCESS',
    subject: 'You have completed {{course.title}}',
    preheader: 'Congratulations on completing your entire training curriculum!',
    requiredVariables: ['name', 'course.title', 'dashboardUrl'],
    sampleData: {
      name: 'Vinith',
      'course.title': 'Complete Grassroots Football Masterclass',
      dashboardUrl: 'https://vanakkamsoccer.com/dashboard',
    },
    blocks: [
      {
        type: 'heading',
        level: 'h1',
        text: 'Masterclass Completed!',
      },
      {
        type: 'paragraph',
        text: 'Congratulations {{name}}! You have officially completed all weekly modules in {{course.title}}. Applying these fundamentals on the pitch will set you apart in every match.',
      },
      {
        type: 'button',
        label: 'View Athlete Dashboard',
        url: '{{dashboardUrl}}',
      },
      {
        type: 'note',
        text: 'Keep training consistently. Feel free to explore other specialized positional and tactical tracks in the academy.',
      },
    ],
  },

  schedule_changed: {
    key: 'schedule_changed',
    name: 'Schedule Adjusted by Admin',
    category: 'COURSE ACCESS',
    subject: 'Schedule updated: {{course.title}}',
    preheader: 'Your training timeline has been adjusted by the academy.',
    requiredVariables: ['name', 'course.title', 'changeDetails', 'dashboardUrl'],
    sampleData: {
      name: 'Vinith',
      'course.title': 'Complete Grassroots Football Masterclass',
      changeDetails: 'Your access has been extended by 7 days.',
      dashboardUrl: 'https://vanakkamsoccer.com/dashboard',
    },
    blocks: [
      {
        type: 'heading',
        level: 'h1',
        text: 'Training Schedule Updated',
      },
      {
        type: 'paragraph',
        text: 'Hi {{name}}, your course schedule for {{course.title}} has been updated by the coaching team.',
      },
      {
        type: 'note',
        text: '{{changeDetails}}',
      },
      {
        type: 'button',
        label: 'Check My Schedule',
        url: '{{dashboardUrl}}',
      },
    ],
  },

  // ==========================================
  // ENQUIRIES AND BOOKINGS
  // ==========================================
  enquiry_received_user: {
    key: 'enquiry_received_user',
    name: 'Enquiry Auto-Reply (User)',
    category: 'ENQUIRIES AND BOOKINGS',
    subject: 'We received your enquiry',
    preheader: 'Thank you for contacting Vanakkam Soccer. We reply within one business day.',
    requiredVariables: ['name', 'subject'],
    sampleData: {
      name: 'Vinith',
      subject: 'Inquiry about U-16 Advanced Tactical Drills',
    },
    blocks: [
      {
        type: 'heading',
        level: 'h1',
        text: 'We received your enquiry',
      },
      {
        type: 'paragraph',
        text: 'Hi {{name}}, thank you for reaching out regarding "{{subject}}". A coach or support coordinator will review your question and respond within one business day.',
      },
      {
        type: 'note',
        text: 'For immediate questions regarding tournament preparation or trial sessions, message us directly on WhatsApp.',
      },
    ],
  },

  enquiry_new_admin: {
    key: 'enquiry_new_admin',
    name: 'New Enquiry Alert (Admin)',
    category: 'ENQUIRIES AND BOOKINGS',
    subject: 'New enquiry: {{enquiry.subject}}',
    preheader: 'New student question received on the website.',
    requiredVariables: ['name', 'email', 'phone', 'enquiry.subject', 'message'],
    sampleData: {
      name: 'Vinith',
      email: 'vinith@example.com',
      phone: '+91 98765 43210',
      'enquiry.subject': 'Trial session query',
      message: 'Can I attend the weekend grassroots session in Chennai?',
      whatsAppLink: 'https://wa.me/919876543210',
    },
    blocks: [
      {
        type: 'heading',
        level: 'h1',
        text: 'New Website Enquiry',
      },
      {
        type: 'details',
        items: [
          { label: 'From', value: '{{name}}' },
          { label: 'Email', value: '{{email}}' },
          { label: 'Phone', value: '{{phone}}' },
          { label: 'Subject', value: '{{enquiry.subject}}' },
        ],
      },
      {
        type: 'paragraph',
        text: '<strong>Message:</strong><br>{{message}}',
      },
      {
        type: 'button',
        label: 'Chat on WhatsApp',
        url: '{{whatsAppLink}}',
      },
    ],
  },

  enquiry_reply: {
    key: 'enquiry_reply',
    name: 'Enquiry Reply (Admin to User)',
    category: 'ENQUIRIES AND BOOKINGS',
    subject: 'Re: {{enquiry.subject}}',
    preheader: 'Response from the Vanakkam Soccer Coaching Staff.',
    requiredVariables: ['name', 'replyMessage'],
    sampleData: {
      name: 'Vinith',
      'enquiry.subject': 'Trial session query',
      replyMessage: 'Hi Vinith, our weekend trial sessions take place on Saturday at 7:00 AM at the YMCA Grounds. Please bring boots and a water bottle.',
    },
    blocks: [
      {
        type: 'heading',
        level: 'h1',
        text: 'Response from Vanakkam Soccer',
      },
      {
        type: 'paragraph',
        text: 'Hi {{name}},',
      },
      {
        type: 'paragraph',
        text: '{{replyMessage}}',
      },
      {
        type: 'note',
        text: 'You can reply directly to this email if you need any additional details.',
      },
    ],
  },

  booking_confirmation_user: {
    key: 'booking_confirmation_user',
    name: 'Booking Confirmation (User)',
    category: 'ENQUIRIES AND BOOKINGS',
    subject: 'Booking confirmed: {{booking.serviceName}}',
    preheader: 'Your football training session has been confirmed.',
    requiredVariables: ['name', 'booking.serviceName', 'date', 'time'],
    sampleData: {
      name: 'Vinith',
      'booking.serviceName': '1-on-1 Tactical Assessment',
      date: '15 Nov 2026',
      time: '6:30 AM IST',
      location: 'Main Turf Grounds, Chennai',
    },
    blocks: [
      {
        type: 'heading',
        level: 'h1',
        text: 'Training Session Confirmed',
      },
      {
        type: 'paragraph',
        text: 'Hi {{name}}, your training appointment for {{booking.serviceName}} has been scheduled.',
      },
      {
        type: 'details',
        items: [
          { label: 'Session', value: '{{booking.serviceName}}' },
          { label: 'Date', value: '{{date}}' },
          { label: 'Time', value: '{{time}}' },
          { label: 'Location', value: '{{location}}' },
        ],
      },
      {
        type: 'note',
        text: 'Please arrive 10 minutes prior to session time with standard match gear and hydration.',
      },
    ],
  },

  booking_new_admin: {
    key: 'booking_new_admin',
    name: 'New Booking Alert (Admin)',
    category: 'ENQUIRIES AND BOOKINGS',
    subject: 'New booking from {{booking.name}}',
    preheader: 'A new session booking has been scheduled.',
    requiredVariables: ['booking.name', 'booking.serviceName', 'date', 'time'],
    sampleData: {
      'booking.name': 'Vinith',
      'booking.serviceName': '1-on-1 Tactical Assessment',
      date: '15 Nov 2026',
      time: '6:30 AM IST',
      phone: '+91 98765 43210',
      email: 'vinith@example.com',
    },
    blocks: [
      {
        type: 'heading',
        level: 'h1',
        text: 'New Training Booking',
      },
      {
        type: 'details',
        items: [
          { label: 'Student', value: '{{booking.name}}' },
          { label: 'Service', value: '{{booking.serviceName}}' },
          { label: 'Date & Time', value: '{{date}}, {{time}}' },
          { label: 'Contact', value: '{{phone}} ({{email}})' },
        ],
      },
    ],
  },

  booking_reminder: {
    key: 'booking_reminder',
    name: 'Booking Reminder (24h Prior)',
    category: 'ENQUIRIES AND BOOKINGS',
    subject: 'Reminder: Your training session tomorrow',
    preheader: 'Reminder: Your Vanakkam Soccer coaching session is tomorrow.',
    requiredVariables: ['name', 'booking.serviceName', 'date', 'time'],
    sampleData: {
      name: 'Vinith',
      'booking.serviceName': '1-on-1 Tactical Assessment',
      date: 'Tomorrow, 15 Nov 2026',
      time: '6:30 AM IST',
      location: 'Main Turf Grounds, Chennai',
    },
    blocks: [
      {
        type: 'heading',
        level: 'h1',
        text: 'Session Reminder: Tomorrow',
      },
      {
        type: 'paragraph',
        text: 'Hi {{name}}, this is a quick reminder about your upcoming {{booking.serviceName}} tomorrow.',
      },
      {
        type: 'details',
        items: [
          { label: 'Time', value: '{{time}}' },
          { label: 'Location', value: '{{location}}' },
        ],
      },
    ],
  },

  // ==========================================
  // ADMIN AND SYSTEM
  // ==========================================
  admin_daily_digest: {
    key: 'admin_daily_digest',
    name: 'Admin Daily Digest (08:00 IST)',
    category: 'ADMIN AND SYSTEM',
    subject: 'Daily academy digest — {{date}}',
    preheader: '24-hour summary of students, orders, revenue and inquiries.',
    requiredVariables: ['date', 'newStudents', 'ordersCount', 'revenue', 'pendingEnquiries', 'failedEmails'],
    sampleData: {
      date: '12 Nov 2026',
      newStudents: '5',
      ordersCount: '3',
      revenue: '₹5,997',
      pendingEnquiries: '2',
      failedEmails: '0',
    },
    blocks: [
      {
        type: 'heading',
        level: 'h1',
        text: 'Daily Academy Digest',
      },
      {
        type: 'details',
        items: [
          { label: 'New Registered Students', value: '{{newStudents}}' },
          { label: 'Completed Orders', value: '{{ordersCount}}' },
          { label: 'Total Revenue', value: '{{revenue}}' },
          { label: 'Pending Enquiries', value: '{{pendingEnquiries}}' },
          { label: 'Failed Emails', value: '{{failedEmails}}' },
        ],
      },
      {
        type: 'button',
        label: 'Open Admin Dashboard',
        url: 'https://vanakkamsoccer.com/admin',
      },
    ],
  },

  admin_alert: {
    key: 'admin_alert',
    name: 'System Alert (Urgent Admin)',
    category: 'ADMIN AND SYSTEM',
    subject: 'System alert: {{alert.title}}',
    preheader: 'Urgent system notification from Vanakkam Soccer backend.',
    requiredVariables: ['alert.title', 'alert.details', 'timestamp'],
    sampleData: {
      'alert.title': 'Email Delivery Exhausted Retries',
      'alert.details': 'Payment receipt for order ORD-123 failed after 4 retry attempts. Error: Connection timeout.',
      timestamp: '12 Nov 2026, 7:15 PM IST',
    },
    blocks: [
      {
        type: 'heading',
        level: 'h1',
        text: 'Alert: {{alert.title}}',
      },
      {
        type: 'note',
        text: '{{alert.details}}',
      },
      {
        type: 'paragraph',
        text: 'Logged at: {{timestamp}}',
      },
    ],
  },

  // ==========================================
  // ANNOUNCEMENTS
  // ==========================================
  broadcast: {
    key: 'broadcast',
    name: 'Academy Broadcast Announcement',
    category: 'ANNOUNCEMENTS',
    subject: '{{subject}}',
    preheader: 'Announcement from Vanakkam Soccer Academy.',
    requiredVariables: ['name', 'subject', 'body'],
    sampleData: {
      name: 'Vinith',
      subject: 'New Tournament Preparation Drills Released',
      body: 'We have just added 5 new tournament tactical analysis videos to your courses. Log in now to study the defensive transition concepts.',
      actionLabel: 'View Course Videos',
      actionUrl: 'https://vanakkamsoccer.com/my-courses',
    },
    blocks: [
      {
        type: 'heading',
        level: 'h1',
        text: '{{subject}}',
      },
      {
        type: 'paragraph',
        text: 'Hi {{name}},',
      },
      {
        type: 'paragraph',
        text: '{{body}}',
      },
      {
        type: 'button',
        label: '{{actionLabel}}',
        url: '{{actionUrl}}',
      },
    ],
  },

  coupon_announcement: {
    key: 'coupon_announcement',
    name: 'Special Coupon Announcement',
    category: 'ANNOUNCEMENTS',
    subject: 'Special Offer: Use coupon {{couponCode}} for {{discountText}} off!',
    preheader: 'Unlock professional football training with an exclusive academy discount.',
    requiredVariables: ['name', 'couponCode', 'discountText', 'expiryText', 'actionUrl'],
    sampleData: {
      name: 'Vinith',
      couponCode: 'VANAKKAM50',
      discountText: '50% OFF',
      expiryText: 'Valid until 30 Nov 2026',
      actionUrl: 'https://vanakkamsoccer.com/courses',
    },
    blocks: [
      {
        type: 'heading',
        level: 'h1',
        text: 'Special Academy Discount: {{discountText}}',
      },
      {
        type: 'paragraph',
        text: 'Hi {{name}}, we have launched a special discount code for you to level up your match sharpness with our professional football training masterclasses.',
      },
      {
        type: 'note',
        text: 'Coupon Code: {{couponCode}}\nDiscount: {{discountText}}\n{{expiryText}}',
      },
      {
        type: 'button',
        label: 'Explore Courses & Apply Coupon',
        url: '{{actionUrl}}',
      },
      {
        type: 'paragraph',
        text: 'Enter this code at checkout to claim your savings. If you have any questions or need guidance picking a course, feel free to reply directly to this email.',
      },
    ],
  },
}

