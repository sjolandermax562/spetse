import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './AboutPage.css'

gsap.registerPlugin(ScrollTrigger)

const values = [
  {
    num: '01',
    title: 'Clarity over complexity',
    text: "We explain what markets are saying in plain terms.",
  },
  {
    num: '02',
    title: 'Conviction over hype',
    text: "We share what we actually think, not what the crowd wants to hear.",
  },
  {
    num: '03',
    title: 'Probability thinking',
    text: "Most people think in yes or no. We think in percentages.",
  },
  {
    num: '04',
    title: 'Real-time signal',
    text: "Markets move. We track the moves that matter and explain why they're happening.",
  },
]

export default function AboutSection() {
  const sectionRef = useRef(null)
  const valuesRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.about__label', {
          scrollTrigger: { trigger: '.about__label', start: 'top 85%' },
          y: 20, opacity: 0, duration: 0.6, ease: 'expo.out',
        })
        gsap.from('.about__title', {
          scrollTrigger: { trigger: '.about__title', start: 'top 85%' },
          y: 30, opacity: 0, duration: 0.7, delay: 0.1, ease: 'expo.out',
        })
        const paras = sectionRef.current?.querySelectorAll('.about__text')
        if (paras?.length) {
          gsap.from(paras, {
            scrollTrigger: { trigger: paras[0], start: 'top 85%' },
            y: 25, opacity: 0, duration: 0.5, stagger: 0.12, ease: 'expo.out',
          })
        }

        // Ladder animation for values
        const items = valuesRef.current?.querySelectorAll('.about__value')
        if (items?.length) {
          items.forEach((item, i) => {
            // Each item slides in from left with increasing indent
            gsap.fromTo(item, {
              x: -60,
              opacity: 0,
            }, {
              x: 0,
              opacity: 1,
              duration: 0.7,
              ease: 'expo.out',
              scrollTrigger: {
                trigger: item,
                start: 'top 88%',
                end: 'top 40%',
                toggleActions: 'play none none none',
              },
            })

            // The progress line grows as you scroll through it
            const line = item.querySelector('.about__value-line')
            if (line) {
              gsap.fromTo(line, { scaleX: 0 }, {
                scaleX: 1,
                ease: 'none',
                scrollTrigger: {
                  trigger: item,
                  start: 'top 75%',
                  end: 'bottom 50%',
                  scrub: 0.5,
                },
              })
            }
          })
        }
      })
      return () => mm.revert()
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section className="about" id="about" ref={sectionRef}>
      <div className="about__inner">
        <p className="about__label">04 — WHO WE ARE <span className="about__label-line" /></p>
        <h2 className="about__title">About SPETSE</h2>

        <div className="about__body">
          <p className="about__text">
            SPETSE is a <strong>media and intelligence account</strong> focused on prediction markets.
            We track markets across Polymarket and Kalshi, and break down what the odds are actually saying.
          </p>
          <p className="about__text">
            <strong>Prediction markets</strong> are platforms where people trade on the outcome of real-world events
            such as elections, conflicts, economic shifts, and more. Prices move in real time based on what
            traders believe will happen, creating a live probability for every outcome. We think more people
            should be paying attention.
          </p>
          <p className="about__text">
            We are <strong>not a trading group</strong>. We are not a platform. We are not giving financial advice.
            We break down markets, give you our honest conviction on where the odds are wrong, and
            <strong> let you decide for yourself</strong>.
          </p>
        </div>

        <div className="about__values" ref={valuesRef}>
          {values.map((v, i) => (
            <div
              key={v.num}
              className="about__value"
              style={{
                paddingLeft: `${i * 2.5}rem`,
              }}
            >
              <span className="about__value-num">{v.num}</span>
              <div className="about__value-content">
                <h3 className="about__value-title">{v.title}</h3>
                <p className="about__value-text">{v.text}</p>
              </div>
              <div className="about__value-line" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
