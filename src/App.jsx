import { Routes, Route } from 'react-router-dom'
import BackgroundLines from './components/BackgroundLines'
import Navigation from './components/Navigation'
import HeroSection from './pages/HomePage'
import ConvictionsSection from './pages/ConvictionsPage'
import MarketsSection from './pages/MarketsPage'
import AboutSection from './pages/AboutPage'
import FeedSection from './pages/FeedPage'
import LoginPage from './pages/admin/LoginPage'
import AdminLayout from './pages/admin/AdminLayout'
import AdminMarketsPage from './pages/admin/MarketsPage'
import AdminConvictionsPage from './pages/admin/ConvictionsPage'
import './styles/variables.css'
import './App.css'

function PublicSite() {
  return (
    <div className="app">
      <BackgroundLines />
      <Navigation />
      <HeroSection />
      <ConvictionsSection />
      <MarketsSection />
      <AboutSection />
      <FeedSection />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicSite />} />
      <Route path="/admin/login" element={<LoginPage />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminMarketsPage />} />
        <Route path="markets" element={<AdminMarketsPage />} />
        <Route path="convictions" element={<AdminConvictionsPage />} />
      </Route>
    </Routes>
  )
}
