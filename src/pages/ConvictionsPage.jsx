import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import useSheetData from '../hooks/useSheetData'
import './ConvictionsPage.css'

gsap.registerPlugin(ScrollTrigger)

export default function ConvictionsSection() {
  const [filter, setFilter] = useState('live')
  const sectionRef = useRef(null)
  const { data: convictionsData, loading } = useSheetData('/api/convictions')

  const filtered = convictionsData.filter(c =>
    filter === 'live' ? c.status === 'live' : c.status === 'expired'
  )

  useEffect(() => {
    if (!convictionsData?.length) return

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.convictions__label', {
          scrollTrigger: { trigger: '.convictions__label', start: 'top 85%' },
          y: 20, opacity: 0, duration: 0.6, ease: 'expo.out',
        })
        gsap.from('.convictions__title', {
          scrollTrigger: { trigger: '.convictions__title', start: 'top 85%' },
          y: 30, opacity: 0, duration: 0.7, delay: 0.1, ease: 'expo.out',
        })
      })
      return () => mm.revert()
    }, sectionRef)
    return () => ctx.revert()
  }, [convictionsData])

  useEffect(() => {
    if (!filtered?.length) return

    const ctx = gsap.context(() => {
      const cards = sectionRef.current?.querySelectorAll('.conviction-card')
      if (!cards?.length) return
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from(cards, {
          y: 40, opacity: 0, duration: 0.5, stagger: 0.08, ease: 'expo.out',
        })
      })
      return () => mm.revert()
    }, sectionRef)
    return () => ctx.revert()
  }, [filter, filtered])

  return (
    <section className="convictions" id="convictions" ref={sectionRef}>
      <div className="convictions__inner">
        <div className="convictions__top">
          <div>
            <p className="convictions__label">02 — TRACK RECORD <span className="convictions__label-line" /></p>
            <h2 className="convictions__title">Convictions</h2>
          </div>
        </div>

        <div className="convictions__tabs">
          <button
            className={`convictions__tab${filter === 'live' ? ' convictions__tab--active' : ''}`}
            onClick={() => setFilter('live')}
          >
            Live
          </button>
          <button
            className={`convictions__tab${filter === 'expired' ? ' convictions__tab--active' : ''}`}
            onClick={() => setFilter('expired')}
          >
            Expired
          </button>
        </div>

        <div className="convictions__grid">
          {filtered.map(conviction => (
            <ConvictionCard key={conviction.id} data={conviction} />
          ))}
          {!loading && filtered.length === 0 && (
            <p className="convictions__empty">No {filter} convictions yet.</p>
          )}
        </div>
      </div>
    </section>
  )
}

function ConvictionCard({ data }) {
  return (
    <article className="conviction-card">
      <div className="conviction-card__header">
        <span className="conviction-card__category">{data.category}</span>
        <span className={`conviction-card__badge conviction-card__badge--${data.status}`}>
          {data.status === 'live' ? 'LIVE' : 'EXPIRED'}
        </span>
      </div>

      <h3 className="conviction-card__title">{data.title}</h3>

      {data.status === 'live' && (
        <>
          <div className="conviction-card__prob">
            <span className="conviction-card__prob-num">{data.probability}</span>
            <span className="conviction-card__prob-label">% {data.position}</span>
          </div>

          <div className="conviction-card__bar-track">
            <div
              className="conviction-card__bar-fill"
              style={{ width: `${data.probability}%` }}
            />
          </div>

          {data.thesisLink && (
            <a className="conviction-card__link" href={data.thesisLink} target="_blank" rel="noopener noreferrer">
              View full conviction
            </a>
          )}

          <div className="conviction-card__footer">
            <span className="conviction-card__date">{data.openedDate}</span>
          </div>
        </>
      )}

      {data.status === 'expired' && (
        <>
          <div className="conviction-card__expired-result">
            <span className={`conviction-card__result conviction-card__result--${data.result}`}>
              {data.result === 'yes' ? 'WON' : 'LOST'}
            </span>
          </div>
          {data.thesisLink && (
            <a className="conviction-card__link" href={data.thesisLink} target="_blank" rel="noopener noreferrer">
              View full conviction
            </a>
          )}
          <div className="conviction-card__footer">
            <span className="conviction-card__date">{data.closedDate}</span>
          </div>
        </>
      )}
    </article>
  )
}
