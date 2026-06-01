import { useState } from 'react'
import { updateNextAppointment } from '../../lib/clinician'
import CalendarPicker from './CalendarPicker'

const TZ = 'Europe/Stockholm'

function formatDisplay(iso) {
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

function formatChip(dateStr) {
  if (!dateStr) return 'Välj datum'
  const d = new Date(dateStr + 'T12:00')
  return new Intl.DateTimeFormat('sv-SE', {
    weekday: 'short', day: 'numeric', month: 'short',
  }).format(d)
}

function defaultDate() {
  const d   = new Date(Date.now() + 21 * 86400000)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function splitIso(iso) {
  if (!iso) return { date: defaultDate(), time: '09:00' }
  const d   = new Date(iso)
  const pad = n => String(n).padStart(2, '0')
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  }
}

export default function AppointmentRow({ patient, onUpdate }) {
  const [editing,  setEditing]  = useState(false)
  const [calOpen,  setCalOpen]  = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [date,     setDate]     = useState('')
  const [time,     setTime]     = useState('09:00')

  function openEdit() {
    const parts = splitIso(patient.next_appointment)
    setDate(parts.date)
    setTime(parts.time)
    setCalOpen(false)
    setEditing(true)
  }

  function cancelEdit() {
    setEditing(false)
    setCalOpen(false)
  }

  async function handleSave() {
    if (!date || !time) return
    setSaving(true)
    const iso = new Date(`${date}T${time}`).toISOString()
    const { error } = await updateNextAppointment(patient.id, iso)
    if (!error) onUpdate(iso)
    setSaving(false)
    setEditing(false)
    setCalOpen(false)
  }

  return (
    <div className="cl-pv-row">
      {!editing ? (
        /* ── Display mode ── */
        <div className="cl-pv-row-header">
          <div>
            <div className="cl-pv-row-label">Nästa bokning</div>
            {patient.next_appointment ? (
              <p className="cl-pv-row-sub" style={{ marginTop: 4 }}>
                {formatDisplay(patient.next_appointment)}
              </p>
            ) : (
              <p className="cl-pv-appt-missing" style={{ marginTop: 4 }}>
                ⚠ Behöver bokas
              </p>
            )}
          </div>
          <button
            className="cl-pv-circle-btn"
            onClick={openEdit}
            aria-label="Boka / ändra besök"
          >
            <span className="material-icons">calendar_month</span>
          </button>
        </div>
      ) : (
        /* ── Edit mode ── */
        <>
          <div className="cl-appt-edit-bar">
            {/* Date chip — click to open calendar */}
            <button
              className={`cl-date-chip${calOpen ? ' cl-date-chip--open' : ''}`}
              onClick={() => setCalOpen(v => !v)}
              aria-expanded={calOpen}
              aria-label="Välj datum"
            >
              <span className="material-icons cl-date-chip-icon">calendar_today</span>
              {formatChip(date)}
            </button>

            {/* Time input */}
            <input
              type="time"
              className="cl-time-input"
              value={time}
              onChange={e => setTime(e.target.value)}
              aria-label="Välj tid"
            />

            <div className="cl-appt-edit-actions">
              <button className="cl-btn-secondary" onClick={cancelEdit} disabled={saving}>
                Avbryt
              </button>
              <button
                className="cl-btn-primary"
                onClick={handleSave}
                disabled={saving || !date || !time}
              >
                {saving ? 'Sparar…' : 'Spara'}
              </button>
            </div>
          </div>

          {/* Inline calendar */}
          {calOpen && (
            <div style={{ marginTop: 12 }}>
              <CalendarPicker
                value={date}
                onChange={d => setDate(d)}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}
