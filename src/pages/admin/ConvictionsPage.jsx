import { useState, useEffect, useCallback } from 'react'
import './MarketsPage.css'
import './ConvictionsPage.css'

const EMPTY_CONVICTION = {
  title: '',
  category: '',
  status: '',
  position: '',
  probability: '',
  openedDate: '',
  expiresDate: '',
  closedDate: '',
  result: '',
  thesisLink: '',
}

export default function ConvictionsPage() {
  const [convictions, setConvictions] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY_CONVICTION)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/convictions?t=${Date.now()}`)
      const data = await res.json()
      setConvictions(data)
    } catch { setConvictions([]) }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  function openAdd() {
    setForm(EMPTY_CONVICTION)
    setError('')
    setModal('add')
  }

  function openEdit(c) {
    setForm({ ...c })
    setError('')
    setModal('edit')
  }

  function openDelete(c) {
    setForm({ ...c })
    setError('')
    setModal('delete')
  }

  function close() {
    setModal(null)
    setForm(EMPTY_CONVICTION)
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
      const method = modal === 'add' ? 'POST' : 'PUT'
      const payload = modal === 'add' ? body : { rowIndex: form.rowIndex, ...body }
      const res = await fetch('/api/convictions', {
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
      const res = await fetch('/api/convictions', {
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

  if (loading) return <div className="admin-empty">Loading convictions...</div>

  return (
    <div>
      <div className="admin-page-header">
        <h2>Convictions</h2>
        <button className="admin-add-btn" onClick={openAdd}>+ Add Conviction</button>
      </div>

      {convictions.length === 0 ? (
        <div className="admin-empty">No convictions found</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>Position</th>
                <th>Prob</th>
                <th>Dates</th>
                <th>Result</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {convictions.map(c => (
                <tr key={c.rowIndex}>
                  <td>
                    {c.title}
                    {c.thesisLink && (
                      <>
                        {' '}
                        <a className="admin-link" href={c.thesisLink} target="_blank" rel="noopener">thesis</a>
                      </>
                    )}
                  </td>
                  <td>{c.category}</td>
                  <td>
                    <span className={`admin-conv-status admin-conv-status--${c.status || 'unknown'}`}>
                      {c.status || '—'}
                    </span>
                  </td>
                  <td>{c.position ? <span className={`admin-badge admin-badge--${c.position}`}>{c.position}</span> : '—'}</td>
                  <td className="admin-prob">{c.probability}%</td>
                  <td className="admin-conv-dates">
                    {c.openedDate ? <>{c.openedDate} → {c.expiresDate || c.closedDate || '—'}</> : '—'}
                  </td>
                  <td>
                    {c.result ? (
                      <span className={`admin-conv-result-badge admin-conv-result-badge--${c.result}`}>
                        {c.result === 'yes' ? 'Correct' : 'Incorrect'}
                      </span>
                    ) : '—'}
                  </td>
                  <td>
                    <div className="admin-table-actions">
                      <button className="admin-edit-btn" onClick={() => openEdit(c)}>Edit</button>
                      <button className="admin-delete-btn" onClick={() => openDelete(c)}>Delete</button>
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
            <h3>{modal === 'add' ? 'Add Conviction' : 'Edit Conviction'}</h3>
            <div className="admin-modal-field">
              <label>Title</label>
              <input value={form.title} onChange={e => setField('title', e.target.value)} />
            </div>
            <div className="admin-modal-field">
              <label>Category</label>
              <input value={form.category} onChange={e => setField('category', e.target.value)} />
            </div>
            <div className="admin-modal-field">
              <label>Status</label>
              <select value={form.status} onChange={e => setField('status', e.target.value)}>
                <option value="">—</option>
                <option value="open">Open</option>
                <option value="expired">Expired</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div className="admin-modal-field">
              <label>Position</label>
              <input value={form.position} onChange={e => setField('position', e.target.value)} placeholder="e.g. Yes, No, Péter Magyar..." />
            </div>
            <div className="admin-modal-field">
              <label>Probability (%)</label>
              <input type="number" value={form.probability} onChange={e => setField('probability', e.target.value)} />
            </div>
            <div className="admin-modal-field">
              <label>Opened Date</label>
              <input type="date" value={form.openedDate} onChange={e => setField('openedDate', e.target.value)} />
            </div>
            <div className="admin-modal-field">
              <label>Expires Date</label>
              <input type="date" value={form.expiresDate} onChange={e => setField('expiresDate', e.target.value)} />
            </div>
            <div className="admin-modal-field">
              <label>Closed Date</label>
              <input type="date" value={form.closedDate} onChange={e => setField('closedDate', e.target.value)} />
            </div>
            <div className="admin-modal-field">
              <label>Result</label>
              <select value={form.result} onChange={e => setField('result', e.target.value)}>
                <option value="">—</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
            <div className="admin-modal-field">
              <label>Thesis Link</label>
              <input value={form.thesisLink} onChange={e => setField('thesisLink', e.target.value)} />
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
            <h3>Delete Conviction</h3>
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
