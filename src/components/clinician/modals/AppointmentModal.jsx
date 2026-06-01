import { useState } from 'react'
import { formatSwedishDateTime } from '../../../lib/dates'
import { useEscapeKey } from '../../../hooks/useEscapeKey'

function toLocalInput(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = n => String(n).padStart(2, '0')
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}`
  )
}

export default function AppointmentModal({ patient, onConfirm, onClose, saving }) {
  useEscapeKey(() => { if (!saving) onClose() })
  const [dt,   setDt]   = useState(toLocalInput(patient.next_appointment))
  const [note, setNote] = useState('')

  const isEdit = !!patient.next_appointment

  return (
    <div className="cl-modal-overlay" role="dialog" aria-modal="true"
      aria-labelledby="appt-modal-title">
      <div className="cl-modal">
        <h3 className="cl-modal-title" id="appt-modal-title">
          {isEdit ? 'Ändra besök' : 'Lägg till besök'} — {patient.full_name}
        </h3>
        {isEdit && (
          <p className="cl-modal-body">
            Nuvarande: {formatSwedishDateTime(patient.next_appointment)}
          </p>
        )}

        <label className="cl-modal-label" htmlFor="appt-dt">Datum och tid</label>
        <input
          id="appt-dt"
          type="datetime-local"
          className="cl-modal-input"
          value={dt}
          onChange={e => setDt(e.target.value)}
          autoFocus
        />

        <label className="cl-modal-label" htmlFor="appt-note">Anteckning (valfritt)</label>
        <input
          id="appt-note"
          type="text"
          className="cl-modal-input"
          placeholder="T.ex. Kontrollprov, mottagning"
          value={note}
          onChange={e => setNote(e.target.value)}
          maxLength={200}
        />

        <div className="cl-modal-actions">
          <button
            className="cl-btn-primary"
            onClick={() => onConfirm(new Date(dt).toISOString(), note.trim())}
            disabled={saving || !dt}
          >
            {saving ? 'Sparar…' : 'Spara besök'}
          </button>
          <button className="cl-btn-secondary" onClick={onClose} disabled={saving}>
            Avbryt
          </button>
        </div>
      </div>
    </div>
  )
}
