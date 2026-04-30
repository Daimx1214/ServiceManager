import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { providerApi } from '../../services/api'
import { toast } from '../../components/Toast'

const fmtTime = (t) => t ? t.substring(0, 5) : ''
const todayStr = () => new Date().toISOString().split('T')[0]

export default function ProviderDashboard() {
  const [provider, setProvider] = useState(null)
  const [bookings, setBookings] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [toggling, setToggling] = useState(false)

  useEffect(() => {
    Promise.all([providerApi.getMyProfile(), providerApi.getBookings()])
      .then(([pr, br]) => { setProvider(pr.data); setBookings(br.data || []) })
      .catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false))
  }, [])

  const toggle = async () => {
    if (!provider) return
    setToggling(true)
    try {
      await providerApi.updateStatus(!provider.isAvailable)
      setProvider(p => ({ ...p, isAvailable: !p.isAvailable }))
      toast.success(`Status: ${!provider.isAvailable ? 'Available' : 'Busy'}`)
    } catch { toast.error('Failed to update') }
    finally { setToggling(false) }
  }

  if (loading) return <div className="loading-wrap"><div className="spinner" /></div>

  if (!provider) return (
    <div className="page-md" style={{ textAlign: 'center', paddingTop: 80 }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🏪</div>
      <h2 style={{ fontWeight: 700, marginBottom: 8 }}>Setup Your Profile</h2>
      <p className="text-muted mb-16">Create your provider profile to start accepting bookings</p>
      <Link to="/p/setup" className="btn btn-primary">Setup Now</Link>
    </div>
  )

  const today = bookings.filter(b => b.slotDate?.startsWith(todayStr()))
  const stats = [
    { icon: '📅', label: "Today's", value: today.length, bg: '#f5f3ff' },
    { icon: '✅', label: 'Active', value: bookings.filter(b => b.status === 'Confirmed').length, bg: '#eff6ff' },
    { icon: '🏆', label: 'Completed', value: bookings.filter(b => b.status === 'Completed').length, bg: '#f0fdf4' },
    { icon: '👥', label: 'Clients', value: new Set(bookings.map(b => b.userName)).size, bg: '#fff7ed' },
  ]

  return (
    <div className="page">
      {/* Header */}
      <div className="flex-between mb-24 flex-wrap" style={{ gap: 12 }}>
        <div>
          <div className="page-title">{provider.businessName}</div>
          <div className="page-sub">{provider.serviceType} · {provider.address}</div>
          <div className="text-sm text-muted">
            🕐 {fmtTime(provider.workingHoursStart)} – {fmtTime(provider.workingHoursEnd)}
          </div>
          {provider.status === 'Pending' && (
            <div className="info-box warning mt-8">⏳ Pending admin approval</div>
          )}
          {provider.status === 'Rejected' && (
            <div className="info-box danger mt-8">❌ Profile rejected by admin</div>
          )}
        </div>
        {provider.status === 'Approved' && (
          <button className={`btn btn-sm ${provider.isAvailable ? 'btn-success' : 'btn-outline'}`}
            onClick={toggle} disabled={toggling}>
            {provider.isAvailable ? '🟢 Available' : '🔴 Busy'}
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid-4 mb-24">
        {stats.map(s => (
          <div key={s.label} className="card stat-card" style={{ background: s.bg, borderColor: 'transparent' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid-3 mb-24">
        {[
          { to: '/p/schedule', icon: '📅', label: 'Manage Schedule', sub: 'Generate & control slots' },
          { to: '/p/bookings', icon: '👥', label: 'View Bookings',   sub: 'Manage appointments' },
          { to: '/p/setup',    icon: '✏️', label: 'Edit Profile',    sub: 'Update your info' },
        ].map(l => (
          <Link key={l.to} to={l.to} style={{ textDecoration: 'none' }}>
            <div className="card" style={{ textAlign: 'center', cursor: 'pointer', transition: 'box-shadow .2s' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow)'}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{l.icon}</div>
              <div style={{ fontWeight: 600 }}>{l.label}</div>
              <div className="text-sm text-muted mt-4">{l.sub}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Today's schedule */}
      <div className="card">
        <div style={{ fontWeight: 700, marginBottom: 16 }}>📋 Today's Schedule</div>
        {today.length === 0 ? (
          <div className="empty" style={{ padding: 20 }}>
            <div className="text-muted">No bookings today</div>
          </div>
        ) : (
          [...today].sort((a, b) => a.startTime.localeCompare(b.startTime)).map(b => (
            <div key={b.id} className="flex-between" style={{ padding: '10px 0', borderBottom: '1px solid var(--gray-100)' }}>
              <div className="flex" style={{ gap: 12 }}>
                <span style={{ fontWeight: 700, fontFamily: 'monospace', width: 50, fontSize: 13 }}>{b.startTime}</span>
                <span style={{ fontWeight: 600 }}>{b.userName}</span>
              </div>
              <span className="badge badge-green">{b.status}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
