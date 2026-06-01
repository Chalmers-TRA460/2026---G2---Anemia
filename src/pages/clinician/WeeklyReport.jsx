import { useEffect, useMemo, useState } from 'react'
import { getPatients, getWeeklyStats } from '../../lib/clinicianQueries'
import { avgScore, scoreColor, fmtScore, getActiveFlags, FLAG_INFO } from '../../lib/flags'
import FlagBadge from '../../components/clinician/FlagBadge'

const SWE_DAYS    = ['Sön', 'Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör']
const SWE_MONTHS  = ['jan','feb','mar','apr','maj','jun','jul','aug','sep','okt','nov','dec']

function buildWeekDays() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86400000)
    return { dateStr: d.toISOString().slice(0, 10), label: SWE_DAYS[d.getDay()] }
  })
}

function fmtShortDate(dateStr) {
  const [, m, d] = dateStr.split('-')
  return `${parseInt(d)} ${SWE_MONTHS[parseInt(m) - 1]}`
}

// ── Sub-components ────────────────────────────────

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div className="week-stat-card">
      <span className="material-icons week-stat-icon" aria-hidden="true">{icon}</span>
      <div className="week-stat-body">
        <span className="week-stat-label">{label}</span>
        <span className={`week-stat-value${color ? ` week-stat-value--${color}` : ''}`}>
          {value}
        </span>
        {sub && <span className="week-stat-sub">{sub}</span>}
      </div>
    </div>
  )
}

function StatCardSkeleton() {
  return (
    <div className="week-stat-card">
      <span className="skeleton" style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0 }} />
      <div className="week-stat-body">
        <span className="skeleton" style={{ display: 'block', width: '60%', height: 12 }} />
        <span className="skeleton" style={{ display: 'block', width: '40%', height: 22, marginTop: 4 }} />
      </div>
    </div>
  )
}

function DayChart({ dailyAvgs }) {
  const weekDays = buildWeekDays()
  const avgByDay = Object.fromEntries(dailyAvgs.map(x => [x.date, x.avg]))

  return (
    <div className="week-day-chart">
      {weekDays.map(({ dateStr, label }) => {
        const avg = avgByDay[dateStr] ?? null
        const heightPct = avg !== null ? Math.round(((avg - 1) / 4) * 100) : 0
        return (
          <div key={dateStr} className="week-day-col">
            <div className="week-day-bar-track">
              {avg !== null && (
                <div
                  className={`week-day-bar week-day-bar--${scoreColor(avg)}`}
                  style={{ height: `${heightPct}%` }}
                />
              )}
            </div>
            <span className="week-day-label">{label}</span>
            <span className="week-day-val">{avg !== null ? avg.toFixed(1) : '–'}</span>
          </div>
        )
      })}
    </div>
  )
}

// ── Main page ─────────────────────────────────────

export default function WeeklyReport() {
  const [patients,  setPatients]  = useState([])
  const [weekStats, setWeekStats] = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)

  useEffect(() => {
    async function load() {
      const { data: pts, error: pErr } = await getPatients()
      if (pErr) { setError('Kunde inte ladda patientdata.'); setLoading(false); return }
      const ids = (pts ?? []).map(p => p.id)
      setPatients(pts ?? [])
      const { data: stats, error: sErr } = await getWeeklyStats(ids)
      if (sErr) { setError('Kunde inte ladda statistik.'); setLoading(false); return }
      setWeekStats(stats)
      setLoading(false)
    }
    load()
  }, [])

  const patientStats = useMemo(() => {
    if (!patients.length || !weekStats) return []
    const logsByPatient = {}
    for (const log of weekStats.logsRaw) {
      if (!logsByPatient[log.patient_id]) logsByPatient[log.patient_id] = []
      logsByPatient[log.patient_id].push(log)
    }
    for (const id of Object.keys(logsByPatient)) {
      logsByPatient[id].sort((a, b) => b.logged_at.localeCompare(a.logged_at))
    }
    return patients.map(p => {
      const logs      = logsByPatient[p.id] ?? []
      const uniqueDays = new Set(logs.map(l => l.logged_at.slice(0, 10))).size
      const avg       = logs[0] ? avgScore(logs[0]) : null
      const activeFlags = getActiveFlags(logs)
      return { ...p, logs, uniqueDays, avg, activeFlags }
    })
  }, [patients, weekStats])

  const flagSummary = useMemo(() => {
    const counts = {}
    for (const p of patientStats) {
      for (const f of p.activeFlags) counts[f] = (counts[f] ?? 0) + 1
    }
    return Object.entries(counts)
      .sort(([a], [b]) => {
        const severityOrder = { critical: 0, warning: 1 }
        return (severityOrder[FLAG_INFO[a]?.severity] ?? 2) - (severityOrder[FLAG_INFO[b]?.severity] ?? 2)
      })
  }, [patientStats])

  const weekDays   = useMemo(() => buildWeekDays(), [])
  const dateRange  = `${fmtShortDate(weekDays[0].dateStr)} – ${fmtShortDate(weekDays[6].dateStr)}`

  const logged    = patientStats.filter(p => p.uniqueDays > 0)
  const notLogged = patientStats.filter(p => p.uniqueDays === 0)

  if (error) {
    return (
      <>
        <h1 className="clinician-page-title">Veckorapport</h1>
        <div className="clinician-card"><p style={{ color: '#c0392b' }}>{error}</p></div>
      </>
    )
  }

  return (
    <>
      <h1 className="clinician-page-title">Veckorapport</h1>
      <p className="clinician-page-subtitle">{dateRange}</p>

      {/* ── Stat cards ── */}
      <div className="week-stats-grid">
        {loading ? (
          Array.from({ length: 4 }, (_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              icon="group"
              label="Registrerade patienter"
              value={weekStats.totalPatients}
            />
            <StatCard
              icon="event_available"
              label="Loggade denna vecka"
              value={`${weekStats.loggedThisWeek} / ${weekStats.totalPatients}`}
              sub={`${weekStats.pctLogged}% av patienterna`}
              color={weekStats.pctLogged >= 70 ? 'green' : weekStats.pctLogged >= 40 ? 'yellow' : 'red'}
            />
            <StatCard
              icon="insights"
              label="Genomsnittlig poäng"
              value={weekStats.avgScore !== null ? weekStats.avgScore.toFixed(1) : '–'}
              color={weekStats.avgScore !== null ? scoreColor(weekStats.avgScore) : null}
            />
            <StatCard
              icon="check_circle"
              label="Klinikeråtgärder"
              value={weekStats.actionCount}
              sub="granskningar denna vecka"
            />
          </>
        )}
      </div>

      {/* ── Daily trend ── */}
      <div className="clinician-card">
        <h2 className="clinician-section-title">Daglig genomsnittstrend</h2>
        {loading ? (
          <span className="skeleton" style={{ display: 'block', height: 120 }} />
        ) : weekStats.dailyAvgs.length === 0 ? (
          <p className="clinician-empty">Ingen loggningsdata denna vecka.</p>
        ) : (
          <DayChart dailyAvgs={weekStats.dailyAvgs} />
        )}
      </div>

      {/* ── Patient overview ── */}
      <div className="clinician-card">
        <h2 className="clinician-section-title">
          Patientöversikt
          {!loading && <span className="patient-list-count">{patients.length}</span>}
        </h2>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1, 2, 3, 4, 5].map(i => (
              <span key={i} className="skeleton" style={{ display: 'block', height: 44 }} />
            ))}
          </div>
        ) : (
          <>
            {logged.length > 0 && (
              <div className="week-patient-section">
                <div className="week-patient-table-head">
                  <span>Patient</span>
                  <span>Dagar</span>
                  <span>Senaste snitt</span>
                  <span>Flaggor</span>
                </div>
                {logged.map(p => (
                  <div key={p.id} className="week-patient-row">
                    <span className="week-patient-name">{p.full_name}</span>
                    <span className="week-patient-days">{p.uniqueDays} / 7</span>
                    <span>
                      <span className={`score-pill score-pill--${scoreColor(p.avg)}`}>
                        {fmtScore(p.avg)}
                      </span>
                    </span>
                    <span className="week-patient-flags">
                      {p.activeFlags.length > 0
                        ? p.activeFlags.map(f => <FlagBadge key={f} flagKey={f} />)
                        : (
                          <span className="week-patient-ok">
                            <span className="material-icons" aria-hidden="true">check_circle</span>
                            OK
                          </span>
                        )
                      }
                    </span>
                  </div>
                ))}
              </div>
            )}

            {notLogged.length > 0 && (
              <div className={`week-patient-section${logged.length ? ' week-patient-section--separated' : ''}`}>
                <div className="week-not-logged-header">
                  <span className="material-icons week-not-logged-icon" aria-hidden="true">
                    warning
                  </span>
                  Ej loggat denna vecka
                  <span className="patient-list-count">{notLogged.length}</span>
                </div>
                {notLogged.map(p => (
                  <div key={p.id} className="week-not-logged-row">
                    <span className="week-patient-name">{p.full_name}</span>
                    <span className="week-patient-flags">
                      {p.activeFlags.map(f => <FlagBadge key={f} flagKey={f} />)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {!loading && patients.length === 0 && (
              <p className="clinician-empty">Inga patienter registrerade.</p>
            )}
          </>
        )}
      </div>

      {/* ── Flag summary ── */}
      {!loading && flagSummary.length > 0 && (
        <div className="clinician-card">
          <h2 className="clinician-section-title">Flaggöversikt</h2>
          <div className="week-flag-summary">
            {flagSummary.map(([flagKey, count]) => (
              <div key={flagKey} className="week-flag-row">
                <FlagBadge flagKey={flagKey} />
                <span className="week-flag-count">
                  {count} {count === 1 ? 'patient' : 'patienter'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
