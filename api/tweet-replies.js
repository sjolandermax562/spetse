export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const tweetId = req.query.tweetId
  if (!tweetId) {
    return res.status(400).json({ error: 'Missing tweetId parameter' })
  }

  try {
    const apiKey = process.env.TWITTER_API_KEY
    if (!apiKey) {
      return res.status(500).json({ error: 'Twitter API key not configured' })
    }

    const r = await fetch(
      `https://api.twitterapi.io/twitter/tweet/replies/v2?queryType=Relevance&tweetId=${tweetId}`,
      { headers: { 'X-API-Key': apiKey } }
    )

    if (!r.ok) {
      console.error(`Replies API returned ${r.status} for tweet ${tweetId}`)
      return res.status(200).json([])
    }

    const rj = await r.json()
    const raw = rj.tweets || []

    // Only keep SpetseHQ self-replies (thread continuations), skip the original tweet and other users
    const replies = raw
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

    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=3600')
    return res.status(200).json(replies)
  } catch (err) {
    console.error(`Tweet replies error for ${tweetId}:`, err.message)
    return res.status(500).json({ error: 'Failed to fetch replies' })
  }
}

function formatTwitterDate(dateStr) {
  const d = new Date(dateStr)
  if (isNaN(d)) return dateStr
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
