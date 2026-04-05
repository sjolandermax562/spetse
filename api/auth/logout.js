export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const isProd = process.env.VERCEL === '1'
  res.setHeader('Set-Cookie', `admin_token=; HttpOnly; ${isProd ? 'Secure;' : ''} SameSite=Strict; Path=/; Max-Age=0`)
  return res.status(200).json({ success: true })
}
