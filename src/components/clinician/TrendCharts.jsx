import { useMemo, useState } from 'react'

const SCORE_KEYS = ['energy', 'breathing', 'head_balance', 'general_wellbeing', 'mental_wellbeing']

const TABS = [
  { key: 'overall',            label: 'Overall resultat' },
  { key: 'energy',             label: 'Energi'           },
  { key: 'breathing',          label: 'Andning'          },
  { key: 'head_balance',       label: 'Huvud & balans'   },
  { key: 'general_wellbeing',  label: 'Allmänt mående'   },
  { key: 'mental_wellbeing',   label: 'Mentalt mående'   },
]

const SWE_DAYS = ['Sön', 'Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör']
const TZ = 'Europe/Stockholm'

function toTzDate(isoStr) {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date(isoStr))
}

function buildDays(n) {
  return Array.from({ length: n }, (_, i) => {
    const d   = new Date(Date.now() - (n - 1 - i) * 86400000)
    const pad = x => String(x).padStart(2, '0')
    return {
      date:     `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
      weekday:  d.getDay(),
      dayNum:   d.getDate(),
    }
  })
}

function calcScore(log, key) {
  if (!log) return null
  if (key === 'overall') {
    const vals = SCORE_KEYS.map(k => log[k]).filter(v => typeof v === 'number')
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null
  }
  return typeof log[key] === 'number' ? log[key] : null
}

export default function TrendCharts({ logs }) {
  const [tab,    setTab]    = useState('overall')
  const [period, setPeriod] = useState('week')

  const days = useMemo(() => buildDays(period === 'week' ? 7 : 28), [period])

  const logsByDate = useMemo(() => {
    const map = {}
    for (const log of logs) {
      const d = toTzDate(log.logged_at)
      if (!map[d]) map[d] = []
      map[d].push(log)
    }
    return map
  }, [logs])

  const dayData = days.map(({ date, weekday, dayNum }) => {
    const dayLogs  = logsByDate[date] ?? []
    const latest   = dayLogs[0] ?? null
    const avg      = calcScore(latest, tab)
    const symptoms = [...new Set(dayLogs.flatMap(l => l.selected_symptoms ?? []))]
    return { date, weekday, dayNum, avg, symptoms }
  })

  const isWeek = period === 'week'

  return (
    <div className="cl-card">
      <div className="cl-trend-wrap">

        {/* ── Left: category tabs ── */}
        <div className="cl-trend-tabs">
          {TABS.map(t => (
            <button
              key={t.key}
              className={`cl-trend-tab${tab === t.key ? ' cl-trend-tab--active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Right: period toggle + chart ── */}
        <div className="cl-trend-right">
          <div className="cl-trend-period-row">
            {['week', 'month'].map(p => (
              <button
                key={p}
                className={`cl-trend-period-btn${period === p ? ' active' : ''}`}
                onClick={() => setPeriod(p)}
              >
                {p === 'week' ? 'Vecka' : 'Månad'}
              </button>
            ))}
          </div>

          <div className={`cl-bar-chart cl-bar-chart--${period}`}>
            {dayData.map(({ date, weekday, dayNum, avg, symptoms }) => {
              const heightPct = avg !== null ? Math.max(3, ((avg - 1) / 4) * 100) : 0
              const hasScore  = avg !== null
              const label     = isWeek ? SWE_DAYS[weekday] : String(dayNum)

              return (
                <div key={date} className="cl-bar-col">
                  {/* Value label above bar (week only) */}
                  <div className="cl-bar-value-space">
                    {isWeek && hasScore && (
                      <span className="cl-bar-value">{avg.toFixed(1)}</span>
                    )}
                  </div>

                  {/* Bar track */}
                  <div className="cl-bar-track">
                    {hasScore && (
                      <div className="cl-bar" style={{ height: `${heightPct}%` }} />
                    )}
                  </div>

                  {/* Day label */}
                  <span className="cl-bar-day-label">{label}</span>

                  {/* Symptom area always rendered in week view (keeps columns equal height) */}
                  {isWeek && (
                    <div className="cl-bar-symptoms">
                      {symptoms.slice(0, 2).map(s => (
                        <span key={s} className="cl-bar-symptom">{s}</span>
                      ))}
                      {symptoms.length > 2 && (
                        <span className="cl-bar-symptom">+{symptoms.length - 2}</span>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
