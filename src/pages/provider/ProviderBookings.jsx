import { useState, useEffect } from 'react'
import { providerApi } from '../../services/api'
import { toast } from '../../components/Toast'

const STATUS = { Confirmed:'badge-green', Completed:'badge-blue', Cancelled:'badge-red', AutoCancelled:'badge-gray' }

export default function ProviderBookings() {
  const [bookings, setBookings] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [status,   setStatus]   = useState('')
  const [date,     setDate]     = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await providerApi.getBookings(status || undefined, date || undefined)
      setBookings(data || [])
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [status, date])

  const stats = {
    total:     bookings.length,
    confirmed: bookings.filter(b => b.status === 'Confirmed').length,
    completed: bookings.filter(b => b.status === 'Completed').length,
    cancelled: bookings.filter(b => ['Cancelled','AutoCancelled'].includes(b.status)).length,
  }

  return (
    <div className="page">
      <div className="page-title">My Bookings</div>
      <div className="page-sub">Customer appointments</div>

      {/* Stats */}
      <div className="grid-4 mb-24">
        {[['📊','Total',stats.total,'#f5f3ff'],['✅','Confirmed',stats.confirmed,'#f0fdf4'],
          ['🏆','Completed',stats.completed,'#eff6ff'],['❌','Cancelled',stats.cancelled,'#fff1f2']].map(([icon,label,val,bg]) => (
          <div key={label} className="card stat-card" style={{ background: bg, borderColor: 'transparent' }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
            <div className="stat-value">{val}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card mb-16" style={{ padding: 14 }}>
        <div className="flex-wrap" style={{ gap: 10 }}>
          <select value={status} onChange={e => setStatus(e.target.value)} style={{ width: 'auto' }}>
            <option value="">All Status</option>
            {['Confirmed','Completed','Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ width: 'auto' }} />
          {(status || date) && (
            <button className="btn btn-outline btn-sm" onClick={() => { setStatus(''); setDate('') }}>Clear</button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="loading-wrap"><div className="spinner" /></div>
      ) : bookings.length === 0 ? (
        <div className="empty"><div className="empty-icon">📅</div><div>No bookings found</div></div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th><th>Customer</th><th>Date</th><th>Time</th><th>Status</th><th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id}>
                    <td>{b.id}</td>
                    <td style={{ fontWeight: 600 }}>{b.userName}</td>
                    <td>{new Date(b.slotDate).toLocaleDateString()}</td>
                    <td style={{ fontFamily: 'monospace' }}>{b.startTime} – {b.endTime}</td>
                    <td><span className={`badge ${STATUS[b.status] || 'badge-gray'}`}>{b.status}</span></td>
                    <td className="text-muted">{b.notes || '–'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
