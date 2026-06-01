import { useEffect, useState } from 'react'
import { getPatientAppointments, updateAppointmentStatus, updatePatientAppointment } from '../../../lib/clinicianQueries'
import { formatSwedishDateTime } from '../../../lib/dates'
import { useEscapeKey } from '../../../hooks/useEscapeKey'

const STATUS_LABEL = {
  scheduled: 'Inbokad',
  cancelled: 'Avbokad',
  completed: 'Genomförd',
}

const STATUS_CLASS = {
  scheduled: 'cl-appt-status--scheduled',
  cancelled: 'cl-appt-status--cancelled',
  completed: 'cl-appt-status--completed',
}

export default function AppointmentHistoryModal({ patient, onAppointmentChanged, onClose }) {
  useEscapeKey(onClose)
  const [appointments, setAppointments] = useState([])
  const [loading,      setLoading]      = useState(true)
  const [cancelling,   setCancelling]   = useState(null)

  useEffect(() => {
    getPatientAppointments(patient.id).then(({ data }) => {
      setAppointments(data ?? [])
      setLoading(false)
    })
  }, [patient.id])

  async function handleCancel(id) {
    setCancelling(id)
    const { error } = await updateAppointmentStatus(id, 'cancelled')
    if (!error) {
      const updated = appointments.map(a =>
        a.id === id ? { ...a, status: 'cancelled' } : a
      )
      setAppointments(updated)

      // Recalculate and persist the patient's next upcoming appointment
      const now = new Date().toISOString()
      const next = updated
        .filter(a => a.status === 'scheduled' && a.scheduled_for > now)
        .sort((a, b) => a.scheduled_for.localeCompare(b.scheduled_for))[0]
      const nextValue = next?.scheduled_for ?? null
      await updatePatientAppointment(patient.id, nextValue)
      onAppointmentChanged?.(nextValue)
    }
    setCancelling(null)
  }

  return (
    <div className="cl-modal-overlay" role="dialog" aria-modal="true"
      aria-labelledby="appt-history-title">
      <div className="cl-modal cl-modal--wide cl-modal--tall">
        <div className="cl-modal-header">
          <h3 className="cl-modal-title" id="appt-history-title">
            Besökshistorik — {patient.full_name}
          </h3>
          <button className="cl-modal-close-btn" onClick={onClose} aria-label="Stäng">
            <span className="material-icons">close</span>
          </button>
        </div>

        {loading ? (
          <div className="cl-appt-history-loading">
            <div className="loading-spinner" />
          </div>
        ) : appointments.length === 0 ? (
          <p className="clinician-empty">Inga besök registrerade.</p>
        ) : (
          <div className="cl-appt-history-list">
            {appointments.map(a => (
              <div key={a.id} className="cl-appt-history-row">
                <div className="cl-appt-history-left">
                  <span className="cl-appt-history-date">
                    {formatSwedishDateTime(a.scheduled_for)}
                  </span>
                  {a.notes && (
                    <span className="cl-appt-history-note">{a.notes}</span>
                  )}
                </div>
                <div className="cl-appt-history-right">
                  <span className={`cl-appt-status ${STATUS_CLASS[a.status] ?? ''}`}>
                    {STATUS_LABEL[a.status] ?? a.status}
                  </span>
                  {a.status === 'scheduled' && (
                    <button
                      className="cl-note-btn cl-note-btn--danger"
                      onClick={() => handleCancel(a.id)}
                      disabled={cancelling === a.id}
                    >
                      {cancelling === a.id ? 'Avbokar…' : 'Avboka'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="cl-modal-actions">
          <button className="cl-btn-secondary" style={{ flex: 'none' }} onClick={onClose}>
            Stäng
          </button>
        </div>
      </div>
    </div>
  )
}
