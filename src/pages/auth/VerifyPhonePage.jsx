import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { authApi } from '../../services/api'
import { toast } from '../../components/Toast'

export default function VerifyPhonePage() {
  const navigate  = useNavigate()
  const { state } = useLocation()
  const [userId,   setUserId]   = useState(state?.userId || '')
  const [code,     setCode]     = useState('')
  const [loading,  setLoading]  = useState(false)
  const [resending,setResending]= useState(false)
  const [email,    setEmail]    = useState(state?.email || '')

  // state.otp is only set when email sending failed (fallback for testing)
  const fallbackOtp = state?.otp || null

  const submit = async (e) => {
    e.preventDefault()
    if (code.length !== 6) { toast.error('Enter all 6 digits'); return }
    setLoading(true)
    try {
      await authApi.verifyPhone({ userId, code })
      toast.success('Email verified! Please log in.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP')
    } finally { setLoading(false) }
  }

  const resend = async () => {
    if (!email) { toast.error('Enter your email to resend'); return }
    setResending(true)
    try {
      const { data } = await authApi.resendOtp({ email })
      if (data.emailSent) {
        toast.success(`New OTP sent to ${email}`)
      } else {
        toast.info('Email failed — OTP shown below')
        // Update page state so new OTP is shown
        navigate('/verify', { state: { userId: data.userId, email, otp: data.otp } })
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend')
    } finally { setResending(false) }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-box" style={{ background: 'var(--success)', fontSize: 24 }}>✉</div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Verify Your Email</h1>
          <p className="text-muted text-sm mt-4">
            Enter the 6-digit code sent to your email
          </p>
        </div>

        <div className="card">
          {/* Show OTP box only when email sending failed */}
          {fallbackOtp && (
            <div className="otp-box">
              <div className="text-sm text-muted mb-8" style={{ color: 'var(--warning)' }}>
                ⚠ Email not configured — OTP for testing:
              </div>
              <div className="otp-code">{fallbackOtp}</div>
              <div className="text-xs text-muted mt-8">
                To enable real email, set your Gmail credentials in appsettings.json
              </div>
            </div>
          )}

          <form onSubmit={submit}>
            {!state?.userId && (
              <div className="form-group">
                <label>User ID</label>
                <input placeholder="Paste userId from registration"
                  value={userId} onChange={e => setUserId(e.target.value)} required />
              </div>
            )}
            <div className="form-group">
              <label>6-Digit OTP Code</label>
              <input placeholder="000000" maxLength={6} value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                style={{ textAlign: 'center', fontSize: 26, fontWeight: 700, letterSpacing: 12 }}
                required />
              <small style={{ color: 'var(--gray-400)', fontSize: 12 }}>
                Check your inbox and spam folder
              </small>
            </div>
            <button className="btn btn-success btn-full mt-8" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>

          <hr className="divider" />

          {/* Resend section */}
          <div style={{ textAlign: 'center' }}>
            <p className="text-sm text-muted mb-8">Did not receive the code?</p>
            {!email ? (
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                <input placeholder="your@email.com" value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{ fontSize: 13, padding: '6px 12px', width: 200, borderRadius: 8 }} />
                <button className="btn btn-outline btn-sm" onClick={resend} disabled={resending}>
                  {resending ? 'Sending...' : '🔄 Resend'}
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="btn btn-outline btn-sm" onClick={resend} disabled={resending}>
                  {resending ? 'Sending...' : `🔄 Resend to ${email}`}
                </button>
                <button className="btn btn-outline btn-sm" onClick={() => navigate('/register')}>
                  ← Back to Register
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
