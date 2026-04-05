import { createHmac } from 'crypto'

function signToken(secret) {
  return createHmac('sha256', secret).update('admin').digest('hex')
}

function verifyToken(token, secret) {
  if (!token || !secret) return false
  return token === signToken(secret)
}

function parseCookies(cookieHeader) {
  const cookies = {}
  if (!cookieHeader) return cookies
  cookieHeader.split(';').forEach(c => {
    const [key, ...rest] = c.trim().split('=')
    cookies[key] = rest.join('=')
  })
  return cookies
}

function unauthorized(res) {
  return res.status(401).json({ error: 'Unauthorized' })
}

export default async function handler(req, res) {
  const secret = process.env.SESSION_SECRET
  const password = process.env.ADMIN_PASSWORD

  if (!secret || !password) {
    return res.status(500).json({ error: 'Auth not configured' })
  }

  if (req.method === 'POST' && req.url?.includes('/login')) {
    if (req.body?.password !== password) {
      return res.status(401).json({ error: 'Invalid password' })
    }
    const token = signToken(secret)
    const isProd = process.env.VERCEL === '1'
    res.setHeader('Set-Cookie', `admin_token=${token}; HttpOnly; ${isProd ? 'Secure;' : ''} SameSite=Strict; Path=/; Max-Age=86400`)
    return res.status(200).json({ success: true })
  }

  if (req.method === 'POST' && req.url?.includes('/logout')) {
    const isProd = process.env.VERCEL === '1'
    res.setHeader('Set-Cookie', `admin_token=; HttpOnly; ${isProd ? 'Secure;' : ''} SameSite=Strict; Path=/; Max-Age=0`)
    return res.status(200).json({ success: true })
  }

  if (req.method === 'GET') {
    const cookies = parseCookies(req.headers?.cookie)
    const valid = verifyToken(cookies.admin_token, secret)
    return res.status(200).json({ authenticated: valid })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
