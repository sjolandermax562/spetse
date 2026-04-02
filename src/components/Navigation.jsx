import { useState, useEffect } from 'react'
import './Navigation.css'

export default function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false)

  // Close mobile menu on scroll
  useEffect(() => {
    if (!menuOpen) return
    const handleScroll = () => setMenuOpen(false)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [menuOpen])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const links = [
    { id: 'hero', label: 'Home' },
    { id: 'convictions', label: 'Convictions' },
    { id: 'markets', label: 'Markets' },
    { id: 'about', label: 'About' },
    { id: 'feed', label: 'Feed' },
  ]

  const handleClick = (e, id) => {
    e.preventDefault()
    setMenuOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <nav className="nav">
        <div className="nav__inner">
          <a href="#hero" className="nav__logo-link" onClick={(e) => handleClick(e, 'hero')}>
            <img src="/logo.png" alt="SPETSE" className="nav__logo-img" />
            <span className="nav__brand">SPETSE</span>
          </a>

          <div className="nav__links nav__links--desktop">
            {links.map(link => (
              <a
                key={link.id}
                href={`#${link.id}`}
                className="nav__link"
                onClick={(e) => handleClick(e, link.id)}
              >
                {link.label}
              </a>
            ))}
          </div>

          <button
            className={`nav__hamburger${menuOpen ? ' nav__hamburger--open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      {/* Mobile menu rendered outside <nav> so backdrop-filter doesn't trap fixed positioning */}
      <div className={`nav__mobile-menu${menuOpen ? ' nav__mobile-menu--open' : ''}`}>
        {links.map(link => (
          <a
            key={link.id}
            href={`#${link.id}`}
            className="nav__link"
            onClick={(e) => handleClick(e, link.id)}
          >
            {link.label}
          </a>
        ))}
      </div>
    </>
  )
}
