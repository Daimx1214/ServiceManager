import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminApi } from '../../services/api'
import { toast } from '../../components/Toast'

export default function AdminDashboard() {
  const [stats,   setStats]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi.getDashboard()
      .then(r => setStats(r.data))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading-wrap"><div className="spinner" /></div>
  if (!stats)  return null

  const cards = [
    { icon:'👥', label:'Total Users',       value: stats.totalUsers,       bg:'#eff6ff' },
    { icon:'🏪', label:'Total Providers',   value: stats.totalProviders,   bg:'#f5f3ff' },
    { icon:'⏳', label:'Pending Approvals', value: stats.pendingApprovals, bg:'#fefce8', urgent: stats.pendingApprovals > 0 },
    { icon:'📅', label:'Total Bookings',    value: stats.totalBookings,    bg:'#f0f9ff' },
    { icon:'✅', label:'Active Bookings',   value: stats.activeBookings,   bg:'#f0fdf4' },
    { icon:'🚫', label:'Banned Accounts',   value: stats.bannedAccounts,   bg:'#fff1f2' },
  ]

  return (
    <div className="page">
      <div className="page-title">Admin Dashboard</div>
      <div className="page-sub">System overview and management</div>

      <div className="grid-3 mb-24">
        {cards.map(c => (
          <div key={c.label} className="card stat-card"
            style={{ background: c.bg, borderColor: c.urgent ? 'var(--warning)' : 'transparent', borderWidth: c.urgent ? 2 : 1 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>{c.icon}</div>
            <div className="stat-value" style={{ color: c.urgent ? 'var(--warning)' : 'var(--gray-900)' }}>{c.value}</div>
            <div className="stat-label">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="grid-3">
        {[
          { to:'/admin/providers', icon:'🏪', label:'Manage Providers', sub: stats.pendingApprovals > 0 ? `${stats.pendingApprovals} pending` : 'Approve/reject' },
          { to:'/admin/users',     icon:'👥', label:'Manage Users',     sub: stats.bannedAccounts > 0 ? `${stats.bannedAccounts} banned` : 'Ban/unban users' },
          { to:'/admin/bookings',  icon:'📅', label:'All Bookings',     sub: `${stats.activeBookings} active` },
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
    </div>
  )
}
