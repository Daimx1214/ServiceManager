import { useState, useEffect, useCallback } from 'react'
import { providerApi } from '../../services/api'
import { toast } from '../../components/Toast'

const fmtDate = (d) => d.toISOString().split('T')[0]
const addDays  = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r }

export default function ProviderSchedule() {
  const [slots,    setSlots]    = useState([])
  const [date,     setDate]     = useState(new Date())
  const [loading,  setLoading]  = useState(false)
  const [fromDate, setFromDate] = useState(fmtDate(new Date()))
  const [toDate,   setToDate]   = useState(fmtDate(addDays(new Date(), 6)))
  const [genLoading, setGenLoading] = useState(false)

  const loadSlots = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await providerApi.getMySlots(fmtDate(date))
      setSlots(data || [])
    } catch { setSlots([]) }
    finally { setLoading(false) }
  }, [date])

  useEffect(() => { loadSlots() }, [loadSlots])

  const generate = async () => {
    setGenLoading(true)
    try {
      const { data } = await providerApi.generateSlots(fromDate, toDate)
      toast.success(data.message || 'Slots generated!')
      loadSlots()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate')
    } finally { setGenLoading(false) }
  }

  const disable = async (id) => {
    const reason = prompt('Reason for disabling?', 'Break') || 'Unavailable'
    try {
      await providerApi.disableSlot(id, reason)
      toast.success('Slot disabled')
      setSlots(s => s.map(sl => sl.id === id ? { ...sl, isManuallyDisabled: true, isAvailable: false, disabledReason: reason } : sl))
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const enable = async (id) => {
    try {
      await providerApi.enableSlot(id)
      toast.success('Slot enabled')
      setSlots(s => s.map(sl => sl.id === id ? { ...sl, isManuallyDisabled: false, isAvailable: true, disabledReason: null } : sl))
    } catch { toast.error('Failed') }
  }

  const addLeave = async () => {
    const reason = prompt('Leave reason?', 'Leave') || 'Leave'
    try {
      const { data } = await providerApi.addLeave({ leaveDate: fmtDate(date), reason })
      toast.success(data.message || 'Leave added')
      loadSlots()
    } catch { toast.error('Failed') }
  }

  const avail    = slots.filter(s => s.isAvailable && !s.isManuallyDisabled).length
  const booked   = slots.filter(s => !s.isAvailable && !s.isManuallyDisabled).length
  const disabled = slots.filter(s => s.isManuallyDisabled).length

  return (
    <div className="page-md">
      <div className="page-title">Manage Schedule</div>
      <div className="page-sub">Generate slots and manage your availability</div>

      {/* Generate */}
      <div className="card mb-16">
        <div style={{ fontWeight: 700, marginBottom: 12 }}>Generate Slots</div>
        <div className="flex-wrap" style={{ gap: 10 }}>
          <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
            <label>From Date</label>
            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
          </div>
          <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
            <label>To Date</label>
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} />
          </div>
          <div style={{ alignSelf: 'flex-end' }}>
            <button className="btn btn-primary" onClick={generate} disabled={genLoading}>
              {genLoading ? 'Generating...' : '⚡ Generate'}
            </button>
          </div>
        </div>
      </div>

      {/* Date Navigator */}
      <div className="card mb-16">
        <div className="flex-between mb-12">
          <button className="btn btn-outline btn-sm btn-icon" onClick={() => setDate(d => addDays(d, -1))}>‹</button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 700 }}>{date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
            <div className="text-sm text-muted">{date.getFullYear()}</div>
          </div>
          <button className="btn btn-outline btn-sm btn-icon" onClick={() => setDate(d => addDays(d, 1))}>›</button>
        </div>
        <button className="btn btn-danger btn-full btn-sm" onClick={addLeave}>
          🚫 Mark as Leave / Full Day Off
        </button>
      </div>

      {/* Slots */}
      {loading ? (
        <div className="loading-wrap"><div className="spinner" /></div>
      ) : slots.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">📅</div>
          <div>No slots for this date</div>
          <div className="text-sm text-muted mt-8">Generate slots above</div>
        </div>
      ) : (
        <div className="card">
          <div className="flex-wrap mb-16" style={{ gap: 12 }}>
            <span className="badge badge-green">{avail} available</span>
            <span className="badge badge-blue">{booked} booked</span>
            <span className="badge badge-red">{disabled} disabled</span>
          </div>

          {slots.map(s => {
            const isBooked   = !s.isAvailable && !s.isManuallyDisabled
            const isDisabled = s.isManuallyDisabled
            const isAvail    = s.isAvailable && !s.isManuallyDisabled

            return (
              <div key={s.id}
                className={`schedule-row ${isBooked ? 'schedule-booked' : isDisabled ? 'schedule-disabled' : 'schedule-available'}`}>
                <div className="flex" style={{ gap: 12 }}>
                  <span style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: 14 }}>
                    {s.startTime} – {s.endTime}
                  </span>
                  {isBooked   && <span className="badge badge-blue">Booked</span>}
                  {isDisabled && <span className="badge badge-red">Disabled {s.disabledReason ? `(${s.disabledReason})` : ''}</span>}
                  {isAvail    && <span className="badge badge-green">Available</span>}
                </div>
                {!isBooked && (
                  <div>
                    {isAvail && (
                      <button className="btn btn-danger btn-sm" onClick={() => disable(s.id)}>🔒</button>
                    )}
                    {isDisabled && (
                      <button className="btn btn-success btn-sm" onClick={() => enable(s.id)}>🔓</button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
