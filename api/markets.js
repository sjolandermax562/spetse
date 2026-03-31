import { GoogleSpreadsheet } from 'google-spreadsheet'
import { JWT } from 'google-auth-library'

const auth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
})

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, auth)
    await doc.loadInfo()

    const sheet = doc.sheetsByTitle['Markets']
    if (!sheet) {
      return res.status(404).json({ error: 'Markets sheet not found' })
    }

    const rows = await sheet.getRows()
    const data = rows
      .filter(row => row.get('title'))
      .map((row, i) => ({
        id: i + 1,
        title: row.get('title') || '',
        category: row.get('category') || '',
        probability: Number(row.get('probability')) || 0,
        volume: row.get('volume') || '',
        platform: row.get('platform') || '',
        polymarketLink: row.get('polymarketLink') || '',
        kalshiLink: row.get('kalshiLink') || '',
      }))

    res.setHeader('Cache-Control', 's-maxage=300')
    return res.status(200).json(data)
  } catch (err) {
    console.error('Markets API error:', err.message)
    return res.status(500).json({ error: 'Failed to fetch markets data' })
  }
}
