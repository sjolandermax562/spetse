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

    const mainTweets = rawTweets.filter(t => t.isReply !== true)
    const selfReplies = rawTweets.filter(
      t => t.isReply === true && t.inReplyToUsername === 'SpetseHQ'
    )

    const repliesByParent = {}
    for (const r of selfReplies) {
      const parentId = r.inReplyToId
      if (!parentId) continue
      if (!repliesByParent[parentId]) repliesByParent[parentId] = []
      repliesByParent[parentId].push({
        id: r.id,
        text: r.text,
        url: r.url,
        date: formatTwitterDate(r.createdAt),
        views: r.viewCount || null,
      })
    }

    for (const id of Object.keys(repliesByParent)) {
      repliesByParent[id].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
    }

    const data = mainTweets.map(t => ({
      id: t.id,
      text: t.text,
      url: t.url,
      date: formatTwitterDate(t.createdAt),
      views: t.viewCount || null,
      replies: repliesByParent[t.id] || [],
    }))

    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=3600')
    return res.status(200).json(data)
  } catch (err) {
    console.error('Tweets API error:', err.message)
    return res.status(500).json({ error: 'Failed to fetch tweets' })
  }
}

function formatTwitterDate(dateStr) {
  const d = new Date(dateStr)
  if (isNaN(d)) return dateStr
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
