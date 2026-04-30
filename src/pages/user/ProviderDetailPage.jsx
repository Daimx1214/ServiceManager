import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { providerApi, searchApi, bookingApi } from '../../services/api'
import { toast } from '../../components/Toast'

const fmtTime = (t) => t ? t.substring(0, 5) : ''
const fmtDate = (d) => { const dt = new Date(d); return dt.toISOString().split('T')[0] }
const addDays  = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r }
const Stars    = ({ n }) => Array.from({ length: 5 }, (_, i) =>
  <span key={i} className={i < n ? 'star' : 'star empty'}>★</span>)

export default function ProviderDetailPage() {
  const { id }  = useParams()
  const navigate = useNavigate()
  const [provider, setProvider]   = useState(null)
  const [slots,    setSlots]      = useState([])
  const [date,     setDate]       = useState(new Date())
  const [picked,   setPicked]     = useState(null)
  const [notes,    setNotes]      = useState('')
  const [loading,  setLoading]    = useState(true)
  const [booking,  setBooking]    = useState(false)

  useEffect(() => {
    providerApi.getPublicProfile(Number(id))
      .then(r => setProvider(r.data))
      .catch(() => { toast.error('Provider not found'); navigate('/') })
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!id) return
    searchApi.getSlots(Number(id), fmtDate(date))
      .then(r => setSlots(r.data || []))
      .catch(() => setSlots([]))
  }, [id, date])

  const book = async () => {
    if (!picked) return
    setBooking(true)
    try {
      await bookingApi.create({ timeSlotId: picked.id, notes: notes || undefined })
      toast.success('Booking confirmed! 🎉')
      setPicked(null); setNotes('')
      const r = await searchApi.getSlots(Number(id), fmtDate(date))
      setSlots(r.data || [])
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed')
    } finally { setBooking(false) }
  }

  if (loading) return <div className="loading-wrap"><div className="spinner" /></div>
  if (!provider) return null

  const reviews = provider.reviews || []

  return (
    <div className="page-md">
      <button className="btn btn-outline btn-sm mb-16" onClick={() => navigate('/')}>← Back</button>

      {/* Header */}
      <div className="card mb-16">
        <div className="flex-between flex-wrap" style={{ gap: 12 }}>
          <div className="flex" style={{ gap: 16 }}>
            <div style={{ fontSize: 40 }}>
              {provider.serviceType === 'Barber' ? '✂️' : provider.serviceType === 'Doctor' ? '🩺' : '🏥'}
            </div>
            <div>
              <div className="flex-wrap" style={{ gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 20, fontWeight: 700 }}>{provider.businessName}</span>
                {provider.isVerifiedBadge && <span className="badge badge-blue">✓ Verified</span>}
                <span className={`badge ${provider.isAvailable ? 'badge-green' : 'badge-red'}`}>
                  {provider.isAvailable ? 'Available' : 'Busy'}
                </span>
              </div>
              <div className="text-primary" style={{ fontWeight: 600 }}>{provider.serviceType}</div>
              <div className="text-sm text-muted mt-4">📍 {provider.address}</div>
              <div className="text-sm text-muted">
                🕐 {fmtTime(provider.workingHoursStart)} – {fmtTime(provider.workingHoursEnd)}
                &nbsp;·&nbsp; ⭐ {provider.averageRating?.toFixed(1)} ({provider.totalRatings} reviews)
              </div>
              {provider.description && <div className="text-sm text-muted mt-4">{provider.description}</div>}
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'start', gap: 16 }}>

        {/* Slot Picker */}
        <div className="card">
          <div style={{ fontWeight: 700, marginBottom: 16 }}>📅 Select Date & Time</div>

          {/* Date nav */}
          <div className="flex-between mb-16">
            <button className="btn btn-outline btn-sm btn-icon" onClick={() => setDate(d => addDays(d, -1))}>‹</button>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 600 }}>{date.toLocaleDateString('en-US', { weekday: 'long' })}</div>
              <div className="text-sm text-muted">{date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
            </div>
            <button className="btn btn-outline btn-sm btn-icon" onClick={() => setDate(d => addDays(d, 1))}>›</button>
          </div>

          {slots.length === 0 ? (
            <div className="empty" style={{ padding: 24 }}>
              <div>🕐</div><div className="text-sm text-muted mt-8">No slots for this date</div>
            </div>
          ) : (
            <>
              <div className="text-sm text-muted mb-8">{slots.length} slot{slots.length !== 1 ? 's' : ''} available</div>
              <div className="slot-grid">
                {slots.map(s => (
                  <button key={s.id} className={`slot-btn ${picked?.id === s.id ? 'selected' : ''}`}
                    onClick={() => setPicked(picked?.id === s.id ? null : s)}>
                    {s.startTime}
                  </button>
                ))}
              </div>
            </>
          )}

          {picked && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--gray-200)' }}>
              <div className="form-group">
                <label>Notes (optional)</label>
                <textarea rows={2} placeholder="Any requirements..." value={notes} onChange={e => setNotes(e.target.value)} />
              </div>
              <div style={{ background: 'var(--primary-light)', padding: 12, borderRadius: 8, marginBottom: 12 }}>
                <div style={{ fontWeight: 600, color: 'var(--primary)' }}>{picked.startTime} – {picked.endTime}</div>
                <div className="text-sm text-muted">{date.toLocaleDateString()}</div>
              </div>
              <button className="btn btn-primary btn-full" onClick={book} disabled={booking}>
                {booking ? 'Confirming...' : 'Confirm Booking'}
              </button>
            </div>
          )}
        </div>

        {/* Reviews */}
        <div className="card">
          <div style={{ fontWeight: 700, marginBottom: 16 }}>⭐ Reviews</div>
          {reviews.length === 0 ? (
            <div className="empty" style={{ padding: 16 }}>
              <div className="text-sm text-muted">No reviews yet</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 400, overflowY: 'auto' }}>
              {reviews.map(r => (
                <div key={r.id} style={{ paddingBottom: 12, borderBottom: '1px solid var(--gray-100)' }}>
                  <div className="flex-between">
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{r.userName}</span>
                    <Stars n={r.rating} />
                  </div>
                  {r.comment && <div className="text-sm text-muted mt-4">{r.comment}</div>}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
