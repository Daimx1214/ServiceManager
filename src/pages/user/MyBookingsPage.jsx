import { useState, useEffect } from 'react'
import { bookingApi } from '../../services/api'
import { toast } from '../../components/Toast'

const STATUS = { Confirmed:'badge-green', Completed:'badge-blue', Cancelled:'badge-red', AutoCancelled:'badge-gray' }

export default function MyBookingsPage() {
  const [bookings,  setBookings]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [filter,    setFilter]    = useState('')
  const [cancelling,setCancelling]= useState(null)

  const load = async () => {
    try {
      const { data } = await bookingApi.getMyBookings(filter || undefined)
      setBookings(data || [])
    } catch { toast.error('Failed to load bookings') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [filter])

  const cancel = async (id) => {
    if (!confirm('Cancel this booking?')) return
    setCancelling(id)
    try {
      await bookingApi.cancel(id, 'User cancelled')
      toast.success('Booking cancelled')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancel failed')
    } finally { setCancelling(null) }
  }

  return (
    <div className="page-md">
      <div className="page-title">My Bookings</div>
      <div className="page-sub">All your appointments</div>

      <div className="flex-wrap mb-16">
        {['', 'Confirmed', 'Completed', 'Cancelled'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline'}`}>
            {f || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-wrap"><div className="spinner" /></div>
      ) : bookings.length === 0 ? (
        <div className="empty"><div className="empty-icon">📅</div><div>No bookings found</div></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {bookings.map(b => (
            <div key={b.id} className="card" style={{ padding: 16 }}>
              <div className="flex-between flex-wrap" style={{ gap: 12 }}>
                <div>
                  <div className="flex-wrap" style={{ gap: 8, marginBottom: 6 }}>
                    <span style={{ fontWeight: 700, fontSize: 16 }}>{b.providerName}</span>
                    <span className={`badge ${STATUS[b.status] || 'badge-gray'}`}>{b.status}</span>
                  </div>
                  <div className="text-sm text-primary" style={{ fontWeight: 600, marginBottom: 4 }}>{b.serviceType}</div>
                  <div className="text-sm text-muted">
                    📅 {new Date(b.slotDate).toLocaleDateString()} &nbsp;
                    🕐 {b.startTime} – {b.endTime}
                  </div>
                  {b.notes && <div className="text-sm text-muted mt-4">💬 {b.notes}</div>}
                </div>
                {b.status === 'Confirmed' && (
                  <button className="btn btn-danger btn-sm"
                    onClick={() => cancel(b.id)} disabled={cancelling === b.id}>
                    {cancelling === b.id ? 'Cancelling...' : 'Cancel'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
