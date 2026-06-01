import { useState } from 'react'
import { updateNextAppointment } from '../../lib/clinician'

const TZ = 'Europe/Stockholm'

function formatAppt(iso) {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: TZ,
    weekday: 'long',
    year:    'numeric',
    month:   'long',
    day:     'numeric',
    hour:    '2-digit',
    minute:  '2-digit',
  }).format(new Date(iso))
}

function toLocalInput(iso) {
  if (!iso) return ''
  const d   = new Date(iso)
  const pad = n => String(n).padStart(2, '0')
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}`
  )
}

export default function AppointmentCard({ patient, onUpdate }) {
  const [editing, setEditing] = useState(false)
  const [dt,      setDt]      = useState(toLocalInput(patient.next_appointment))
  const [saving,  setSaving]  = useState(false)

  function openEdit() {
    setDt(toLocalInput(patient.next_appointment))
    setEditing(true)
  }

  function cancelEdit() {
    setEditing(false)
    setDt(toLocalInput(patient.next_appointment))
  }

  async function handleSave() {
    if (!dt) return
    setSaving(true)
    const iso = new Date(dt).toISOString()
    const { error } = await updateNextAppointment(patient.id, iso)
    if (!error) onUpdate(iso)
    setSaving(false)
    setEditing(false)
  }

  return (
    <div className="cl-card">
      <div className="cl-section-header" style={{ marginBottom: editing ? 12 : 0 }}>
        <span className="cl-card-title" style={{ margin: 0 }}>Nästa besök</span>
        {!editing && (
          <button
            className="cl-icon-btn"
            onClick={openEdit}
            aria-label="Redigera nästa besök"
          >
            <span className="material-icons" aria-hidden="true">edit</span>
          </button>
        )}
      </div>

      {editing ? (
        <div className="cl-appt-edit">
          <input
            type="datetime-local"
            className="cl-appt-input"
            value={dt}
            onChange={e => setDt(e.target.value)}
            autoFocus
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button className="cl-btn-primary" onClick={handleSave} disabled={saving || !dt}>
              {saving ? 'Sparar…' : 'Spara'}
            </button>
            <button className="cl-btn-secondary" onClick={cancelEdit} disabled={saving}>
              Avbryt
            </button>
          </div>
        </div>
      ) : patient.next_appointment ? (
        <p className="cl-appt-date">{formatAppt(patient.next_appointment)}</p>
      ) : (
        <p className="cl-appt-missing">⚠ Behöver bokas</p>
      )}
    </div>
  )
}
