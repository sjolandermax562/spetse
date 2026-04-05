import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { LenisProvider } from './hooks/useLenis.jsx'
import { AdminAuthProvider } from './hooks/useAdminAuth.jsx'
import App from './App'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <AdminAuthProvider>
        <LenisProvider>
          <App />
        </LenisProvider>
      </AdminAuthProvider>
    </HashRouter>
  </StrictMode>,
)
