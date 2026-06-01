import { useMemo, useState } from 'react'

const WEEKDAYS = ['MÅN', 'TIS', 'ONS', 'TORS', 'FRE', 'LÖR', 'SÖN']
const MONTHS   = [
  'januari','februari','mars','april','maj','juni',
  'juli','augusti','september','oktober','november','december',
]

const CATS = [
  { key: 'energy',            label: 'Energi'        },
  { key: 'breathing',         label: 'Andning'       },
  { key: 'head_balance',      label: 'Huvud & bal.'  },
  { key: 'general_wellbeing', label: 'Allmänt'       },
  { key: 'mental_wellbeing',  label: 'Mentalt'       },
]

const TZ = 'Europe/Stockholm'

function toDateStr(date) {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(date)
}

function scoreClass(v) {
  if (typeof v !== 'number') return 'none'
  if (v <= 1.5) return '1'
  if (v <= 2.5) return '2'
  if (v <= 3.5) return '3'
  if (v <= 4.5) return '4'
  return '5'
}

function avgAll(log) {
  if (!log) return null
  const keys = ['energy','breathing','head_balance','general_wellbeing','mental_wellbeing']
  const vals = keys.map(k => log[k]).filter(v => typeof v === 'number')
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null
}

export default function LogHistory({ logs }) {
  const today = new Date()
  const [year,  setYear]    = useState(today.getFullYear())
  const [month, setMonth]   = useState(today.getMonth())
  const [selected, setSelected] = useState(null)

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  const logsByDate = useMemo(() => {
    const map = {}
    for (const log of logs) {
      const d = toDateStr(new Date(log.logged_at))
      if (!map[d]) map[d] = []
      map[d].push(log)
    }
    return map
  }, [logs])

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const raw         = new Date(year, month, 1).getDay()
  const firstDay    = raw === 0 ? 6 : raw - 1

  const cells = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const todayStr = toDateStr(today)

  function iso(d) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  }

  const selLogs = selected ? (logsByDate[selected] ?? []) : []
  const selLog  = selLogs[0] ?? null  // most recent log for selected day

  return (
    <div className="cl-card">
      {/* ── Calendar header ── */}
      <div className="cl-log-cal-header">
        <span className="cl-log-cal-month">{MONTHS[month]} {year}</span>
        <div className="cl-cal-nav">
          <button className="cl-cal-nav-btn" onClick={prevMonth} aria-label="Föregående månad">
            <span className="material-icons">chevron_left</span>
          </button>
          <button className="cl-cal-nav-btn" onClick={nextMonth} aria-label="Nästa månad">
            <span className="material-icons">chevron_right</span>
          </button>
        </div>
      </div>

      {/* ── Calendar grid ── */}
      <div className="cl-log-cal-grid">
        {/* Weekday headers */}
        {WEEKDAYS.map(d => (
          <div key={d} className="cl-log-cal-wd">{d}</div>
        ))}

        {/* Day cells */}
        {cells.map((day, i) => {
          if (!day) return <div key={`e${i}`} className="cl-log-cal-cell cl-log-cal-cell--empty" />
          const ds      = iso(day)
          const isToday = ds === todayStr
          const dayLogs = logsByDate[ds] ?? []
          const hasLog  = dayLogs.length > 0
          const isSel   = ds === selected
          const avg     = avgAll(dayLogs[0] ?? null)

          return (
            <div
              key={ds}
              className={[
                'cl-log-cal-cell',
                hasLog  ? 'cl-log-cal-cell--logged' : '',
                isToday ? 'cl-log-cal-cell--today'  : '',
                isSel   ? 'cl-log-cal-cell--sel'    : '',
              ].filter(Boolean).join(' ')}
              onClick={() => hasLog && setSelected(isSel ? null : ds)}
              role={hasLog ? 'button' : undefined}
              tabIndex={hasLog ? 0 : undefined}
              onKeyDown={hasLog ? e => e.key === 'Enter' && setSelected(isSel ? null : ds) : undefined}
              aria-label={hasLog ? `Visa logg för ${day} ${MONTHS[month]}` : undefined}
            >
              <span className="cl-log-cal-day-num">{day}</span>
              {hasLog && avg !== null && (
                <span className={`cl-log-cal-score cl-score cl-score--${scoreClass(avg)}`}>
                  {avg.toFixed(1)}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* ── Selected day detail ── */}
      {selected && selLog && (
        <div className="cl-log-detail">
          <div className="cl-log-detail-header">
            <span className="cl-log-detail-date">
              {parseInt(selected.split('-')[2])} {MONTHS[month]} {year}
            </span>
            {selLog.logged_by_proxy && (
              <span className="cl-log-proxy">
                ★ Loggat av {selLog.proxy_name ?? 'anhörig'}
              </span>
            )}
          </div>

          <div className="cl-log-detail-scores">
            {CATS.map(({ key, label }) => (
              <span key={key} className="cl-log-score-item">
                <span className="cl-log-score-label">{label}</span>
                <span className={`cl-score cl-score--${scoreClass(selLog[key])}`}>
                  {typeof selLog[key] === 'number' ? selLog[key] : '–'}
                </span>
              </span>
            ))}
          </div>

          {selLog.selected_symptoms?.length > 0 && (
            <div className="cl-log-detail-symptoms">
              {selLog.selected_symptoms.map(s => (
                <span key={s} className="cl-symptom-chip">{s}</span>
              ))}
            </div>
          )}

          {selLog.notes && (
            <p className="cl-log-notes">"{selLog.notes}"</p>
          )}
        </div>
      )}

      {logs.length === 0 && (
        <p className="cl-empty">Inga loggar registrerade.</p>
      )}
    </div>
  )
}
