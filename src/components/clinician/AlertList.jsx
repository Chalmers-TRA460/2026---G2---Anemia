import { avgScore, scoreColor, fmtScore, getActiveFlags } from '../../lib/flags'
import FlagBadge from './FlagBadge'

function AlertRow({ patient, logs, onRequestReview, onRequestMessage }) {
  const flags  = getActiveFlags(logs)
  const latest = logs[0] ?? null
  const avg    = latest ? avgScore(latest) : null
  const color  = scoreColor(avg)

  return (
    <div className="alert-row">
      <div className="alert-row-left">
        <span className="alert-row-name">{patient.full_name}</span>
        <div className="alert-row-flags">
          {flags.map(f => <FlagBadge key={f} flagKey={f} />)}
        </div>
      </div>

      <div className="alert-row-right">
        <span className={`score-pill score-pill--${color}`}>{fmtScore(avg)}</span>

        <button
          className="alert-action-btn alert-action-btn--primary"
          onClick={() => onRequestReview(patient)}
        >
          <span className="material-icons" aria-hidden="true">check_circle</span>
          Granskad
        </button>

        <button
          className="alert-action-btn"
          onClick={() => onRequestMessage(patient, flags)}
        >
          <span className="material-icons" aria-hidden="true">mail</span>
          Meddelande
        </button>
      </div>
    </div>
  )
}

export default function AlertList({ patients, logMap, excludeIds, onRequestReview, onRequestMessage }) {
  const flagged = patients.filter(p => {
    if (excludeIds.has(p.id)) return false
    return getActiveFlags(logMap.get(p.id) ?? []).length > 0
  })

  if (flagged.length === 0) return null

  return (
    <div className="clinician-card clinician-card--alert">
      <h2 className="clinician-section-title clinician-section-title--alert">
        <span className="material-icons" aria-hidden="true">warning</span>
        Larm
        <span className="patient-list-count patient-list-count--alert">{flagged.length}</span>
      </h2>

      <div className="alert-list">
        {flagged.map(p => (
          <AlertRow
            key={p.id}
            patient={p}
            logs={logMap.get(p.id) ?? []}
            onRequestReview={onRequestReview}
            onRequestMessage={onRequestMessage}
          />
        ))}
      </div>
    </div>
  )
}
