import { useState, useEffect } from 'react'
import { adminApi } from '../../services/api'
import { toast } from '../../components/Toast'

const STATUS_BADGE = { Approved:'badge-green', Pending:'badge-yellow', Rejected:'badge-red', Banned:'badge-gray' }

export default function AdminProviders() {
  const [providers, setProviders] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [filter,    setFilter]    = useState('')
  const [search,    setSearch]    = useState('')
  const [acting,    setActing]    = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await adminApi.getAllProviders(filter || undefined)
      setProviders(data || [])
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [filter])

  const act = async (fn, msg) => {
    try { await fn(); toast.success(msg); load() }
    catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setActing(null) }
  }

  const filtered = providers.filter(p =>
    p.businessName?.toLowerCase().includes(search.toLowerCase()) ||
    p.serviceType?.toLowerCase().includes(search.toLowerCase()) ||
    p.ownerName?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page">
      <div className="page-title">Service Providers</div>
      <div className="page-sub">Approve, reject and manage providers</div>

      <div className="flex-wrap mb-16" style={{ gap: 10 }}>
        <input placeholder="🔍 Search..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200 }} />
        {['','Pending','Approved','Rejected','Banned'].map(s => (
          <button key={s} className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilter(s)}>{s || 'All'}</button>
        ))}
      </div>

      <div className="flex-wrap mb-16 text-sm text-muted" style={{ gap: 16 }}>
        <span>Total: <strong>{providers.length}</strong></span>
        <span style={{ color:'var(--warning)' }}>Pending: <strong>{providers.filter(p => p.status === 'Pending').length}</strong></span>
        <span style={{ color:'var(--success)' }}>Approved: <strong>{providers.filter(p => p.status === 'Approved').length}</strong></span>
      </div>

      {loading ? (
        <div className="loading-wrap"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty"><div className="empty-icon">🏪</div><div>No providers found</div></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(p => (
            <div key={p.id} className="card" style={{ padding: 16 }}>
              <div className="flex-between flex-wrap" style={{ gap: 12 }}>
                <div>
                  <div className="flex-wrap" style={{ gap: 8, marginBottom: 6 }}>
                    <span style={{ fontWeight: 700, fontSize: 16 }}>{p.businessName}</span>
                    {p.isVerifiedBadge && <span className="badge badge-blue">✓ Verified</span>}
                    <span className={`badge ${STATUS_BADGE[p.status] || 'badge-gray'}`}>{p.status}</span>
                  </div>
                  <div className="text-sm text-primary" style={{ fontWeight: 600, marginBottom: 4 }}>{p.serviceType}</div>
                  <div className="text-sm text-muted">
                    👤 {p.ownerName} · {p.ownerEmail}
                    {p.averageRating > 0 && ` · ⭐ ${p.averageRating?.toFixed(1)}`}
                  </div>
                </div>

                <div className="flex-wrap" style={{ gap: 6 }}>
                  {p.status === 'Pending' && (
                    <>
                      <button className="btn btn-success btn-sm" disabled={acting === p.id}
                        onClick={() => { setActing(p.id); act(() => adminApi.approveProvider(p.id), 'Provider approved!') }}>
                        ✓ Approve
                      </button>
                      <button className="btn btn-danger btn-sm" disabled={acting === p.id}
                        onClick={() => { setActing(p.id); act(() => adminApi.rejectProvider(p.id), 'Provider rejected') }}>
                        ✗ Reject
                      </button>
                    </>
                  )}
                  {p.status === 'Approved' && (
                    <>
                      {!p.isVerifiedBadge
                        ? <button className="btn btn-outline btn-sm" disabled={acting === p.id}
                            onClick={() => { setActing(p.id); act(() => adminApi.grantBadge(p.id), 'Badge granted!') }}>
                            🏅 Grant Badge
                          </button>
                        : <button className="btn btn-outline btn-sm" disabled={acting === p.id}
                            onClick={() => { setActing(p.id); act(() => adminApi.revokeBadge(p.id), 'Badge revoked') }}>
                            Remove Badge
                          </button>
                      }
                      <button className="btn btn-danger btn-sm" disabled={acting === p.id}
                        onClick={() => { setActing(p.id); act(() => adminApi.rejectProvider(p.id), 'Rejected') }}>
                        Reject
                      </button>
                    </>
                  )}
                  {p.status === 'Rejected' && (
                    <button className="btn btn-success btn-sm" disabled={acting === p.id}
                      onClick={() => { setActing(p.id); act(() => adminApi.approveProvider(p.id), 'Re-approved!') }}>
                      ✓ Re-Approve
                    </button>
                  )}
                  {acting === p.id && <div className="spinner" style={{ width:20, height:20, margin:0 }} />}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
