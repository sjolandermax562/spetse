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

    const sheet = doc.sheetsByTitle['Convictions']
    if (!sheet) {
      return res.status(404).json({ error: 'Convictions sheet not found' })
    }

    const rows = await sheet.getRows()
    const data = rows
      .filter(row => row.get('title'))
      .map((row, i) => ({
        id: i + 1,
        title: row.get('title') || '',
        category: row.get('category') || '',
        status: (() => {
          const s = row.get('status') || ''
          const exp = row.get('expiresDate')
          if (s !== 'expired' && exp && new Date(exp) < new Date()) return 'expired'
          return s
        })(),
        position: row.get('position') || '',
        probability: Number(row.get('probability')) || 0,
        openedDate: row.get('openedDate') || '',
        expiresDate: row.get('expiresDate') || '',
        closedDate: row.get('closedDate') || '',
        result: row.get('result') || '',
        thesisLink: row.get('thesisLink') || '',
      }))

    res.setHeader('Cache-Control', 's-maxage=60')
    return res.status(200).json(data)
  } catch (err) {
    console.error('Convictions API error:', err.message)
    return res.status(500).json({ error: 'Failed to fetch convictions data' })
  }
}
