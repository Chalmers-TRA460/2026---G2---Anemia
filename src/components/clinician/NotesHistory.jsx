import { useEffect, useState } from 'react'

const TZ = 'Europe/Stockholm'

function formatDate(iso) {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: TZ, day: 'numeric', month: 'short',
    year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso))
}

export default function NotesHistory({ notes }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    function onKey(e) { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      {/* Row — same height as the other two */}
      <div className="cl-pv-row" style={{ borderBottom: 'none' }}>
        <div className="cl-pv-row-header">
          <div>
            <div className="cl-pv-row-label">Anteckningshistorik</div>
            <p className="cl-pv-row-sub" style={{ marginTop: 4 }}>
              {notes.length === 0
                ? 'Inga anteckningar ännu'
                : `${notes.length} anteckning${notes.length === 1 ? '' : 'ar'}`
              }
            </p>
          </div>
          <button
            className="cl-pv-circle-btn"
            onClick={() => setOpen(true)}
            aria-label="Visa anteckningshistorik"
          >
            <span className="material-icons">description</span>
          </button>
        </div>
      </div>

      {/* Modal popup */}
      {open && (
        <div
          className="cl-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="notes-hist-title"
          onClick={e => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="cl-modal cl-modal--notes-hist">
            {/* Header */}
            <div className="cl-notes-modal-header">
              <h3 className="cl-modal-title" id="notes-hist-title">
                Anteckningshistorik
                {notes.length > 0 && (
                  <span className="cl-count-badge" style={{ marginLeft: 8 }}>{notes.length}</span>
                )}
              </h3>
              <button
                className="cl-icon-btn"
                onClick={() => setOpen(false)}
                aria-label="Stäng"
              >
                <span className="material-icons">close</span>
              </button>
            </div>

            {/* Scrollable notes list */}
            <div className="cl-notes-modal-body">
              {notes.length === 0 ? (
                <p className="cl-empty">Inga anteckningar ännu.</p>
              ) : (
                notes.map(note => (
                  <div key={note.id} className="cl-note-item">
                    <div className="cl-note-meta">
                      <span className="cl-note-author">{note.author?.full_name ?? 'Okänd'}</span>
                      <span className="cl-note-time">{formatDate(note.created_at)}</span>
                      {note.updated_at && note.updated_at !== note.created_at && (
                        <span className="cl-note-edited">(redigerad)</span>
                      )}
                    </div>
                    <p className="cl-note-content">{note.content}</p>
                  </div>
                ))
              )}
            </div>

            <div className="cl-modal-actions" style={{ marginTop: 4 }}>
              <button className="cl-btn-secondary" onClick={() => setOpen(false)}>
                Stäng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
