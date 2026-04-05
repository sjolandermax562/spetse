import { useState, useEffect, useCallback } from 'react'
import './MarketsPage.css'

const EMPTY_MARKET = {
  title: '',
  category: '',
  probability: '',
  platform: '',
  polymarketLink: '',
  kalshiLink: '',
}

export default function MarketsPage() {
  const [markets, setMarkets] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY_MARKET)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/markets?t=${Date.now()}`)
      const data = await res.json()
      setMarkets(data)
    } catch { setMarkets([]) }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  function openAdd() {
    setForm(EMPTY_MARKET)
    setError('')
    setModal('add')
  }

  function openEdit(market) {
    setForm({ ...market })
    setError('')
    setModal('edit')
  }

  function openDelete(market) {
    setForm({ ...market })
    setError('')
    setModal('delete')
  }

  function close() {
    setModal(null)
    setForm(EMPTY_MARKET)
    setError('')
  }

  function setField(key, val) {
    setForm(f => ({ ...f, [key]: val }))
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    const body = { ...form }
    delete body.rowIndex
    try {
      const url = modal === 'add' ? '/api/markets' : '/api/markets'
      const method = modal === 'add' ? 'POST' : 'PUT'
      const payload = modal === 'add' ? body : { rowIndex: form.rowIndex, ...body }
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Save failed')
      }
      close()
      await load()
    } catch (err) {
      setError(err.message)
    }
    setSaving(false)
  }

  async function handleDelete() {
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/markets', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rowIndex: form.rowIndex }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Delete failed')
      }
      close()
      await load()
    } catch (err) {
      setError(err.message)
    }
    setSaving(false)
  }

  if (loading) return <div className="admin-empty">Loading markets...</div>

  return (
    <div>
      <div className="admin-page-header">
        <h2>Markets</h2>
        <button className="admin-add-btn" onClick={openAdd}>+ Add Market</button>
      </div>

      {markets.length === 0 ? (
        <div className="admin-empty">No markets found</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Probability</th>
                <th>Platform</th>
                <th>Links</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {markets.map(m => (
                <tr key={m.rowIndex}>
                  <td>{m.title}</td>
                  <td>{m.category}</td>
                  <td className="admin-prob">{m.probability != null ? `${m.probability}%` : '—'}</td>
                  <td>{m.platform}</td>
                  <td>
                    {m.polymarketLink && <a className="admin-link" href={m.polymarketLink} target="_blank" rel="noopener">Polymarket</a>}
                    {m.polymarketLink && m.kalshiLink && ' · '}
                    {m.kalshiLink && <a className="admin-link" href={m.kalshiLink} target="_blank" rel="noopener">Kalshi</a>}
                  </td>
                  <td>
                    <div className="admin-table-actions">
                      <button className="admin-edit-btn" onClick={() => openEdit(m)}>Edit</button>
                      <button className="admin-delete-btn" onClick={() => openDelete(m)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(modal === 'add' || modal === 'edit') && (
        <div className="admin-modal-overlay" onClick={close}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <h3>{modal === 'add' ? 'Add Market' : 'Edit Market'}</h3>
            <div className="admin-modal-field">
              <label>Title</label>
              <input value={form.title} onChange={e => setField('title', e.target.value)} />
            </div>
            <div className="admin-modal-field">
              <label>Category</label>
              <input value={form.category} onChange={e => setField('category', e.target.value)} />
            </div>
            <div className="admin-modal-field">
              <label>Probability (%) <span className="admin-optional">optional</span></label>
              <input type="number" placeholder="Leave empty if unknown" value={form.probability ?? ''} onChange={e => setField('probability', e.target.value === '' ? '' : Number(e.target.value))} />
            </div>
            <div className="admin-modal-field">
              <label>Platform</label>
              <input value={form.platform} onChange={e => setField('platform', e.target.value)} />
            </div>
            <div className="admin-modal-field">
              <label>Polymarket Link</label>
              <input value={form.polymarketLink} onChange={e => setField('polymarketLink', e.target.value)} />
            </div>
            <div className="admin-modal-field">
              <label>Kalshi Link</label>
              <input value={form.kalshiLink} onChange={e => setField('kalshiLink', e.target.value)} />
            </div>
            {error && <div className="admin-error">{error}</div>}
            <div className="admin-modal-actions">
              <button className="admin-modal-cancel" onClick={close}>Cancel</button>
              <button className="admin-modal-save" onClick={handleSave} disabled={saving || !form.title}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {modal === 'delete' && (
        <div className="admin-modal-overlay" onClick={close}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <h3>Delete Market</h3>
            <p className="admin-confirm-text">
              Are you sure you want to delete <span className="admin-confirm-name">{form.title}</span>?
              This cannot be undone.
            </p>
            {error && <div className="admin-error">{error}</div>}
            <div className="admin-modal-actions">
              <button className="admin-modal-cancel" onClick={close}>Cancel</button>
              <button className="admin-modal-save" style={{ background: '#f87171' }} onClick={handleDelete} disabled={saving}>
                {saving ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
