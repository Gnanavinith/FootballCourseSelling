import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext.jsx'
import Navbar from './components/layout/Navbar.jsx'
import Footer from './components/landing/Footer.jsx'
import FloatingContact from './components/layout/FloatingContact.jsx'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import ResetPassword from './pages/ResetPassword.jsx'
import Contact from './pages/Contact.jsx'
import Courses from './pages/Courses.jsx'
import CourseDetail from './pages/CourseDetail.jsx'
import About from './pages/About.jsx'
import Notifications from './pages/Notifications.jsx'
import Admin from './pages/admin/Admin.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AdminCourses from './pages/admin/AdminCourses.jsx'
import AdminVideos from './pages/admin/AdminVideos.jsx'
import AdminStudents from './pages/admin/AdminStudents.jsx'
import AdminOrders from './pages/admin/AdminOrders.jsx'
import AdminCoupons from './pages/admin/AdminCoupons.jsx'
import AdminEnquiries from './pages/admin/AdminEnquiries.jsx'
import AdminEmails from './pages/admin/AdminEmails.jsx'
import AdminSettings from './pages/admin/AdminSettings.jsx'
import AdminPaymentRequests from './pages/AdminPaymentRequests.jsx'
import AdminNotifications from './pages/admin/AdminNotifications.jsx'
import StudentDashboard from './pages/StudentDashboard.jsx'
import Watch from './pages/Watch.jsx'
import Payments from './pages/Payments.jsx'
import ManualPayment from './pages/ManualPayment.jsx'
import FillForm from './pages/FillForm.jsx'
import MyCourses from './pages/MyCourses.jsx'
import Profile from './pages/Profile.jsx'
import ScrollReveal from './components/ScrollReveal.jsx'

const readUser = () => {
  try { return JSON.parse(localStorage.getItem('user') || 'null') } catch { return null }
}

const isAdmin = (u) => ['superadmin', 'admin'].includes(u?.role)

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

/* Protects student-only routes. Requires authentication; admins are redirected home. */
function StudentRoute({ children }) {
  const [user, setUser] = useState(readUser)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const u = readUser()
    setUser(u)
    setReady(true)
  }, [])

  if (!ready) return null

  if (!user) return <Navigate to="/login" replace={{ state: { from: { pathname: '/dashboard' } } }} />
  if (isAdmin(user)) return <Navigate to="/admin" replace />

  return <>{children}</>
}

function Shell() {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')
  return (
    <>
      {!isAdminRoute && <Navbar />}
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:slug" element={<CourseDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/notifications" element={<Notifications />} />

        {/* Student routes (authenticated students only) */}
        <Route
          path="/dashboard"
          element={
            <StudentRoute>
              <StudentDashboard />
            </StudentRoute>
          }
        />
        <Route
          path="/my-courses"
          element={
            <StudentRoute>
              <MyCourses />
            </StudentRoute>
          }
        />
        <Route
          path="/watch/:courseId"
          element={
            <StudentRoute>
              <Watch />
            </StudentRoute>
          }
        />
        <Route
          path="/payments"
          element={
            <StudentRoute>
              <Payments />
            </StudentRoute>
          }
        />
        <Route
          path="/manual-payment"
          element={
            <StudentRoute>
              <ManualPayment />
            </StudentRoute>
          }
        />
        <Route path="/Fill-form" element={<FillForm />} />
        <Route
          path="/profile"
          element={
            <StudentRoute>
              <Profile />
            </StudentRoute>
          }
        />

        <Route path="/admin" element={<Admin />}>
          <Route index element={<AdminDashboard />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="courses" element={<AdminCourses />} />
          <Route path="videos" element={<AdminVideos />} />
          <Route path="students" element={<AdminStudents />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="enquiries" element={<AdminEnquiries />} />
          <Route path="emails" element={<AdminEmails />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="payments" element={<AdminPaymentRequests />} />
        </Route>
      </Routes>
      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <FloatingContact />}
    </>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <ScrollReveal />
        <Shell />
      </BrowserRouter>
    </ThemeProvider>
  )
}
