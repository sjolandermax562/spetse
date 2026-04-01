import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import './HomePage.css'

export default function HeroSection() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.home__logo', {
          scale: 0.8, opacity: 0, duration: 1, delay: 0.3, ease: 'expo.out',
        })
        gsap.from('.home__label', {
          y: 15, opacity: 0, duration: 0.6, delay: 0.8, ease: 'expo.out',
        })
        gsap.from('.home__char', {
          y: 40, opacity: 0, duration: 0.6, stagger: 0.06, delay: 1.0, ease: 'expo.out',
        })
        gsap.from('.home__description', {
          y: 15, opacity: 0, duration: 0.6, delay: 1.6, ease: 'expo.out',
        })
        gsap.from('.home__buttons', {
          y: 15, opacity: 0, duration: 0.6, delay: 2.0, ease: 'expo.out',
        })
      })
      return () => mm.revert()
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  const scrollToConvictions = (e) => {
    e.preventDefault()
    document.getElementById('convictions')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="home" id="hero" ref={sectionRef}>
      <div className="home__center">
        <img src="/logo.png" alt="SPETSE logo" className="home__logo" />

        <p className="home__label">PREDICTION MARKETS INTELLIGENCE</p>

        <h1 className="home__wordmark">
          {'SPETSE'.split('').map((char, i) => (
            <span key={i} className="home__char">{char}</span>
          ))}
        </h1>

        <p className="home__description">
          We track prediction markets across politics, finance, tech and sports -<br />
          and break down what's actually moving, and why.
        </p>

        <div className="home__buttons">
          <a
            className="home__btn home__btn--follow"
            href="https://x.com/SpetseHQ"
            target="_blank"
            rel="noopener noreferrer"
          >
            FOLLOW @SPETSEHQ
          </a>
          <a className="home__btn home__btn--convictions" href="#convictions" onClick={scrollToConvictions}>
            VIEW CONVICTIONS
          </a>
        </div>
      </div>
    </section>
  )
}
