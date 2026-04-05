import './MarketsPage.css'

export default function MarketsPage({ items, loading, selected, onSelect, onDelete }) {
  if (loading) return <div className="admin-empty">Loading markets...</div>
  if (items.length === 0) return <div className="admin-empty">No markets found</div>

  return (
    <div className="admin-list">
      {items.map(m => (
        <div
          key={m.rowIndex}
          className={`admin-list-item ${selected?.rowIndex === m.rowIndex ? 'admin-list-item--active' : ''}`}
          onClick={() => onSelect(m)}
        >
          <div className="admin-list-item-content">
            <div className="admin-list-item-title">{m.title}</div>
            <div className="admin-list-item-meta">
              <span>{m.category}</span>
              {m.probability != null && <span className="admin-prob">{m.probability}%</span>}
              {m.platform && <span>{m.platform}</span>}
              {(m.polymarketLink || m.kalshiLink) && (
                <span className="admin-list-item-links">
                  {m.polymarketLink && <a className="admin-link" href={m.polymarketLink} target="_blank" rel="noopener" onClick={e => e.stopPropagation()}>Polymarket</a>}
                  {m.polymarketLink && m.kalshiLink && ' · '}
                  {m.kalshiLink && <a className="admin-link" href={m.kalshiLink} target="_blank" rel="noopener" onClick={e => e.stopPropagation()}>Kalshi</a>}
                </span>
              )}
            </div>
          </div>
          <button
            className="admin-list-item-delete"
            onClick={e => { e.stopPropagation(); onDelete(m) }}
            title="Delete"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
