import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import useSheetData from '../hooks/useSheetData'
import './FeedPage.css'

gsap.registerPlugin(ScrollTrigger)

const TEXT_TRUNCATE_LENGTH = 200

export default function FeedSection() {
  const sectionRef = useRef(null)
  const { data: feedData, loading } = useSheetData('/api/tweets')
  const [repliesMap, setRepliesMap] = useState({})
  const [expandedText, setExpandedText] = useState({})
  const [expandedReplies, setExpandedReplies] = useState({})

  // Fetch replies for each main tweet after they load
  useEffect(() => {
    if (!feedData?.length) return

    let cancelled = false

    async function fetchAllReplies() {
      const results = await Promise.all(
        feedData.map(async (post) => {
          try {
            const res = await fetch(`/api/tweet-replies?tweetId=${post.id}`)
            if (!res.ok) return { id: post.id, replies: [] }
            const replies = await res.json()
            return { id: post.id, replies }
          } catch {
            return { id: post.id, replies: [] }
          }
        })
      )

      if (cancelled) return

      const map = {}
      for (const r of results) {
        if (r.replies.length > 0) map[r.id] = r.replies
      }
      setRepliesMap(map)
    }

    fetchAllReplies()
    return () => { cancelled = true }
  }, [feedData])

  // Merge replies into posts for rendering
  const postsWithReplies = feedData.map(post => ({
    ...post,
    replies: repliesMap[post.id] || [],
  }))

  useEffect(() => {
    if (!feedData?.length) return

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
  }, [feedData])

  return (
    <section className="feed" id="feed" ref={sectionRef}>
      <div className="feed__inner">
        <p className="feed__label">05 — FIND US <span className="feed__label-line" /></p>
        <h2 className="feed__title">Follow Along</h2>
        <p className="feed__handle">@SpetseHQ on X</p>

        <div className="feed__posts">
          {postsWithReplies.map((post, i) => (
            <article key={post.id} className={`feed__post${i === 0 ? ' feed__post--latest' : ''}`}>
              <a className="feed__post-link" href={post.url} target="_blank" rel="noopener noreferrer">
                <p className="feed__post-text">{post.text}</p>
                <div className="feed__post-meta">
                  <span className="feed__post-date">{post.date}</span>
                  {post.views && <span className="feed__post-views">{post.views.toLocaleString()} views</span>}
                </div>
              </a>

              {post.replies?.length > 0 && (
                <div className="feed__thread" role="group" aria-label="Threaded replies">
                  <div className="feed__thread-line" aria-hidden="true" />
                  <div className="feed__thread-replies">
                    {post.replies.map((reply, replyIndex) => {
                      const isLongText = reply.text.length > TEXT_TRUNCATE_LENGTH
                      const isTextExpanded = expandedText[reply.id]
                      const isFirstReply = replyIndex === 0
                      const isRepliesExpanded = expandedReplies[post.id]

                      // Hide replies beyond the first unless expanded
                      if (!isFirstReply && !isRepliesExpanded) return null

                      const hiddenCount = post.replies.length - 1

                      return (
                        <div key={reply.id}>
                          <a
                            className="feed__reply"
                            href={reply.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <p
                              className={`feed__reply-text${isLongText && !isTextExpanded ? ' feed__reply-text--clamped' : ''}`}
                            >
                              {reply.text}
                            </p>
                            {isLongText && (
                              <span
                                className="feed__reply-text-toggle"
                                role="button"
                                tabIndex={0}
                                aria-expanded={isTextExpanded}
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  setExpandedText((prev) => ({
                                    ...prev,
                                    [reply.id]: !prev[reply.id],
                                  }))
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    setExpandedText((prev) => ({
                                      ...prev,
                                      [reply.id]: !prev[reply.id],
                                    }))
                                  }
                                }}
                              >
                                {isTextExpanded ? 'show less' : 'show more'}
                              </span>
                            )}
                            <div className="feed__reply-meta">
                              <span className="feed__reply-date">{reply.date}</span>
                              {reply.views && <span className="feed__reply-views">{reply.views.toLocaleString()} views</span>}
                            </div>
                          </a>

                          {/* "Show more replies" button after the first reply */}
                          {isFirstReply && hiddenCount > 0 && !isRepliesExpanded && (
                            <button
                              type="button"
                              className="feed__thread-more-btn"
                              onClick={() => {
                                setExpandedReplies((prev) => ({
                                  ...prev,
                                  [post.id]: true,
                                }))
                              }}
                            >
                              show more replies ({hiddenCount})
                            </button>
                          )}
                        </div>
                      )
                    })}

                    {/* "Show less replies" button when expanded and there are 2+ replies */}
                    {post.replies.length > 1 && expandedReplies[post.id] && (
                      <button
                        type="button"
                        className="feed__thread-more-btn"
                        onClick={() => {
                          setExpandedReplies((prev) => ({
                            ...prev,
                            [post.id]: false,
                          }))
                        }}
                      >
                        show less replies
                      </button>
                    )}
                  </div>
                </div>
              )}
            </article>
          ))}
          {!loading && feedData.length === 0 && (
            <p className="feed__empty">No tweets yet.</p>
          )}
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
