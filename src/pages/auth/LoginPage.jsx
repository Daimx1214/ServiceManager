import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { authApi } from '../../services/api'
import { toast } from '../../components/Toast'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [form, setForm]       = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await authApi.login(form)

      const u = {
        id:         data.userId,
        fullName:   data.fullName,
        role:       data.role,
        isVerified: data.isVerified
      }

      // Step 1: localStorage.setItem is SYNCHRONOUS — token is written immediately
      login(data.token, u)

      // Step 2: navigate() fires — React Router changes URL
      // Guard reads from localStorage (not React context),
      // so it finds the token that was just written in Step 1
      // and renders the correct page without any race condition
      const dest = data.role === 'Admin'    ? '/admin'
                 : data.role === 'Provider' ? '/p/dashboard'
                 : '/'

      toast.success(`Welcome, ${data.fullName}!`)
      navigate(dest, { replace: true })

    } catch (err) {
      const d = err.response?.data
      toast.error(d?.message || 'Login failed. Please check your credentials.')
      setLoading(false)
      if (d?.needsVerification) {
        navigate('/verify')
      }
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-box">ZQ</div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Welcome Back</h1>
          <p className="text-muted text-sm mt-4">Sign in to your ZenQueue account</p>
        </div>

        <div className="card">
          <form onSubmit={submit}>
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="you@example.com"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                autoComplete="email" required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPwd ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  style={{ paddingRight: 44 }}
                  autoComplete="current-password"
                  required
                />
                <button type="button" onClick={() => setShowPwd(s => !s)}
                  style={{ position: 'absolute', right: 12, top: '50%',
                           transform: 'translateY(-50%)', background: 'none',
                           border: 'none', cursor: 'pointer',
                           color: 'var(--gray-400)', fontSize: 18, padding: 0 }}>
                  {showPwd ? '🙈' : '👁'}
                </button>
              </div>
            </div>
            <div className="mt-8">
              <button className="btn btn-primary btn-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </div>
          </form>

          <hr className="divider" />
          <p className="text-sm text-muted" style={{ textAlign: 'center' }}>
            No account?{' '}
            <Link to="/register" className="text-primary" style={{ fontWeight: 600 }}>
              Register
            </Link>
          </p>
          <div className="info-box warning mt-8">
            <strong>Admin:</strong> admin@zenqueue.com / Admin@123
          </div>
        </div>
      </div>
    </div>
  )
}
