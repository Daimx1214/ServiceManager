import { useState, useEffect } from 'react'
import { adminApi } from '../../services/api'
import { toast } from '../../components/Toast'

export default function AdminUsers() {
  const [users,    setUsers]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [filter,   setFilter]   = useState('all')
  const [acting,   setActing]   = useState(null)
  const [banModal, setBanModal] = useState(null)
  const [reason,   setReason]   = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const banned = filter === 'all' ? undefined : filter === 'banned'
      const { data } = await adminApi.getAllUsers(banned)
      setUsers(data || [])
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [filter])

  const doban = async () => {
    if (!banModal || !reason.trim()) { toast.error('Enter a reason'); return }
    setActing(banModal.id)
    try {
      await adminApi.banUser(banModal.id, reason.trim())
      toast.success('User banned')
      setBanModal(null); setReason(''); load()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setActing(null) }
  }

  const unban = async (uid) => {
    setActing(uid)
    try { await adminApi.unbanUser(uid); toast.success('User unbanned'); load() }
    catch { toast.error('Failed') }
    finally { setActing(null) }
  }

  const filtered = users.filter(u =>
    u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page">
      <div className="page-title">Users</div>
      <div className="page-sub">Manage user accounts</div>

      <div className="flex-wrap mb-16" style={{ gap: 10 }}>
        <input placeholder="🔍 Search..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200 }} />
        {['all','active','banned'].map(f => (
          <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilter(f)} style={{ textTransform: 'capitalize' }}>{f}</button>
        ))}
      </div>

      <div className="flex-wrap mb-16 text-sm text-muted" style={{ gap: 16 }}>
        <span>Total: <strong>{users.length}</strong></span>
        <span style={{ color:'var(--success)' }}>Active: <strong>{users.filter(u => !u.isBanned).length}</strong></span>
        <span style={{ color:'var(--danger)' }}>Banned: <strong>{users.filter(u => u.isBanned).length}</strong></span>
      </div>

      {loading ? (
        <div className="loading-wrap"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty"><div className="empty-icon">👥</div><div>No users found</div></div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {filtered.map(u => (
            <div key={u.id} className="card" style={{ padding:14, background: u.isBanned ? '#fff5f5' : 'var(--white)' }}>
              <div className="flex-between flex-wrap" style={{ gap:10 }}>
                <div className="flex" style={{ gap:12 }}>
                  <div style={{
                    width:40, height:40, borderRadius:'50%', flexShrink:0,
                    background: u.isBanned ? 'var(--danger)' : 'var(--primary)',
                    color:'#fff', display:'flex', alignItems:'center', justifyContent:'center',
                    fontWeight:700, fontSize:16
                  }}>
                    {u.fullName?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex-wrap" style={{ gap:6, marginBottom:3 }}>
                      <span style={{ fontWeight:700 }}>{u.fullName}</span>
                      <span className={`badge ${u.role==='Admin'?'badge-purple':u.role==='Provider'?'badge-blue':'badge-gray'}`}>{u.role}</span>
                      {u.isBanned && <span className="badge badge-red">🚫 Banned</span>}
                      {!u.isVerified && <span className="badge badge-yellow">⚠ Unverified</span>}
                    </div>
                    <div className="text-sm text-muted">{u.email}</div>
                  </div>
                </div>

                {u.role !== 'Admin' && (
                  u.isBanned
                    ? <button className="btn btn-success btn-sm" disabled={acting === u.id} onClick={() => unban(u.id)}>
                        ✓ Unban
                      </button>
                    : <button className="btn btn-danger btn-sm" disabled={acting === u.id}
                        onClick={() => setBanModal({ id: u.id, name: u.fullName })}>
                        🚫 Ban
                      </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ban Modal */}
      {banModal && (
        <div className="modal-overlay" onClick={() => setBanModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight:700, fontSize:18, marginBottom:4 }}>Ban User</div>
            <div className="text-muted mb-16">{banModal.name}</div>
            <div className="form-group">
              <label>Reason *</label>
              <textarea rows={3} placeholder="e.g. Fake bookings, abuse..." value={reason}
                onChange={e => setReason(e.target.value)} />
            </div>
            <div className="grid-2" style={{ gap:10, marginTop:16 }}>
              <button className="btn btn-outline btn-full" onClick={() => { setBanModal(null); setReason('') }}>Cancel</button>
              <button className="btn btn-danger btn-full" disabled={!reason.trim() || acting === banModal.id} onClick={doban}>
                {acting === banModal.id ? 'Banning...' : 'Confirm Ban'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
