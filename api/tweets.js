export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const apiKey = process.env.TWITTER_API_KEY
    if (!apiKey) {
      return res.status(500).json({ error: 'Twitter API key not configured' })
    }

    const headers = { 'X-API-Key': apiKey }

    // Step 1: Fetch latest tweets from SpetseHQ
    const timelineRes = await fetch(
      'https://api.twitterapi.io/twitter/user/last_tweets?userName=SpetseHQ',
      { headers }
    )

    if (!timelineRes.ok) {
      throw new Error(`Timeline API returned ${timelineRes.status}`)
    }

    const timelineJson = await timelineRes.json()
    const rawTweets = timelineJson.data?.tweets || []

    // Step 2: Filter to only main (non-reply) posts
    const mainPosts = rawTweets
      .filter(t => t.isReply !== true)
      .map(t => ({
        id: t.id,
        text: t.text,
        url: t.url,
        date: formatTwitterDate(t.createdAt),
        views: t.viewCount || null,
        replies: [],
      }))

    // Step 3: For each main post, fetch the full thread context
    const repliesResults = await Promise.all(
      mainPosts.map(async (post) => {
        try {
          const r = await fetch(
            `https://api.twitterapi.io/twitter/tweet/thread_context?tweetId=${post.id}`,
            { headers }
          )
          if (!r.ok) {
            console.error(`Thread context API returned ${r.status} for tweet ${post.id}`)
            return []
          }
          const rj = await r.json()
          const raw = rj.tweets || []

          // Only keep SpetseHQ self-replies (exclude original tweet, other users, and replies to other users)
          return raw
            .filter(t =>
              t.isReply === true &&
              t.author?.userName === 'SpetseHQ' &&
              t.inReplyToUsername === 'SpetseHQ'
            )
            .map(t => ({
              id: t.id,
              text: t.text,
              url: t.url,
              date: formatTwitterDate(t.createdAt),
              views: t.viewCount || null,
            }))
            .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
        } catch (err) {
          console.error(`Error fetching thread for ${post.id}:`, err.message)
          return []
        }
      })
    )

    // Step 4: Attach replies to each post
    mainPosts.forEach((post, i) => {
      post.replies = repliesResults[i]
    })

    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=3600')
    return res.status(200).json(mainPosts)
  } catch (err) {
    console.error('Tweets API error:', err.message)
    return res.status(500).json({ error: 'Failed to fetch tweets' })
  }
}

function formatTwitterDate(dateStr) {
  // "Mon Mar 30 20:42:15 +0000 2026" → "Mar 30, 2026"
  const d = new Date(dateStr)
  if (isNaN(d)) return dateStr
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
