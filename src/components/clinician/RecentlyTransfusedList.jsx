import { useNavigate } from 'react-router-dom'
import { formatRelativeTime } from '../../lib/dates'

function timeRemaining(actionAt) {
  const returnAt = new Date(new Date(actionAt).getTime() + 48 * 60 * 60 * 1000)
  const msLeft   = returnAt - Date.now()
  if (msLeft <= 0) return 'snart'
  const h = Math.floor(msLeft / (60 * 60 * 1000))
  const m = Math.floor((msLeft % (60 * 60 * 1000)) / (60 * 1000))
  return h > 0 ? `${h} h ${m} min` : `${m} min`
}

export default function RecentlyTransfusedList({ actions, patients }) {
  const navigate   = useNavigate()
  const patientMap = new Map(patients.map(p => [p.id, p]))

  // One action per patient — use the most recent one
  const byPatient = new Map()
  for (const a of actions) {
    if (!byPatient.has(a.patient_id) ||
        new Date(a.action_at) > new Date(byPatient.get(a.patient_id).action_at)) {
      byPatient.set(a.patient_id, a)
    }
  }

  const items = Array.from(byPatient.values())
    .map(a => ({ action: a, patient: patientMap.get(a.patient_id) }))
    .filter(({ patient }) => !!patient)
    .sort((a, b) => new Date(b.action.action_at) - new Date(a.action.action_at))

  if (items.length === 0) return null

  return (
    <div className="clinician-card clinician-card--muted">
      <h2 className="clinician-section-title">
        Nyligen transfunderade
        <span className="patient-list-count">{items.length}</span>
      </h2>

      <div className="reviewed-list">
        {items.map(({ action, patient }) => (
          <div
            key={action.id}
            className="reviewed-row"
            onClick={() => navigate(`/kliniker/patient/${patient.id}`)}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && navigate(`/kliniker/patient/${patient.id}`)}
          >
            <span className="material-icons reviewed-row-icon" aria-hidden="true">
              check_circle
            </span>
            <div className="reviewed-row-body">
              <span className="reviewed-row-name">{patient.full_name}</span>
              <span className="reviewed-row-meta">
                Granskad {formatRelativeTime(action.action_at)}.
                {action.note && ` "${action.note}"`}
                {' '}Återgår till lista om {timeRemaining(action.action_at)}.
              </span>
            </div>
            <span className="ptcol-arrow">
              <span className="material-icons" aria-hidden="true">chevron_right</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
