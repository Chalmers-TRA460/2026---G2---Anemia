import { scoreColor } from '../../lib/flags'
import { formatSwedishDateTime } from '../../lib/dates'

const CATEGORIES = [
  { key: 'energy',            label: 'Energi'       },
  { key: 'breathing',         label: 'Andning'      },
  { key: 'head_balance',      label: 'Huvud/balans'  },
  { key: 'general_wellbeing', label: 'Allmänt'      },
  { key: 'mental_wellbeing',  label: 'Mentalt'      },
]

function LogEntry({ log }) {
  return (
    <div className="log-entry">
      <div className="log-entry-header">
        <span className="log-entry-date">
          {formatSwedishDateTime(log.logged_at)}
        </span>
        {log.logged_by_proxy && (
          <span className="log-entry-proxy">
            <span className="material-icons" aria-hidden="true">supervisor_account</span>
            Loggad av {log.proxy_name ?? 'anhörig'}
          </span>
        )}
      </div>

      <div className="log-entry-scores">
        {CATEGORIES.map(({ key, label }) => {
          const val = log[key]
          return (
            <span key={key} className="log-entry-score-item">
              <span className="log-entry-score-label">{label}</span>
              <span className={`score-pill score-pill--${scoreColor(val)}`}>
                {typeof val === 'number' ? val : '–'}
              </span>
            </span>
          )
        })}
      </div>

      {log.selected_symptoms?.length > 0 && (
        <div className="log-entry-symptoms">
          {log.selected_symptoms.map(s => (
            <span key={s} className="log-symptom-chip">{s}</span>
          ))}
        </div>
      )}

      {log.notes && (
        <p className="log-entry-notes">"{log.notes}"</p>
      )}
    </div>
  )
}

export default function LogHistoryList({ logs }) {
  if (!logs.length) {
    return <p className="clinician-empty">Ingen loggningshistorik de senaste 28 dagarna.</p>
  }
  return (
    <div className="log-history-list">
      {logs.map(log => <LogEntry key={log.id} log={log} />)}
    </div>
  )
}
