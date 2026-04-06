export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const apiKey = process.env.TWITTER_API_KEY
    if (!apiKey) {
      return res.status(500).json({ error: 'Twitter API key not configured' })
    }

    const response = await fetch(
      'https://api.twitterapi.io/twitter/user/last_tweets?userName=SpetseHQ',
      { headers: { 'X-API-Key': apiKey } }
    )

    if (!response.ok) {
      throw new Error(`Twitter API returned ${response.status}`)
    }

    const json = await response.json()
    const rawTweets = json.data?.tweets || []

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

    const repliesResults = await Promise.all(
      mainPosts.map(async post => {
        const r = await fetch(
          `https://api.twitterapi.io/twitter/tweet/replies?tweetId=${post.id}`,
          { headers: { 'X-API-Key': apiKey } }
        )
        if (!r.ok) return []
        const rj = await r.json()
        const raw = rj.tweets || []
        return raw
          .filter(t => t.author?.userName === 'SpetseHQ' && t.inReplyToUsername === 'SpetseHQ')
          .map(t => ({
            id: t.id,
            text: t.text,
            url: t.url,
            date: formatTwitterDate(t.createdAt),
            views: t.viewCount || null,
          }))
          .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
      })
    )

    mainPosts.forEach((post, i) => { post.replies = repliesResults[i] })

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
