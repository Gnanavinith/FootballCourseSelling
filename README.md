# FootballCourseSelling

Vanakkam Soccer Academy — Full-Stack Football Course Selling Platform with Weekly Drip Unlock, Razorpay Payments, Coupons & Discounts, Admin Management, and Automated Transactional & Broadcast Email System.

## Architecture & Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, React Router 7, Lucide Icons, Recharts
- **Backend**: Node.js, Express, MongoDB with Mongoose, Razorpay SDK, Nodemailer, Cloudinary, Node-Cron
- **Database**: MongoDB Atlas

## Project Structure

```
├── Client/             # React SPA (Vite + Tailwind v4)
├── Server/             # Express API (Modules, Services, Cron Jobs)
├── netlify.toml        # Netlify production build configuration
├── render.yaml         # Render production deployment configuration
└── README.md
```

## Features

- **Public Website**: Hero, Curriculum Preview, Coach Intro, Featured Courses, Testimonials, Mentorship Booking, FAQ
- **Course Catalog & Detail**: Interactive syllabus viewer/download, level filters, original MRP with discount badges, dynamic tuition calculations
- **Coupons & Promo Codes**: Percentage or flat discounts, max caps, usage limits, per-student limits, validation, and automated student email announcements
- **Secure Checkout**: Razorpay payment gateway integration with server-side validation and 100% discount free enrollments
- **Student Dashboard**: Enrolled courses, weekly drip curriculum unlocks, lesson video streaming with BunnyCDN/Cloudinary, progress tracking
- **Admin Panel**: Courses, Weekly Videos, Orders, Students, Coupons, Enquiries, Email System, and Notification Center

