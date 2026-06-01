import { useState } from 'react'
import { useEscapeKey } from '../../../hooks/useEscapeKey'

export default function MarkReviewedModal({ patient, onConfirm, onClose, saving }) {
  useEscapeKey(() => { if (!saving) onClose() })
  const [note, setNote] = useState('')

  return (
    <div className="cl-modal-overlay" role="dialog" aria-modal="true"
      aria-labelledby="review-modal-title">
      <div className="cl-modal">
        <h3 className="cl-modal-title" id="review-modal-title">
          Markera {patient.full_name} som granskad?
        </h3>
        <p className="cl-modal-body">
          Patienten flyttas till "Nyligen transfunderade" i 48 timmar.
        </p>

        <label className="cl-modal-label" htmlFor="review-note">
          Anteckning (valfritt)
        </label>
        <input
          id="review-note"
          type="text"
          className="cl-modal-input"
          placeholder="T.ex. Transfusion given"
          value={note}
          onChange={e => setNote(e.target.value)}
          maxLength={200}
          autoFocus
        />

        <div className="cl-modal-actions">
          <button
            className="cl-btn-primary"
            onClick={() => onConfirm(note.trim())}
            disabled={saving}
          >
            {saving ? 'Sparar…' : 'Bekräfta'}
          </button>
          <button className="cl-btn-secondary" onClick={onClose} disabled={saving}>
            Avbryt
          </button>
        </div>
      </div>
    </div>
  )
}
