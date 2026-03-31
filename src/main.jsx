import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { LenisProvider } from './hooks/useLenis.jsx'
import App from './App'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LenisProvider>
      <App />
    </LenisProvider>
  </StrictMode>,
)
