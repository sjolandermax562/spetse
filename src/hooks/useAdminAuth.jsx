import { createContext, useContext, useState, useCallback } from 'react'

const AdminAuthContext = createContext(null)

export function AdminAuthProvider({ children }) {
  const [authenticated, setAuthenticated] = useState(false)
  const [checking, setChecking] = useState(true)

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      setAuthenticated(data.authenticated)
      return data.authenticated
    } catch {
      setAuthenticated(false)
      return false
    } finally {
      setChecking(false)
    }
  }, [])

  const login = useCallback(async (password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    const data = await res.json()
    if (res.ok) {
      setAuthenticated(true)
      return { success: true }
    }
    return { success: false, error: data.error || 'Login failed' }
  }, [])

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setAuthenticated(false)
  }, [])

  return (
    <AdminAuthContext.Provider value={{ authenticated, checking, checkAuth, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export default function useAdminAuth() {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider')
  return ctx
}
