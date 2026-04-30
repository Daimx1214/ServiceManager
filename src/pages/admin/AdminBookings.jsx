import { useState, useEffect } from 'react'
import { adminApi } from '../../services/api'
import { toast } from '../../components/Toast'

const STATUS = { Confirmed:'badge-green', Completed:'badge-blue', Cancelled:'badge-red', AutoCancelled:'badge-gray' }

export default function AdminBookings() {
  const [bookings,  setBookings]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [filter,    setFilter]    = useState('')
  const [search,    setSearch]    = useState('')
  const [completing,setCompleting]= useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await adminApi.getAllBookings(filter || undefined)
      setBookings(data || [])
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [filter])

  const complete = async (id) => {
    setCompleting(id)
    try { await adminApi.completeBooking(id); toast.success('Booking completed'); load() }
    catch { toast.error('Failed') }
    finally { setCompleting(null) }
  }

  const filtered = bookings.filter(b =>
    b.userName?.toLowerCase().includes(search.toLowerCase()) ||
    b.providerName?.toLowerCase().includes(search.toLowerCase()) ||
    String(b.id).includes(search)
  )

  const stats = { confirmed: bookings.filter(b=>b.status==='Confirmed').length, completed: bookings.filter(b=>b.status==='Completed').length, cancelled: bookings.filter(b=>['Cancelled','AutoCancelled'].includes(b.status)).length }

  return (
    <div className="page">
      <div className="page-title">All Bookings</div>
      <div className="page-sub">Monitor and manage all bookings</div>

      <div className="grid-3 mb-24">
        {[['✅','Confirmed',stats.confirmed,'#f0fdf4'],['🏆','Completed',stats.completed,'#eff6ff'],['❌','Cancelled',stats.cancelled,'#fff1f2']].map(([icon,label,val,bg]) => (
          <div key={label} className="card stat-card" style={{ background:bg, borderColor:'transparent' }}>
            <div style={{ fontSize:24, marginBottom:8 }}>{icon}</div>
            <div className="stat-value">{val}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      <div className="flex-wrap mb-16" style={{ gap:10 }}>
        <input placeholder="🔍 Search user/provider/ID..." value={search}
          onChange={e => setSearch(e.target.value)} style={{ flex:1, minWidth:200 }} />
        {['','Confirmed','Completed','Cancelled','AutoCancelled'].map(s => (
          <button key={s} className={`btn btn-sm ${filter===s?'btn-primary':'btn-outline'}`}
            onClick={() => setFilter(s)}>{s || 'All'}</button>
        ))}
      </div>

      {loading ? (
        <div className="loading-wrap"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty"><div className="empty-icon">📅</div><div>No bookings</div></div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>#</th><th>User</th><th>Provider</th><th>Service</th><th>Date</th><th>Time</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {filtered.map(b => (
                  <tr key={b.id}>
                    <td>{b.id}</td>
                    <td style={{ fontWeight:600 }}>{b.userName}</td>
                    <td>{b.providerName}</td>
                    <td className="text-muted">{b.serviceType}</td>
                    <td>{new Date(b.slotDate).toLocaleDateString()}</td>
                    <td style={{ fontFamily:'monospace', fontSize:13 }}>{b.startTime}–{b.endTime}</td>
                    <td><span className={`badge ${STATUS[b.status]||'badge-gray'}`}>{b.status}</span></td>
                    <td>
                      {b.status === 'Confirmed' && (
                        <button className="btn btn-success btn-sm" disabled={completing===b.id}
                          onClick={() => complete(b.id)}>
                          {completing===b.id ? '...' : '✓ Complete'}
                        </button>
                      )}
                    </td>
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
