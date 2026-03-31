import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import feedData from '../data/feed.json'
import './FeedPage.css'

gsap.registerPlugin(ScrollTrigger)

export default function FeedSection() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.feed__label', {
          scrollTrigger: { trigger: '.feed__label', start: 'top 85%' },
          y: 20, opacity: 0, duration: 0.6, ease: 'expo.out',
        })
        gsap.from('.feed__title', {
          scrollTrigger: { trigger: '.feed__title', start: 'top 85%' },
          y: 30, opacity: 0, duration: 0.7, delay: 0.1, ease: 'expo.out',
        })
        const posts = sectionRef.current?.querySelectorAll('.feed__post')
        if (posts?.length) {
          gsap.from(posts, {
            scrollTrigger: { trigger: posts[0], start: 'top 85%' },
            y: 30, opacity: 0, duration: 0.5, stagger: 0.1, ease: 'expo.out',
          })
        }
      })
      return () => mm.revert()
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section className="feed" id="feed" ref={sectionRef}>
      <div className="feed__inner">
        <p className="feed__label">05 — FIND US <span className="feed__label-line" /></p>
        <h2 className="feed__title">Follow Along</h2>
        <p className="feed__handle">@SpetseHQ on X</p>

        <div className="feed__posts">
          {feedData.map(post => (
            <article key={post.id} className="feed__post">
              <p className="feed__post-text">{post.text}</p>
              <div className="feed__post-meta">
                <span className="feed__post-date">{post.date}</span>
                {post.views && <span className="feed__post-views">{post.views} views</span>}
              </div>
            </article>
          ))}
        </div>

        <div className="feed__cta">
          <a
            className="feed__cta-btn"
            href="https://x.com/SpetseHQ"
            target="_blank"
            rel="noopener noreferrer"
          >
            FOLLOW @SPETSEHQ ON X
          </a>
        </div>
      </div>
    </section>
  )
}
