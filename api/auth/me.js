import { createHmac } from 'crypto'

function signToken(secret) {
  return createHmac('sha256', secret).update('admin').digest('hex')
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

export default async function handler(req, res) {
  const secret = process.env.SESSION_SECRET

  if (!secret) {
    return res.status(200).json({ authenticated: false })
  }

  const cookies = parseCookies(req.headers?.cookie)
  const valid = cookies.admin_token === signToken(secret)
  return res.status(200).json({ authenticated: valid })
}
