import Navigation from './components/Navigation'
import HeroSection from './pages/HomePage'
import ConvictionsSection from './pages/ConvictionsPage'
import MarketsSection from './pages/MarketsPage'
import AboutSection from './pages/AboutPage'
import FeedSection from './pages/FeedPage'
import './styles/variables.css'
import './App.css'

export default function App() {
  return (
    <div className="app">
      <Navigation />
      <HeroSection />
      <ConvictionsSection />
      <MarketsSection />
      <AboutSection />
      <FeedSection />
    </div>
  )
}
