import axios from 'axios'

// Backend runs on http://localhost:5100  (fixed via launchSettings.json)
// Swagger UI: http://localhost:5100
const BASE_URL = 'http://localhost:5100'

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' }
})

// Attach JWT on every request
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('zq_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

// 401 → clear auth and go to login
api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('zq_token')
      localStorage.removeItem('zq_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
export { BASE_URL }

// ── Auth  POST /api/auth/* ────────────────────────────────────────────────────
export const authApi = {
  register:    (d) => api.post('/auth/register', d),
  verifyPhone: (d) => api.post('/auth/verify-phone', d),
  resendOtp:   (d) => api.post('/auth/resend-otp', d),
  login:       (d) => api.post('/auth/login', d),
}

// ── User  /api/user/* ─────────────────────────────────────────────────────────
export const userApi = {
  getMe:    ()  => api.get('/user/me'),
  updateMe: (d) => api.put('/user/me', d),
}

// ── Search  /api/search/* ─────────────────────────────────────────────────────
export const searchApi = {
  nearby:          (d)         => api.post('/search/nearby', d),
  getSlots:        (pid, date) => api.get(`/search/slots/${pid}`, { params: { date } }),
  getServiceTypes: ()          => api.get('/search/service-types'),
}

// ── Provider  /api/provider/* ─────────────────────────────────────────────────
export const providerApi = {
  createProfile:   (d)        => api.post('/provider/profile', d),
  updateProfile:   (d)        => api.put('/provider/profile', d),
  getMyProfile:    ()         => api.get('/provider/profile/me'),
  updateStatus:    (avail)    => api.patch('/provider/status', { isAvailable: avail }),
  generateSlots:   (from, to) => api.post('/provider/slots/generate', { fromDate: from, toDate: to }),
  disableSlot:     (id, rsn)  => api.patch('/provider/slots/disable', { slotId: id, reason: rsn }),
  enableSlot:      (id)       => api.patch(`/provider/slots/enable/${id}`),
  getMySlots:      (date)     => api.get('/provider/slots', { params: date ? { date } : {} }),
  addLeave:        (d)        => api.post('/provider/leave', d),
  getBookings:     (st, dt)   => api.get('/provider/bookings', {
    params: { ...(st ? { status: st } : {}), ...(dt ? { date: dt } : {}) }
  }),
  getPublicProfile:(id)       => api.get(`/provider/${id}`),
}

// ── Booking  /api/booking/* ───────────────────────────────────────────────────
export const bookingApi = {
  create:        (d)     => api.post('/booking', d),
  getMyBookings: (st)    => api.get('/booking/my', { params: st ? { status: st } : {} }),
  cancel:        (id, r) => api.delete(`/booking/${id}`, { data: { reason: r } }),
  getDetail:     (id)    => api.get(`/booking/${id}`),
}

// ── Review  /api/review/* ─────────────────────────────────────────────────────
export const reviewApi = {
  create:             (d)  => api.post('/review', d),
  getProviderReviews: (id) => api.get(`/review/provider/${id}`),
}

// ── Admin  /api/admin/* ───────────────────────────────────────────────────────
export const adminApi = {
  getDashboard:        ()       => api.get('/admin/dashboard'),
  getPendingProviders: ()       => api.get('/admin/providers/pending'),
  getAllProviders:     (st)     => api.get('/admin/providers', { params: st ? { status: st } : {} }),
  approveProvider:    (id)     => api.post('/admin/providers/approve',      { providerId: id }),
  rejectProvider:     (id, r)  => api.post('/admin/providers/reject',       { providerId: id, reason: r }),
  grantBadge:         (id)     => api.post('/admin/providers/verify-badge', { providerId: id }),
  revokeBadge:        (id)     => api.post('/admin/providers/revoke-badge', { providerId: id }),
  getAllUsers:         (banned) => api.get('/admin/users', { params: banned !== undefined ? { banned } : {} }),
  banUser:            (uid, r) => api.post('/admin/users/ban',   { userId: uid, reason: r }),
  unbanUser:          (uid)    => api.post('/admin/users/unban', { userId: uid }),
  getAllBookings:      (st)     => api.get('/admin/bookings', { params: st ? { status: st } : {} }),
  completeBooking:    (id)     => api.post(`/admin/bookings/${id}/complete`),
}
