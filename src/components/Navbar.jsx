import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const LINKS = {
  User:     [{ to: '/',            label: 'Discover' }, { to: '/my-bookings', label: 'My Bookings' }],
  Provider: [{ to: '/p/dashboard', label: 'Dashboard' }, { to: '/p/schedule',  label: 'Schedule' },
             { to: '/p/bookings',  label: 'Bookings' },  { to: '/p/setup',     label: 'Profile' }],
  Admin:    [{ to: '/admin',          label: 'Dashboard' }, { to: '/admin/providers', label: 'Providers' },
             { to: '/admin/users',    label: 'Users' },     { to: '/admin/bookings',  label: 'Bookings' }],
}

export default function Navbar() {
  const { user, logout, isAuth } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const links = (user && LINKS[user.role]) || []

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <div className="logo-box">ZQ</div>
          ZenQueue
        </Link>

        <div className="navbar-links">
          {links.map(l => (
            <Link key={l.to} to={l.to}
              className={`nav-link ${location.pathname === l.to ? 'active' : ''}`}>
              {l.label}
            </Link>
          ))}
        </div>

        <div className="navbar-right">
          {isAuth ? (
            <>
              <div className="user-chip">
                <div className="user-avatar">{user?.fullName?.charAt(0).toUpperCase()}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{user?.fullName}</div>
                  <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{user?.role}</div>
                </div>
              </div>
              <button className="btn btn-outline btn-sm" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login"    className="btn btn-outline btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
