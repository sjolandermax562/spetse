import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import marketsData from '../data/markets.json'
import './MarketsPage.css'

gsap.registerPlugin(ScrollTrigger)

export default function MarketsSection() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.markets__label', {
          scrollTrigger: { trigger: '.markets__label', start: 'top 85%' },
          y: 20, opacity: 0, duration: 0.6, ease: 'expo.out',
        })
        gsap.from('.markets__title', {
          scrollTrigger: { trigger: '.markets__title', start: 'top 85%' },
          y: 30, opacity: 0, duration: 0.7, delay: 0.1, ease: 'expo.out',
        })
        const cards = sectionRef.current?.querySelectorAll('.market-card')
        if (cards?.length) {
          gsap.from(cards, {
            scrollTrigger: { trigger: cards[0], start: 'top 85%' },
            y: 40, opacity: 0, duration: 0.5, stagger: 0.08, ease: 'expo.out',
          })
        }
      })
      return () => mm.revert()
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section className="markets" id="markets" ref={sectionRef}>
      <div className="markets__inner">
        <p className="markets__label">03 — ON OUR RADAR <span className="markets__label-line" /></p>
        <h2 className="markets__title">Live Markets</h2>

        <div className="markets__grid">
          {marketsData.map(market => (
            <article key={market.id} className="market-card">
              <span className="market-card__category">{market.category}</span>
              <h3 className="market-card__title">{market.title}</h3>

              <div className="market-card__prob">
                <span className="market-card__prob-num">{market.probability}%</span>
                <span className="market-card__prob-label">PROBABILITY</span>
              </div>

              <div className="market-card__bar" />

              <div className="market-card__footer">
                <span className="market-card__volume">{market.volume} volume</span>
                {market.platform && (
                  <span className="market-card__platform">{market.platform} &rarr;</span>
                )}
              </div>
            </article>
          ))}
          {marketsData.length === 0 && (
            <p className="markets__empty">No markets being tracked right now.</p>
          )}
        </div>
      </div>
    </section>
  )
}
