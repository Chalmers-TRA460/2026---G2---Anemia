import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { getTodaysLog, getWeekLogs } from '../../lib/logs'
import { getUnreadMessages, markMessageRead } from '../../lib/clinicianQueries'
import {
  getWeekDays,
  formatSwedishDateTime,
  formatRelativeTime,
  getStockholmDateString,
} from '../../lib/dates'
import WeekProgress from '../../components/patient/WeekProgress'

function getFirstName(fullName) {
  return fullName?.trim().split(/\s+/)[0] ?? ''
}

export default function Home() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const { key: locationKey } = useLocation()

  const [messages, setMessages] = useState([])

  // undefined = still loading, null = no log today
  const [todayLog, setTodayLog] = useState(undefined)
  const [weekLogs, setWeekLogs] = useState([])

  const firstName = getFirstName(profile?.full_name)
  const weekDays = useMemo(() => getWeekDays(0), [])

  useEffect(() => {
    if (!profile?.id) return
    getUnreadMessages(profile.id).then(({ data }) => {
      if (data?.length) setMessages(data)
    })
  }, [profile?.id])

  useEffect(() => {
    if (!profile?.id) return
    let cancelled = false

    setTodayLog(undefined) // reset to loading state on each navigation

    async function load() {
      const [{ data: today }, { data: week }] = await Promise.all([
        getTodaysLog(profile.id),
        getWeekLogs(profile.id, weekDays),
      ])
      if (cancelled) return
      setTodayLog(today ?? null)
      setWeekLogs(week ?? [])
    }

    load()
    return () => {
      cancelled = true
    }
  }, [profile?.id, weekDays, locationKey])

  async function handleDismissMessage(id) {
    await markMessageRead(id)
    setMessages(prev => prev.filter(m => m.id !== id))
  }

  const loggedDaysSet = useMemo(
    () => new Set(weekLogs.map(l => getStockholmDateString(new Date(l.logged_at)))),
    [weekLogs]
  )

  const loggedCount = weekDays.filter(d => loggedDaysSet.has(d)).length
  const lastLog = weekLogs.length > 0 ? weekLogs[weekLogs.length - 1] : null
  const loading = todayLog === undefined

  return (
    <div className="page-content">
      {messages.map(msg => (
        <div key={msg.id} className="clinician-message-banner">
          <div className="clinician-message-banner-body">
            <span className="material-icons clinician-message-banner-icon" aria-hidden="true">
              mail
            </span>
            <p className="clinician-message-banner-text">
              <strong>{msg.clinician?.full_name ?? 'Ditt vårdteam'}</strong> har
              skickat dig ett meddelande: {msg.content}
            </p>
          </div>
          <button
            className="clinician-message-banner-btn"
            onClick={() => handleDismissMessage(msg.id)}
          >
            Markera som läst
          </button>
        </div>
      ))}

      <h1 className="home-greeting">
        {firstName ? `Hej, ${firstName}.` : 'Hej.'}
      </h1>

      {loading ? (
        <div className="home-loading">
          <div className="loading-spinner" />
        </div>
      ) : (
        <>
          {/* ── Statuskort ── */}
          {todayLog ? (
            <div className="status-card-done">
              <div className="status-icon-row">
                <span className="material-icons status-check-icon">check_circle</span>
                <p className="status-card-text">
                  {todayLog.logged_by_proxy && todayLog.proxy_name
                    ? `${todayLog.proxy_name} har registrerat dina symtom åt dig idag.`
                    : 'Dina symtom har registrerats för idag.'}
                </p>
              </div>
              <div className="status-btn-row">
                <button
                  className="btn-patient-secondary"
                  onClick={() =>
                    navigate('/patient/logga', {
                      state: { editing: true, log: todayLog },
                    })
                  }
                >
                  Ändra svar
                </button>
                <button
                  className="btn-patient-secondary"
                  onClick={() => navigate('/patient/min-data')}
                >
                  Visa min data
                </button>
              </div>
            </div>
          ) : (
            <div className="status-card-pending">
              <div className="status-icon-row">
                <span className="material-icons-outlined status-pending-icon">
                  assignment
                </span>
                <p className="status-card-text">
                  Det är dags att registrera dina symtom för idag.
                </p>
              </div>
              <button
                className="btn-patient-primary"
                style={{ marginTop: 16 }}
                onClick={() => navigate('/patient/logga')}
              >
                Starta symtomloggning →
              </button>
            </div>
          )}

          {/* ── Din vecka ── */}
          <div className="card">
            <h2 className="card-title">Din vecka</h2>
            <p className="home-week-count">
              Du har loggat <strong>{loggedCount}</strong> av 7 dagar denna vecka
            </p>
            <WeekProgress weekDays={weekDays} loggedDaysSet={loggedDaysSet} />
            <p className="home-last-log">
              {lastLog
                ? `Senaste loggning: ${formatRelativeTime(lastLog.logged_at)}`
                : 'Inga loggningar denna vecka ännu.'}
            </p>
          </div>

          {/* ── Nästa klinikbesök ── */}
          {profile?.next_appointment && (
            <div className="card">
              <h2 className="card-title">Nästa klinikbesök</h2>
              <p className="home-appointment">
                {formatSwedishDateTime(profile.next_appointment)}
              </p>
            </div>
          )}

          {/* ── Ditt vårdteam ── */}
          <div className="card">
            <h2 className="card-title">Ditt vårdteam</h2>
            <p className="home-care-team">
              Hematologi &amp; Koagulation, Sahlgrenska
            </p>
          </div>
        </>
      )}
    </div>
  )
}
