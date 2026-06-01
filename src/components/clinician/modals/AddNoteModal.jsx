import { useState } from 'react'
import { useEscapeKey } from '../../../hooks/useEscapeKey'

export default function AddNoteModal({ note, onSave, onClose, saving }) {
  useEscapeKey(() => { if (!saving) onClose() })
  const [content, setContent] = useState(note?.content ?? '')

  return (
    <div className="cl-modal-overlay" role="dialog" aria-modal="true"
      aria-labelledby="note-modal-title">
      <div className="cl-modal cl-modal--wide">
        <h3 className="cl-modal-title" id="note-modal-title">
          {note ? 'Redigera anteckning' : 'Ny anteckning'}
        </h3>

        <label className="cl-modal-label" htmlFor="note-content">Anteckning</label>
        <textarea
          id="note-content"
          className="cl-modal-textarea"
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={6}
          placeholder="Skriv en anteckning om patienten…"
          autoFocus
        />

        <div className="cl-modal-actions">
          <button
            className="cl-btn-primary"
            onClick={() => onSave(content.trim())}
            disabled={saving || !content.trim()}
          >
            {saving ? 'Sparar…' : 'Spara'}
          </button>
          <button className="cl-btn-secondary" onClick={onClose} disabled={saving}>
            Avbryt
          </button>
        </div>
      </div>
    </div>
  )
}
