import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  fetchPatient, fetchPatientLogs, fetchActiveFlags, fetchClinicianNotes,
} from '../../lib/clinician'
import { avgLogScore, avgToScoreClass } from '../../lib/flagSorting'
import ReviewedRow       from '../../components/clinician/ReviewedRow'
import AppointmentRow    from '../../components/clinician/AppointmentRow'
import NotesHistory      from '../../components/clinician/NotesHistory'
import NewNotePanel      from '../../components/clinician/NewNotePanel'
import ActiveFlagsSection from '../../components/clinician/ActiveFlagsSection'
import TrendCharts        from '../../components/clinician/TrendCharts'
import LogHistory         from '../../components/clinician/LogHistory'

function Skel({ w = '100%', h = 18 }) {
  return <span className="cl-skeleton" style={{ display: 'block', width: w, height: h }} />
}

function SkeletonTopGrid() {
  return (
    <div className="cl-pv-top-grid" style={{ marginBottom: 20 }}>
      <div className="cl-pv-panel">
        {[80, 90, 160].map((h, i) => (
          <div key={i} className="cl-pv-row" style={i === 2 ? { flex: 1 } : {}}>
            <Skel w="40%" h={11} />
            <div style={{ marginTop: 10 }}><Skel h={h} /></div>
          </div>
        ))}
      </div>
      <div className="cl-pv-panel">
        <div className="cl-pv-new-note">
          <Skel w="35%" h={11} />
          <div style={{ marginTop: 12, flex: 1 }}><Skel h="100%" /></div>
        </div>
      </div>
    </div>
  )
}

export default function PatientView() {
  const { id }   = useParams()
  const navigate = useNavigate()

  const [patient,    setPatient]    = useState(null)
  const [logs,       setLogs]       = useState([])
  const [flags,      setFlags]      = useState([])
  const [notes,      setNotes]      = useState([])
  const [loading,    setLoading]    = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error,      setError]      = useState(null)

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    const [patRes, logsRes, flagsRes, notesRes] = await Promise.all([
      fetchPatient(id),
      fetchPatientLogs(id),
      fetchActiveFlags(id),
      fetchClinicianNotes(id),
    ])
    if (patRes.error || !patRes.data) {
      setError('Patienten hittades inte.')
      setLoading(false)
      setRefreshing(false)
      return
    }
    setPatient(patRes.data)
    setLogs(logsRes.data)
    setFlags(flagsRes.data)
    setNotes(notesRes.data)
    setLoading(false)
    setRefreshing(false)
  }, [id])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    function onVisible() { if (document.visibilityState === 'visible') load() }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [load])

  const avg = avgLogScore(logs[0] ?? null)

  if (!loading && error) {
    return (
      <>
        <button className="cl-back-btn" onClick={() => navigate('/kliniker')}>
          <span className="material-icons" aria-hidden="true">arrow_back</span>
          Tillbaka
        </button>
        <div className="cl-card" style={{ color: 'var(--cl-red)' }}>{error}</div>
      </>
    )
  }

  return (
    <>
      {/* ── Back ── */}
      <button className="cl-back-btn" onClick={() => navigate('/kliniker')}>
        <span className="material-icons" aria-hidden="true">arrow_back</span>
        Tillbaka till dashboard
      </button>

      {/* ── Patient header ── */}
      <div className="cl-pv-header">
        <div className="cl-pv-header-info">
          {loading ? (
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <Skel w={56} h={56} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <Skel w={200} h={26} />
                <Skel w={160} h={14} />
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {avg !== null && (
                <div className={`cl-pv-score-box cl-pv-score-box--${avgToScoreClass(avg)}`}>
                  {avg.toFixed(1)}
                </div>
              )}
              <div>
                <h1 className="cl-page-title" style={{ marginBottom: 2 }}>
                  {patient.full_name}
                </h1>
                <p style={{ margin: 0, fontSize: 14, color: '#555' }}>
                  {patient.email}
                </p>
              </div>
            </div>
          )}
        </div>

        <button
          className="cl-refresh-btn"
          onClick={() => load(true)}
          disabled={loading || refreshing}
          aria-label="Uppdatera patientdata"
        >
          <span
            className="material-icons"
            aria-hidden="true"
            style={{ animation: refreshing ? 'cl-spin 0.7s linear infinite' : 'none' }}
          >
            refresh
          </span>
          Uppdatera
        </button>
      </div>

      {/* ── 2-column top section ── */}
      {loading ? <SkeletonTopGrid /> : (
        <div className="cl-pv-top-grid">
          {/* Left panel: 3 rows */}
          <div className="cl-pv-panel">
            <ReviewedRow
              patient={patient}
              flags={flags}
              onFlagsResolved={setFlags}
            />
            <AppointmentRow
              patient={patient}
              onUpdate={iso => setPatient(p => ({ ...p, next_appointment: iso }))}
            />
            <NotesHistory notes={notes} />
          </div>

          {/* Right panel: new note */}
          <div className="cl-pv-panel">
            <NewNotePanel
              patientId={id}
              onNoteAdded={note => setNotes(prev => [note, ...prev])}
            />
          </div>
        </div>
      )}

      {/* ── Active flags ── */}
      {loading ? (
        <div className="cl-card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Skel w={140} h={11} />
          {[1, 2].map(i => <Skel key={i} h={48} />)}
        </div>
      ) : (
        <ActiveFlagsSection flags={flags} />
      )}

      {/* ── Trend charts ── */}
      {loading ? (
        <div className="cl-card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Skel w={220} h={11} />
          <Skel h={90} />
        </div>
      ) : logs.length > 0 ? (
        <TrendCharts logs={logs} />
      ) : null}

      {/* ── Log history ── */}
      {loading ? (
        <div className="cl-card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Skel w={160} h={11} />
          {[1, 2, 3].map(i => <Skel key={i} h={46} />)}
        </div>
      ) : (
        <LogHistory logs={logs} />
      )}
    </>
  )
}
