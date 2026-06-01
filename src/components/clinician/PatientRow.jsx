import { useNavigate } from 'react-router-dom'
import { avgLogScore, avgToScoreClass } from '../../lib/flagSorting'
import FlagChip from './FlagChip'

const TZ = 'Europe/Stockholm'

function formatAppt(iso) {
  const d = new Date(iso)
  return {
    date: new Intl.DateTimeFormat('sv-SE', { timeZone: TZ, weekday: 'short', day: 'numeric', month: 'short' }).format(d),
    time: new Intl.DateTimeFormat('sv-SE', { timeZone: TZ, hour: '2-digit', minute: '2-digit' }).format(d),
  }
}

function BigScore({ score }) {
  if (score === null || score === undefined) {
    return <span className="cl-row-score cl-row-score--none">–</span>
  }
  return (
    <span className={`cl-row-score cl-score-text--${avgToScoreClass(score)}`}>
      {score.toFixed(1)}
    </span>
  )
}

export default function PatientRow({ patient, subLabel }) {
  const navigate    = useNavigate()
  const latestScore = avgLogScore(patient.latestLog)
  const weekAvg     = patient.weekAvg ?? null
  const appt        = patient.next_appointment ? formatAppt(patient.next_appointment) : null

  function go() { navigate(`/kliniker/patient/${patient.id}`) }

  return (
    <div
      className="cl-pt-row"
      role="button"
      tabIndex={0}
      aria-label={`Öppna patientvy för ${patient.full_name}`}
      onClick={go}
      onKeyDown={e => e.key === 'Enter' && go()}
    >
      {/* Col 1 — name + sub-label + flag chips */}
      <div className="cl-pt-row-name-col">
        <span className="cl-pt-row-name">{patient.full_name}</span>
        {subLabel && <span className="cl-pt-row-sub">{subLabel}</span>}
        {patient.flags?.length > 0 && (
          <div className="cl-pt-row-flags">
            {patient.flags.map(f => <FlagChip key={f.id} flag={f} />)}
          </div>
        )}
      </div>

      {/* Col 2 — next appointment */}
      <div className="cl-pt-row-appt-col">
        {appt
          ? <><span className="cl-pt-appt-date">{appt.date}</span><span className="cl-pt-appt-time">kl {appt.time}</span></>
          : <span className="cl-pt-no-appt">Ej inbokat</span>
        }
      </div>

      {/* Col 3 — latest log */}
      <div className="cl-pt-row-score-col"><BigScore score={latestScore} /></div>

      {/* Col 4 — 7-day avg */}
      <div className="cl-pt-row-score-col"><BigScore score={weekAvg} /></div>

      <span className="material-icons cl-pt-row-arrow" aria-hidden="true">chevron_right</span>
    </div>
  )
}
