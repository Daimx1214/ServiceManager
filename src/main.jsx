import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'

import { AuthProvider } from './context/AuthContext'
import { ToastContainer } from './components/Toast'
import Navbar from './components/Navbar'

import LoginPage       from './pages/auth/LoginPage'
import RegisterPage    from './pages/auth/RegisterPage'
import VerifyPhonePage from './pages/auth/VerifyPhonePage'

import HomePage           from './pages/user/HomePage'
import ProviderDetailPage from './pages/user/ProviderDetailPage'
import MyBookingsPage     from './pages/user/MyBookingsPage'

import ProviderDashboard from './pages/provider/ProviderDashboard'
import ProviderSetup     from './pages/provider/ProviderSetup'
import ProviderSchedule  from './pages/provider/ProviderSchedule'
import ProviderBookings  from './pages/provider/ProviderBookings'

import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProviders from './pages/admin/AdminProviders'
import AdminUsers     from './pages/admin/AdminUsers'
import AdminBookings  from './pages/admin/AdminBookings'

// Guard reads localStorage directly — NOT React context.
// Reason: login() calls setState (async/batched in React 18), then navigate() fires
// immediately. If Guard read from context, it would see old state (isAuth=false) and
// redirect back to /login. localStorage.setItem is synchronous so it's always ready.
function Guard({ children, roles }) {
  const token = localStorage.getItem('zq_token')
  const user  = (() => {
    try { return JSON.parse(localStorage.getItem('zq_user')) } catch { return null }
  })()

  if (!token || !user) return <Navigate to="/login" replace />

  if (roles && !roles.includes(user.role)) {
    const home = user.role === 'Admin' ? '/admin'
               : user.role === 'Provider' ? '/p/dashboard'
               : '/'
    return <Navigate to={home} replace />
  }
  return children
}

function App() {
  const token = localStorage.getItem('zq_token')
  const user  = (() => {
    try { return JSON.parse(localStorage.getItem('zq_user')) } catch { return null }
  })()
  const home = !user ? '/login'
             : user.role === 'Admin'    ? '/admin'
             : user.role === 'Provider' ? '/p/dashboard'
             : '/'

  return (
    <>
      <Navbar />
      <div className="main-content">
        <Routes>
          <Route path="/login"    element={token ? <Navigate to={home} replace /> : <LoginPage />} />
          <Route path="/register" element={token ? <Navigate to={home} replace /> : <RegisterPage />} />
          <Route path="/verify"   element={<VerifyPhonePage />} />

          <Route path="/"              element={<Guard roles={['User']}><HomePage /></Guard>} />
          <Route path="/provider/:id"  element={<Guard roles={['User']}><ProviderDetailPage /></Guard>} />
          <Route path="/my-bookings"   element={<Guard roles={['User']}><MyBookingsPage /></Guard>} />

          <Route path="/p/dashboard" element={<Guard roles={['Provider']}><ProviderDashboard /></Guard>} />
          <Route path="/p/setup"     element={<Guard roles={['Provider']}><ProviderSetup /></Guard>} />
          <Route path="/p/schedule"  element={<Guard roles={['Provider']}><ProviderSchedule /></Guard>} />
          <Route path="/p/bookings"  element={<Guard roles={['Provider']}><ProviderBookings /></Guard>} />

          <Route path="/admin"           element={<Guard roles={['Admin']}><AdminDashboard /></Guard>} />
          <Route path="/admin/providers" element={<Guard roles={['Admin']}><AdminProviders /></Guard>} />
          <Route path="/admin/users"     element={<Guard roles={['Admin']}><AdminUsers /></Guard>} />
          <Route path="/admin/bookings"  element={<Guard roles={['Admin']}><AdminBookings /></Guard>} />

          <Route path="*" element={<Navigate to={token ? home : '/login'} replace />} />
        </Routes>
      </div>
      <ToastContainer />
    </>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </AuthProvider>
)
