import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../../services/api'
import { toast } from '../../components/Toast'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm]     = useState({ fullName: '', email: '', password: '', phoneNumber: '', role: 'User' })
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await authApi.register(form)
      toast.success('Registered! Verify your phone.')
      navigate('/verify', { state: { userId: data.userId, otp: data.otp, email: form.email } })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-box">ZQ</div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Create Account</h1>
          <p className="text-muted text-sm mt-4">Join ZenQueue today</p>
        </div>

        <div className="card">
          <form onSubmit={submit}>
            <div className="form-group">
              <label>Full Name</label>
              <input placeholder="John Doe" value={form.fullName}
                onChange={e => set('fullName', e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="you@example.com" value={form.email}
                onChange={e => set('email', e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input placeholder="+92 300 1234567" value={form.phoneNumber}
                onChange={e => set('phoneNumber', e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Password (min 6 chars)</label>
              <input type="password" placeholder="••••••••" value={form.password}
                onChange={e => set('password', e.target.value)} required minLength={6} />
            </div>
            <div className="form-group">
              <label>Account Type</label>
              <div className="grid-2" style={{ gap: 10 }}>
                {['User', 'Provider'].map(r => (
                  <button key={r} type="button"
                    onClick={() => set('role', r)}
                    style={{
                      padding: '12px', borderRadius: 10, border: `2px solid ${form.role === r ? 'var(--primary)' : 'var(--gray-200)'}`,
                      background: form.role === r ? 'var(--primary-light)' : 'var(--white)',
                      color: form.role === r ? 'var(--primary)' : 'var(--gray-700)',
                      fontWeight: 600, cursor: 'pointer', fontSize: 14
                    }}>
                    {r === 'User' ? '👤 Customer' : '🏪 Provider'}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-8">
              <button className="btn btn-primary btn-full" disabled={loading}>
                {loading ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          </form>

          <hr className="divider" />
          <p className="text-sm text-muted" style={{ textAlign: 'center' }}>
            Have an account? <Link to="/login" className="text-primary" style={{ fontWeight: 600 }}>Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
