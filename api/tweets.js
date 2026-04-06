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

    // Normalize every tweet from the timeline into a flat shape
    const allTweets = rawTweets.map(t => ({
      id: t.id,
      text: t.text,
      url: t.url,
      date: formatTwitterDate(t.createdAt),
      views: t.viewCount || null,
      isReply: t.isReply === true,
      inReplyToId: t.inReplyToId || '',
      inReplyToUsername: t.inReplyToUsername || '',
    }))

    // Step 1: Main posts = tweets that are NOT replies
    const mainPosts = []
    for (const t of allTweets) {
      if (!t.isReply) {
        mainPosts.push({ ...t, replies: [] })
      }
    }

    // Step 2: Self-replies = isReply===true AND inReplyToUsername==="SpetseHQ"
    //         These are follow-ups SpetseHQ posted to its own tweets
    const selfReplies = allTweets.filter(
      t => t.isReply && t.inReplyToUsername === 'SpetseHQ'
    )

    // Step 3: Group self-replies under their parent using inReplyToId → parent.id
    //         Only attach if the parent exists in this batch
    const mainPostMap = new Map(mainPosts.map(p => [p.id, p]))

    for (const reply of selfReplies) {
      const parent = mainPostMap.get(reply.inReplyToId)
      if (parent) {
        parent.replies.push({
          id: reply.id,
          text: reply.text,
          url: reply.url,
          date: reply.date,
          views: reply.views,
        })
      }
    }

    // Step 4: Sort replies within each thread chronologically (oldest first)
    //         Twitter snowflake IDs sort lexicographically in time order
    for (const post of mainPosts) {
      post.replies.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
    }

    // Step 5: Strip internal fields before sending to client
    const data = mainPosts.map(({ isReply, inReplyToId, inReplyToUsername, ...post }) => post)

    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=3600')
    return res.status(200).json(data)
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
