import { useState } from 'react'
import './Navigation.css'

export default function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false)

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
    <nav className="nav">
      <div className="nav__inner">
        <a href="#hero" className="nav__logo-link" onClick={(e) => handleClick(e, 'hero')}>
          <img src="/logo.png" alt="SPETSE" className="nav__logo-img" />
          <span className="nav__brand">SPETSE</span>
        </a>

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

        <div className={`nav__links${menuOpen ? ' nav__links--open' : ''}`}>
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
      </div>
    </nav>
  )
}
