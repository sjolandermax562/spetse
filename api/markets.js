import { GoogleSpreadsheet } from 'google-spreadsheet'
import { JWT } from 'google-auth-library'
import { createHmac } from 'crypto'

const auth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
})

function signToken(secret) {
  return createHmac('sha256', secret).update('admin').digest('hex')
}

function verifyAdmin(req, res) {
  const secret = process.env.SESSION_SECRET
  if (!secret) return false
  const cookieHeader = req.headers?.cookie || ''
  const cookies = {}
  cookieHeader.split(';').forEach(c => {
    const [key, ...rest] = c.trim().split('=')
    cookies[key] = rest.join('=')
  })
  if (!cookies.admin_token || cookies.admin_token !== signToken(secret)) {
    res.status(401).json({ error: 'Unauthorized' })
    return false
  }
  return true
}

async function getSheet() {
  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, auth)
  await doc.loadInfo()
  const sheet = doc.sheetsByTitle['Markets']
  if (!sheet) throw new Error('Markets sheet not found')
  return sheet
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const sheet = await getSheet()
      const rows = await sheet.getRows()
      const data = rows
        .filter(row => row.get('title'))
        .map((row, i) => ({
          rowIndex: i,
          title: row.get('title') || '',
          category: row.get('category') || '',
          probability: row.get('probability') ? Number(row.get('probability')) : null,
          platform: row.get('platform') || '',
          polymarketLink: row.get('polymarketLink') || '',
          kalshiLink: row.get('kalshiLink') || '',
        }))

      res.setHeader('Cache-Control', 's-maxage=300')
      return res.status(200).json(data)
    }

    if (!verifyAdmin(req, res)) return

    if (req.method === 'POST') {
      const sheet = await getSheet()
      const { title, category, probability, platform, polymarketLink, kalshiLink } = req.body || {}
      if (!title) return res.status(400).json({ error: 'Title is required' })
      await sheet.addRow({ title, category, probability: String(probability || ''), platform, polymarketLink, kalshiLink })
      return res.status(201).json({ success: true })
    }

    if (req.method === 'PUT') {
      const sheet = await getSheet()
      const rows = await sheet.getRows()
      const { rowIndex, ...fields } = req.body || {}
      if (rowIndex == null) return res.status(400).json({ error: 'rowIndex is required' })
      const row = rows[rowIndex]
      if (!row) return res.status(404).json({ error: 'Row not found' })
      Object.entries(fields).forEach(([key, val]) => {
        if (val !== undefined) row.set(key, String(val))
      })
      await row.save()
      return res.status(200).json({ success: true })
    }

    if (req.method === 'DELETE') {
      const sheet = await getSheet()
      const rows = await sheet.getRows()
      const { rowIndex } = req.body || {}
      if (rowIndex == null) return res.status(400).json({ error: 'rowIndex is required' })
      const row = rows[rowIndex]
      if (!row) return res.status(404).json({ error: 'Row not found' })
      await row.delete()
      return res.status(200).json({ success: true })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error('Markets API error:', err.message)
    return res.status(500).json({ error: 'Failed to process markets request' })
  }
}
