import { useState, useEffect, useCallback } from 'react'

let addToast = null

export function ToastContainer() {
  const [toasts, setToasts] = useState([])

  addToast = useCallback((msg, type = 'success') => {
    const id = Date.now()
    setToasts(t => [...t, { id, msg, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500)
  }, [])

  if (!toasts.length) return null
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>{t.msg}</div>
      ))}
    </div>
  )
}

export const toast = {
  success: (msg) => addToast?.(msg, 'success'),
  error:   (msg) => addToast?.(msg, 'error'),
  info:    (msg) => addToast?.(msg, 'info'),
}
