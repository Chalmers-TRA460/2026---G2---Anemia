import { useNavigate } from 'react-router-dom'
import { avgLogScore, avgToScoreClass } from '../../lib/flagSorting'
import FlagChip from './FlagChip'

const TZ = 'Europe/Stockholm'

function formatAppt(iso) {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: TZ,
    weekday: 'short',
    day:     'numeric',
    month:   'short',
    hour:    '2-digit',
    minute:  '2-digit',
  }).format(new Date(iso))
}

function ScoreValue({ score }) {
  if (score === null) return <span className="cl-pt-no-data">–</span>
  const cls = avgToScoreClass(score)
  return <span className={`cl-pt-score cl-score-text--${cls}`}>{score.toFixed(1)}</span>
}

export default function PatientCard({ patient }) {
  const navigate    = useNavigate()
  const latestScore = avgLogScore(patient.latestLog)
  const weekAvg     = patient.weekAvg ?? null

  function go() { navigate(`/kliniker/patient/${patient.id}`) }

  return (
    <div
      className="cl-pt-card"
      role="button"
      tabIndex={0}
      aria-label={`Öppna patientvy för ${patient.full_name}`}
      onClick={go}
      onKeyDown={e => e.key === 'Enter' && go()}
    >
      <div className="cl-pt-card-top">
        <span className="cl-pt-name">{patient.full_name}</span>
        <span className="material-icons cl-pt-arrow" aria-hidden="true">chevron_right</span>
      </div>

      {patient.flags?.length > 0 && (
        <div className="cl-pt-flags">
          {patient.flags.map(f => <FlagChip key={f.id} flag={f} />)}
        </div>
      )}

      <div className="cl-pt-stats">
        <div className="cl-pt-stat">
          <span className="cl-pt-stat-label">Nästa besök</span>
          <span className={`cl-pt-stat-value${!patient.next_appointment ? ' cl-pt-no-appt' : ''}`}>
            {patient.next_appointment ? formatAppt(patient.next_appointment) : 'Ej inbokat'}
          </span>
        </div>
        <div className="cl-pt-stat">
          <span className="cl-pt-stat-label">Senaste loggning</span>
          <ScoreValue score={latestScore} />
        </div>
        <div className="cl-pt-stat">
          <span className="cl-pt-stat-label">Senaste 7 dagar</span>
          {weekAvg !== null
            ? <span className={`cl-pt-score cl-score-text--${avgToScoreClass(weekAvg)}`}>
                {weekAvg.toFixed(1)} snitt
              </span>
            : <span className="cl-pt-no-data">–</span>
          }
        </div>
      </div>
    </div>
  )
}
