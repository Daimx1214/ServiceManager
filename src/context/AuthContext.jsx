import { createContext, useContext, useState } from 'react'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [user,  setUser]  = useState(() => {
    try { return JSON.parse(localStorage.getItem('zq_user')) } catch { return null }
  })
  const [token, setToken] = useState(() => localStorage.getItem('zq_token'))

  const login = (tok, u) => {
    // localStorage FIRST — synchronous, always ready before navigate() re-renders Guard
    localStorage.setItem('zq_token', tok)
    localStorage.setItem('zq_user', JSON.stringify(u))
    // setState after — async but Guard reads localStorage not context
    setToken(tok)
    setUser(u)
  }

  const logout = () => {
    localStorage.removeItem('zq_token')
    localStorage.removeItem('zq_user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthCtx.Provider value={{ user, token, login, logout, isAuth: !!token }}>
      {children}
    </AuthCtx.Provider>
  )
}

export const useAuth = () => useContext(AuthCtx)
