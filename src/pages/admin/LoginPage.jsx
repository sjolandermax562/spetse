import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAdminAuth from '../../hooks/useAdminAuth.jsx'
import './LoginPage.css'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { authenticated, checking, checkAuth, login } = useAdminAuth()
  const navigate = useNavigate()

  useEffect(() => { checkAuth() }, [checkAuth])

  useEffect(() => {
    if (authenticated) navigate('/admin')
  }, [authenticated, navigate])

  if (checking) return null

  if (authenticated) return null

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    const result = await login(password)
    if (result.success) {
      navigate('/admin')
    } else {
      setError(result.error || 'Invalid password')
      setSubmitting(false)
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-card-label">ADMIN ACCESS</div>
        <div className="login-card-line" />
        <h1>SPETSE</h1>
        <p>Admin Panel</p>
        <div className="login-field">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoFocus
          />
        </div>
        <button className="login-btn" type="submit" disabled={submitting || !password}>
          {submitting ? 'Signing in...' : 'Sign In'}
        </button>
        {error && <div className="login-error">{error}</div>}
      </form>
    </div>
  )
}
