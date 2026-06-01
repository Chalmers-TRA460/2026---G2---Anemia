import { useState } from 'react'
import { useEscapeKey } from '../../../hooks/useEscapeKey'

export default function SendMessageModal({ patient, defaultText, onSend, onClose, saving }) {
  useEscapeKey(() => { if (!saving) onClose() })
  const [content, setContent] = useState(defaultText ?? '')

  return (
    <div className="cl-modal-overlay" role="dialog" aria-modal="true"
      aria-labelledby="msg-modal-title">
      <div className="cl-modal cl-modal--wide">
        <h3 className="cl-modal-title" id="msg-modal-title">
          Skicka meddelande till {patient.full_name}
        </h3>
        <p className="cl-modal-body">
          Meddelandet visas som en banner i patientens app nästa gång de öppnar den.
        </p>

        <label className="cl-modal-label" htmlFor="msg-content">Meddelande</label>
        <textarea
          id="msg-content"
          className="cl-modal-textarea"
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={6}
          autoFocus
        />

        <div className="cl-modal-actions">
          <button
            className="cl-btn-primary"
            onClick={() => onSend(content.trim())}
            disabled={saving || !content.trim()}
          >
            {saving ? 'Skickar…' : 'Skicka'}
          </button>
          <button className="cl-btn-secondary" onClick={onClose} disabled={saving}>
            Avbryt
          </button>
        </div>
      </div>
    </div>
  )
}
