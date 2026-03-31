import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './BackgroundLines.css'

gsap.registerPlugin(ScrollTrigger)

const wavePaths = [
  // Top flowing lines
  {
    d: 'M-100,120 C200,80 400,180 600,100 C800,20 1000,160 1200,90 C1400,20 1600,130 1900,70',
    speed: 0.15,
    opacity: 0.07,
  },
  {
    d: 'M-100,200 C150,160 350,260 580,180 C810,100 950,240 1180,170 C1410,100 1600,220 1900,150',
    speed: 0.1,
    opacity: 0.05,
  },
  {
    d: 'M-100,320 C180,270 420,370 650,290 C880,210 1050,350 1250,280 C1450,210 1650,330 1900,260',
    speed: 0.2,
    opacity: 0.06,
  },
  // Middle flowing lines
  {
    d: 'M-100,500 C200,440 380,540 620,460 C860,380 1020,520 1260,450 C1500,380 1680,500 1900,430',
    speed: 0.12,
    opacity: 0.05,
  },
  {
    d: 'M-100,650 C250,590 450,700 680,610 C910,520 1100,680 1300,600 C1500,520 1700,650 1900,580',
    speed: 0.18,
    opacity: 0.07,
  },
  // Bottom flowing lines
  {
    d: 'M-100,800 C200,740 400,850 650,760 C900,670 1080,810 1300,740 C1520,670 1700,790 1900,720',
    speed: 0.08,
    opacity: 0.04,
  },
  {
    d: 'M-100,920 C180,870 380,960 600,880 C820,800 1000,940 1220,870 C1440,800 1640,910 1900,850',
    speed: 0.22,
    opacity: 0.06,
  },
  {
    d: 'M-100,1050 C220,990 440,1090 660,1010 C880,930 1060,1060 1280,990 C1500,920 1680,1040 1900,970',
    speed: 0.14,
    opacity: 0.05,
  },
]

export default function BackgroundLines() {
  const containerRef = useRef(null)
  const pathRefs = useRef([])

  useEffect(() => {
    const ctx = gsap.context(() => {
      pathRefs.current.forEach((path, i) => {
        if (!path) return
        const speed = wavePaths[i].speed

        // Parallax vertical shift on scroll
        gsap.to(path, {
          y: () => speed * window.innerHeight * 1.5,
          ease: 'none',
          scrollTrigger: {
            trigger: document.body,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.8,
          },
        })

        // Subtle horizontal drift animation
        gsap.to(path, {
          x: (i % 2 === 0 ? 1 : -1) * 30,
          duration: 8 + i * 2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        })
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div className="bg-lines" ref={containerRef}>
      <svg
        className="bg-lines__svg"
        viewBox="0 0 1800 1100"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {wavePaths.map((wave, i) => (
          <path
            key={i}
            ref={el => pathRefs.current[i] = el}
            d={wave.d}
            fill="none"
            stroke="rgba(232, 217, 181, 1)"
            strokeWidth="1"
            opacity={wave.opacity}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
    </div>
  )
}
