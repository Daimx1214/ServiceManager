import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchApi } from '../../services/api'
import { toast } from '../../components/Toast'

const EMOJI = { Barber:'✂️', Doctor:'🩺', Dentist:'🦷', Salon:'💇', Veterinarian:'🐾', Physiotherapist:'💪' }
const getEmoji = (t) => EMOJI[t] || '🏥'

export default function HomePage() {
  const navigate = useNavigate()
  const [providers,     setProviders]     = useState([])
  const [loading,       setLoading]       = useState(false)
  const [locating,      setLocating]      = useState(false)
  const [loc,           setLoc]           = useState(null)
  const [radius,        setRadius]        = useState(10)
  const [sType,         setSType]         = useState('')
  const [search,        setSearch]        = useState('')
  const [serviceTypes,  setServiceTypes]  = useState([])
  const [showManual,    setShowManual]     = useState(false)
  const [manualLat,     setManualLat]     = useState('')
  const [manualLng,     setManualLng]     = useState('')

  useEffect(() => {
    searchApi.getServiceTypes().then(r => setServiceTypes(r.data || [])).catch(() => {})
    getLocation()
  }, [])

  const getLocation = () => {
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        const l = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setLoc(l); setLocating(false)
        loadProviders(l.lat, l.lng, radius, sType)
      },
      () => {
        setLocating(false)
        // Don't auto-fallback — ask user to enter manually
        toast.info('Location access denied. Enter your coordinates manually.')
        setShowManual(true)
      }
    )
  }

  const applyManualLocation = () => {
    const lat = parseFloat(manualLat)
    const lng = parseFloat(manualLng)
    if (isNaN(lat) || isNaN(lng)) { toast.error('Enter valid latitude and longitude'); return }
    if (lat < -90 || lat > 90)    { toast.error('Latitude must be between -90 and 90'); return }
    if (lng < -180 || lng > 180)  { toast.error('Longitude must be between -180 and 180'); return }
    const l = { lat, lng }
    setLoc(l)
    setShowManual(false)
    toast.success('Location set!')
    loadProviders(lat, lng, radius, sType)
  }

  const loadProviders = async (lat, lng, r, st) => {
    setLoading(true)
    try {
      const { data } = await searchApi.nearby({
        latitude: lat, longitude: lng,
        radiusKm: r,
        serviceType: st || undefined
      })
      setProviders(data.results || [])
    } catch { toast.error('Failed to load providers') }
    finally { setLoading(false) }
  }

  useEffect(() => {
    if (loc) loadProviders(loc.lat, loc.lng, radius, sType)
  }, [radius, sType])

  const filtered = providers.filter(p =>
    p.businessName.toLowerCase().includes(search.toLowerCase()) ||
    p.serviceType.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page">
      <div className="flex-between mb-24 flex-wrap" style={{ gap: 12 }}>
        <div>
          <div className="page-title">Find Nearby Services</div>
          <div className="page-sub">Book appointments with providers near you</div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-outline" onClick={getLocation} disabled={locating}>
            📍 {locating ? 'Locating...' : 'My Location'}
          </button>
          <button className="btn btn-outline" onClick={() => setShowManual(s => !s)}>
            ✏️ Enter Manually
          </button>
        </div>
      </div>

      {/* Manual location input */}
      {showManual && (
        <div className="card mb-16" style={{ padding: 16, background: '#f5f3ff', borderColor: 'var(--primary)' }}>
          <div style={{ fontWeight: 600, marginBottom: 12 }}>📍 Enter Location Manually</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 10, alignItems: 'flex-end' }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--gray-500)', display: 'block', marginBottom: 4 }}>
                Latitude (e.g. 30.1575)
              </label>
              <input value={manualLat} onChange={e => setManualLat(e.target.value)}
                placeholder="30.1575" type="number" step="any" />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--gray-500)', display: 'block', marginBottom: 4 }}>
                Longitude (e.g. 71.5249)
              </label>
              <input value={manualLng} onChange={e => setManualLng(e.target.value)}
                placeholder="71.5249" type="number" step="any" />
            </div>
            <button className="btn btn-primary" onClick={applyManualLocation}>Search</button>
          </div>
          <p style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 8 }}>
            💡 Find your coordinates at{' '}
            <a href="https://www.latlong.net" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>
              latlong.net
            </a>
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="card mb-24" style={{ padding: 16 }}>
        <div className="flex-wrap" style={{ gap: 10 }}>
          <input placeholder="🔍 Search providers..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: 180 }} />
          <select value={sType} onChange={e => setSType(e.target.value)} style={{ width: 'auto' }}>
            <option value="">All Services</option>
            {serviceTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={radius} onChange={e => setRadius(Number(e.target.value))} style={{ width: 'auto' }}>
            {[2,5,10,20,50].map(r => <option key={r} value={r}>{r} km</option>)}
          </select>
        </div>
        {loc && (
          <p style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 8 }}>
            📍 Searching within {radius} km of {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}
          </p>
        )}
      </div>

      {!loc ? (
        <div className="empty">
          <div className="empty-icon">📍</div>
          <div style={{ fontWeight: 600 }}>Set your location to find providers</div>
          <div className="text-sm text-muted mt-8">
            Click "My Location" or "Enter Manually" above
          </div>
        </div>
      ) : loading ? (
        <div className="loading-wrap"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">📍</div>
          <div style={{ fontWeight: 600 }}>No providers found nearby</div>
          <div className="text-sm text-muted mt-8">Try increasing the radius or changing service type</div>
        </div>
      ) : (
        <div className="grid-3">
          {filtered.map(p => (
            <div key={p.id} className="provider-card" onClick={() => navigate(`/provider/${p.id}`)}>
              <div className="flex-between mb-16">
                <div className="provider-emoji">{getEmoji(p.serviceType)}</div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <span className={`badge ${p.isAvailable ? 'badge-green' : 'badge-red'}`}>
                    {p.isAvailable ? 'Available' : 'Busy'}
                  </span>
                  {p.isVerifiedBadge && <span className="badge badge-blue">✓ Verified</span>}
                </div>
              </div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 2 }}>{p.businessName}</div>
              <div className="text-sm text-primary" style={{ fontWeight: 600, marginBottom: 6 }}>{p.serviceType}</div>
              <div className="text-sm text-muted" style={{ marginBottom: 6 }}>📍 {p.address}</div>
              <div className="flex" style={{ gap: 12 }}>
                <span className="text-sm">⭐ {p.averageRating?.toFixed(1) || '–'} ({p.totalRatings})</span>
                <span className="text-sm text-primary" style={{ fontWeight: 600 }}>📍 {p.distanceKm} km</span>
              </div>
              <button className="btn btn-primary btn-full mt-16 btn-sm">View & Book</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
