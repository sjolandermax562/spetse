import { useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import useAdminAuth from '../../hooks/useAdminAuth.jsx'
import './AdminLayout.css'

export default function AdminLayout() {
  const { authenticated, checking, checkAuth, logout } = useAdminAuth()
  const navigate = useNavigate()

  useEffect(() => { checkAuth() }, [checkAuth])

  useEffect(() => {
    if (!checking && !authenticated) navigate('/admin/login')
  }, [checking, authenticated, navigate])

  async function handleLogout() {
    await logout()
    navigate('/admin/login')
  }

  if (checking || !authenticated) {
    return <div className="admin-loading">Loading...</div>
  }

  return (
    <div className="admin-layout">
      <div className="admin-topbar">
        <div className="admin-topbar-brand">SPETSE Admin</div>
        <nav className="admin-topbar-nav">
          <NavLink to="/admin" end className={({ isActive }) => isActive ? 'active' : ''}>
            Markets
          </NavLink>
          <NavLink to="/admin/convictions" className={({ isActive }) => isActive ? 'active' : ''}>
            Convictions
          </NavLink>
        </nav>
        <button className="admin-logout-btn" onClick={handleLogout}>Logout</button>
      </div>
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  )
}
