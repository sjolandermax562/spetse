import { createHmac } from 'crypto'

function signToken(secret) {
  return createHmac('sha256', secret).update('admin').digest('hex')
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const secret = process.env.SESSION_SECRET
  const password = process.env.ADMIN_PASSWORD

  if (!secret || !password) {
    return res.status(500).json({ error: 'Auth not configured' })
  }

  if (req.body?.password !== password) {
    return res.status(401).json({ error: 'Invalid password' })
  }

  const token = signToken(secret)
  const isProd = process.env.VERCEL === '1'
  res.setHeader('Set-Cookie', `admin_token=${token}; HttpOnly; ${isProd ? 'Secure;' : ''} SameSite=Strict; Path=/; Max-Age=86400`)
  return res.status(200).json({ success: true })
}
