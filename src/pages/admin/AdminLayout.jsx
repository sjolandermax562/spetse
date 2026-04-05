import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import useAdminAuth from '../../hooks/useAdminAuth.jsx'
import MarketsList from './MarketsPage.jsx'
import ConvictionsList from './ConvictionsPage.jsx'
import './AdminLayout.css'

const EMPTY_MARKET = {
  title: '',
  category: '',
  probability: '',
  platform: '',
  polymarketLink: '',
  kalshiLink: '',
}

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

export default function AdminLayout() {
  const { authenticated, checking, checkAuth, logout } = useAdminAuth()
  const navigate = useNavigate()

  useEffect(() => { checkAuth() }, [checkAuth])

  useEffect(() => {
    if (!checking && !authenticated) navigate('/admin/login')
  }, [checking, authenticated, navigate])

  const [tab, setTab] = useState('markets')
  const [selectedItem, setSelectedItem] = useState(null)
  const [mode, setMode] = useState(null)
  const [markets, setMarkets] = useState([])
  const [convictions, setConvictions] = useState([])
  const [marketsLoading, setMarketsLoading] = useState(true)
  const [convictionsLoading, setConvictionsLoading] = useState(true)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const loadMarkets = useCallback(async () => {
    try {
      const res = await fetch(`/api/markets?t=${Date.now()}`)
      setMarkets(await res.json())
    } catch {
      setMarkets([])
    }
    setMarketsLoading(false)
  }, [])

  const loadConvictions = useCallback(async () => {
    try {
      const res = await fetch(`/api/convictions?t=${Date.now()}`)
      setConvictions(await res.json())
    } catch {
      setConvictions([])
    }
    setConvictionsLoading(false)
  }, [])

  useEffect(() => {
    loadMarkets()
    loadConvictions()
  }, [loadMarkets, loadConvictions])

  function resetPanel() {
    setSelectedItem(null)
    setMode(null)
    setForm({})
    setError('')
  }

  function selectItem(item) {
    setSelectedItem(item)
    setMode('edit')
    setForm({ ...item })
    setError('')
  }

  function requestAdd() {
    setSelectedItem(null)
    setMode('add')
    setForm(tab === 'markets' ? { ...EMPTY_MARKET } : { ...EMPTY_CONVICTION })
    setError('')
  }

  function requestDelete(item) {
    setSelectedItem(item)
    setMode('delete')
    setForm({ ...item })
    setError('')
  }

  function setField(key, val) {
    setForm(f => ({ ...f, [key]: val }))
  }

  async function save() {
    setSaving(true)
    setError('')
    const isMk = tab === 'markets'
    const endpoint = isMk ? '/api/markets' : '/api/convictions'
    const body = { ...form }
    delete body.rowIndex
    const payload = mode === 'add' ? body : { rowIndex: form.rowIndex, ...body }
    try {
      const res = await fetch(endpoint, {
        method: mode === 'add' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Save failed')
      }
      resetPanel()
      await (isMk ? loadMarkets() : loadConvictions())
    } catch (err) {
      setError(err.message)
    }
    setSaving(false)
  }

  async function confirmDelete() {
    setSaving(true)
    setError('')
    const isMk = tab === 'markets'
    const endpoint = isMk ? '/api/markets' : '/api/convictions'
    try {
      const res = await fetch(endpoint, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rowIndex: form.rowIndex }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Delete failed')
      }
      resetPanel()
      await (isMk ? loadMarkets() : loadConvictions())
    } catch (err) {
      setError(err.message)
    }
    setSaving(false)
  }

  function switchTab(t) {
    if (t === tab) return
    setTab(t)
    resetPanel()
  }

  async function handleLogout() {
    await logout()
    navigate('/admin/login')
  }

  if (checking || !authenticated) return <div className="admin-loading" />

  const isMk = tab === 'markets'

  return (
    <div className="admin-layout">
      <div className="admin-topbar">
        <div className="admin-topbar-brand">
          <span className="admin-topbar-brand-name">SPETSE</span>
          <span className="admin-topbar-brand-suffix">Admin</span>
        </div>
        <button className="admin-logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      <div className="admin-split">
        <div className="admin-panel-left">
          <div className="admin-panel-toolbar">
            <div className="admin-tabs">
              <button
                className={`admin-tab-btn ${tab === 'markets' ? 'admin-tab-btn--active' : ''}`}
                onClick={() => switchTab('markets')}
              >
                Markets
              </button>
              <button
                className={`admin-tab-btn ${tab === 'convictions' ? 'admin-tab-btn--active' : ''}`}
                onClick={() => switchTab('convictions')}
              >
                Convictions
              </button>
            </div>
            <button className="admin-add-btn" onClick={requestAdd}>+ Add</button>
          </div>
          <div className="admin-panel-list">
            {isMk ? (
              <MarketsList
                items={markets}
                loading={marketsLoading}
                selected={selectedItem}
                onSelect={selectItem}
                onDelete={requestDelete}
              />
            ) : (
              <ConvictionsList
                items={convictions}
                loading={convictionsLoading}
                selected={selectedItem}
                onSelect={selectItem}
                onDelete={requestDelete}
              />
            )}
          </div>
        </div>

        <div className="admin-panel-right">
          {mode === null && <Placeholder />}

          {(mode === 'add' || mode === 'edit') && isMk && (
            <div className="admin-form-panel">
              <h3 className="admin-form-title">{mode === 'add' ? 'Add Market' : 'Edit Market'}</h3>
              <MarketFields form={form} setField={setField} />
              {error && <div className="admin-error">{error}</div>}
              <FormActions saving={saving} disabled={!form.title} onSave={save} onCancel={resetPanel} />
            </div>
          )}

          {(mode === 'add' || mode === 'edit') && !isMk && (
            <div className="admin-form-panel">
              <h3 className="admin-form-title">{mode === 'add' ? 'Add Conviction' : 'Edit Conviction'}</h3>
              <ConvictionFields form={form} setField={setField} />
              {error && <div className="admin-error">{error}</div>}
              <FormActions saving={saving} disabled={!form.title} onSave={save} onCancel={resetPanel} />
            </div>
          )}

          {mode === 'delete' && (
            <div className="admin-form-panel">
              <h3 className="admin-form-title">Delete {isMk ? 'Market' : 'Conviction'}</h3>
              <p className="admin-confirm-text">
                Are you sure you want to delete <span className="admin-confirm-name">{form.title}</span>?
                This cannot be undone.
              </p>
              {error && <div className="admin-error">{error}</div>}
              <div className="admin-form-actions">
                <button className="admin-modal-cancel" onClick={resetPanel}>Cancel</button>
                <button className="admin-modal-save admin-modal-save--danger" onClick={confirmDelete} disabled={saving}>
                  {saving ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Placeholder() {
  return (
    <div className="admin-placeholder">
      <svg className="admin-placeholder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
      <p>Select an item to edit</p>
    </div>
  )
}

function FormActions({ saving, disabled, onSave, onCancel }) {
  return (
    <div className="admin-form-actions">
      <button className="admin-modal-cancel" onClick={onCancel}>Cancel</button>
      <button className="admin-modal-save" onClick={onSave} disabled={saving || disabled}>
        {saving ? 'Saving...' : 'Save'}
      </button>
    </div>
  )
}

function MarketFields({ form, setField }) {
  return (
    <>
      <Field label="Title" value={form.title} onChange={v => setField('title', v)} />
      <Field label="Category" value={form.category} onChange={v => setField('category', v)} />
      <Field
        label={<>Probability (%) <span className="admin-optional">optional</span></>}
        type="number"
        placeholder="Leave empty if unknown"
        value={form.probability ?? ''}
        onChange={v => setField('probability', v === '' ? '' : Number(v))}
      />
      <Field label="Platform" value={form.platform} onChange={v => setField('platform', v)} />
      <Field label="Polymarket Link" value={form.polymarketLink} onChange={v => setField('polymarketLink', v)} />
      <Field label="Kalshi Link" value={form.kalshiLink} onChange={v => setField('kalshiLink', v)} />
    </>
  )
}

function ConvictionFields({ form, setField }) {
  return (
    <>
      <Field label="Title" value={form.title} onChange={v => setField('title', v)} />
      <Field label="Category" value={form.category} onChange={v => setField('category', v)} />
      <div className="admin-modal-field">
        <label>Status</label>
        <select value={form.status} onChange={e => setField('status', e.target.value)}>
          <option value="">—</option>
          <option value="open">Open</option>
          <option value="expired">Expired</option>
          <option value="closed">Closed</option>
        </select>
      </div>
      <Field label="Position" value={form.position} onChange={v => setField('position', v)} placeholder="e.g. Yes, No, Péter Magyar..." />
      <Field label="Probability (%)" type="number" value={form.probability} onChange={v => setField('probability', v)} />
      <Field label="Opened Date" type="date" value={form.openedDate} onChange={v => setField('openedDate', v)} />
      <Field label="Expires Date" type="date" value={form.expiresDate} onChange={v => setField('expiresDate', v)} />
      <Field label="Closed Date" type="date" value={form.closedDate} onChange={v => setField('closedDate', v)} />
      <div className="admin-modal-field">
        <label>Result</label>
        <select value={form.result} onChange={e => setField('result', e.target.value)}>
          <option value="">—</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </div>
      <Field label="Thesis Link" value={form.thesisLink} onChange={v => setField('thesisLink', v)} />
    </>
  )
}

function Field({ label, value, onChange, type, placeholder }) {
  return (
    <div className="admin-modal-field">
      <label>{label}</label>
      <input
        type={type || 'text'}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  )
}
