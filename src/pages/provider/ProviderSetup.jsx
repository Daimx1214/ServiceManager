import { useState, useEffect } from 'react'
import { providerApi } from '../../services/api'
import { toast } from '../../components/Toast'

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
const SERVICE_TYPES = ['Barber','Doctor','Dentist','Physiotherapist','Salon','Veterinarian','Eye Specialist','Skin Specialist','Nutritionist','Psychologist','Other']
const toTime = (t) => t ? t.substring(0,5) : ''

export default function ProviderSetup() {
  const [form, setForm] = useState({
    businessName:'', serviceType: SERVICE_TYPES[0], description:'',
    address:'', latitude:0, longitude:0,
    workingDays:'Mon,Tue,Wed,Thu,Fri',
    workingHoursStart:'09:00', workingHoursEnd:'17:00',
    slotDurationMinutes:30, bufferMinutes:5, lateTolerationMinutes:10
  })
  const [isEdit,  setIsEdit]  = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)

  useEffect(() => {
    providerApi.getMyProfile()
      .then(r => {
        const p = r.data
        if (p) {
          setForm({
            businessName: p.businessName || '',
            serviceType:  p.serviceType  || SERVICE_TYPES[0],
            description:  p.description  || '',
            address:      p.address      || '',
            latitude:     p.latitude     || 0,
            longitude:    p.longitude    || 0,
            workingDays:  p.workingDays  || 'Mon,Tue,Wed,Thu,Fri',
            workingHoursStart:    toTime(p.workingHoursStart)  || '09:00',
            workingHoursEnd:      toTime(p.workingHoursEnd)    || '17:00',
            slotDurationMinutes:  p.slotDurationMinutes  || 30,
            bufferMinutes:        p.bufferMinutes        || 5,
            lateTolerationMinutes:p.lateTolerationMinutes|| 10,
          })
          setIsEdit(true)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const toggleDay = (d) => {
    const arr = form.workingDays.split(',').filter(Boolean)
    set('workingDays', arr.includes(d) ? arr.filter(x => x !== d).join(',') : [...arr, d].join(','))
  }

  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      p => { set('latitude', p.coords.latitude); set('longitude', p.coords.longitude); toast.success('Location set!') },
      () => toast.error('Location denied')
    )
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!form.latitude || !form.longitude) { toast.error('Please set location'); return }
    setSaving(true)
    try {
      if (isEdit) {
        const { serviceType: _, ...payload } = form
        await providerApi.updateProfile(payload)
        toast.success('Profile updated!')
      } else {
        await providerApi.createProfile(form)
        toast.success('Profile created! Awaiting approval.')
        setIsEdit(true)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed')
    } finally { setSaving(false) }
  }

  if (loading) return <div className="loading-wrap"><div className="spinner" /></div>

  return (
    <div className="page-md">
      <div className="page-title">{isEdit ? 'Edit Profile' : 'Setup Profile'}</div>
      <div className="page-sub">Tell customers about your service</div>

      <form onSubmit={submit}>
        <div className="card mb-16">
          <div style={{ fontWeight: 700, marginBottom: 16 }}>Business Info</div>
          <div className="form-group">
            <label>Business Name *</label>
            <input value={form.businessName} onChange={e => set('businessName', e.target.value)}
              placeholder="e.g. Ahmed's Barber Shop" required />
          </div>
          <div className="form-group">
            <label>Service Type {isEdit && <span className="text-muted text-xs">(cannot change)</span>}</label>
            <select value={form.serviceType} onChange={e => set('serviceType', e.target.value)} disabled={isEdit}>
              {SERVICE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="Describe your services..." rows={3} />
          </div>
          <div className="form-group">
            <label>Address *</label>
            <input value={form.address} onChange={e => set('address', e.target.value)}
              placeholder="Full address" required />
          </div>
          <div className="form-group">
            <label>Location Coordinates *</label>
            <div className="grid-2" style={{ gap: 10, marginBottom: 10 }}>
              <input type="number" step="any" placeholder="Latitude"
                value={form.latitude || ''} onChange={e => set('latitude', parseFloat(e.target.value) || 0)} />
              <input type="number" step="any" placeholder="Longitude"
                value={form.longitude || ''} onChange={e => set('longitude', parseFloat(e.target.value) || 0)} />
            </div>
            <button type="button" className="btn btn-outline btn-sm" onClick={getLocation}>📍 Use My Location</button>
          </div>
        </div>

        <div className="card mb-16">
          <div style={{ fontWeight: 700, marginBottom: 16 }}>Working Hours & Slots</div>
          <div className="grid-2 mb-16">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Start Time</label>
              <input type="time" value={form.workingHoursStart} onChange={e => set('workingHoursStart', e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>End Time</label>
              <input type="time" value={form.workingHoursEnd} onChange={e => set('workingHoursEnd', e.target.value)} />
            </div>
          </div>
          <div className="grid-3 mb-16">
            {[
              { k: 'slotDurationMinutes', label: 'Slot Duration', opts: [15,20,30,45,60] },
              { k: 'bufferMinutes',       label: 'Buffer',        opts: [0,5,10,15] },
              { k: 'lateTolerationMinutes', label: 'Late Tolerance', opts: [5,10,15,20] },
            ].map(f => (
              <div key={f.k} className="form-group" style={{ marginBottom: 0 }}>
                <label>{f.label}</label>
                <select value={form[f.k]} onChange={e => set(f.k, Number(e.target.value))}>
                  {f.opts.map(v => <option key={v} value={v}>{v} min</option>)}
                </select>
              </div>
            ))}
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Working Days</label>
            <div className="days-grid mt-4">
              {DAYS.map(d => (
                <button key={d} type="button"
                  className={`day-btn ${form.workingDays.includes(d) ? 'active' : ''}`}
                  onClick={() => toggleDay(d)}>{d}</button>
              ))}
            </div>
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-full" disabled={saving}>
          {saving ? 'Saving...' : isEdit ? 'Update Profile' : 'Create Profile'}
        </button>
      </form>
    </div>
  )
}
