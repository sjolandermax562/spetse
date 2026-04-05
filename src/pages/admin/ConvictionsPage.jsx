import './MarketsPage.css'
import './ConvictionsPage.css'

export default function ConvictionsPage({ items, loading, selected, onSelect, onDelete }) {
  if (loading) return <div className="admin-empty">Loading convictions...</div>
  if (items.length === 0) return <div className="admin-empty">No convictions found</div>

  return (
    <div className="admin-list">
      {items.map(c => (
        <div
          key={c.rowIndex}
          className={`admin-list-item ${selected?.rowIndex === c.rowIndex ? 'admin-list-item--active' : ''}`}
          onClick={() => onSelect(c)}
        >
          <div className="admin-list-item-content">
            <div className="admin-list-item-title">
              {c.title}
              {c.thesisLink && (
                <>
                  {' '}
                  <a className="admin-link" href={c.thesisLink} target="_blank" rel="noopener" onClick={e => e.stopPropagation()}>thesis</a>
                </>
              )}
            </div>
            <div className="admin-list-item-meta">
              <span>{c.category}</span>
              {c.status && (
                <span className={`admin-conv-status admin-conv-status--${c.status}`}>
                  {c.status}
                </span>
              )}
              {c.position && (
                <span className={`admin-badge admin-badge--${c.position}`}>{c.position}</span>
              )}
              {c.probability != null && <span className="admin-prob">{c.probability}%</span>}
            </div>
          </div>
          <button
            className="admin-list-item-delete"
            onClick={e => { e.stopPropagation(); onDelete(c) }}
            title="Delete"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
