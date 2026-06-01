import { useCallback, useEffect, useState } from 'react'
import { fetchDashboardData, enrichPatients } from '../../lib/clinician'
import TodayWidget           from '../../components/clinician/TodayWidget'
import RiskList              from '../../components/clinician/RiskList'
import RankingList           from '../../components/clinician/RankingList'
import RecentlyReviewedList  from '../../components/clinician/RecentlyReviewedList'

const UPCOMING_MS = 48 * 60 * 60 * 1000

function SkeletonRows({ n = 5 }) {
  return Array.from({ length: n }, (_, i) => (
    <div key={i} className="cl-patient-row" style={{ pointerEvents: 'none' }}>
      <span className="cl-skeleton" style={{ flex: 1, height: 15 }} />
      <span className="cl-skeleton" style={{ width: 80, height: 18, flexShrink: 0 }} />
      <span className="cl-skeleton" style={{ width: 32, height: 20, flexShrink: 0 }} />
      <span className="cl-skeleton" style={{ width: 20, height: 20, flexShrink: 0 }} />
    </div>
  ))
}

export default function Dashboard() {
  const [patients,    setPatients]    = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [refreshing,  setRefreshing]  = useState(false)
  const [error,       setError]       = useState(null)

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    const raw = await fetchDashboardData()
    if (raw.error) {
      setError('Kunde inte hämta patientdata.')
      setLoading(false)
      setRefreshing(false)
      return
    }
    setPatients(enrichPatients(raw))
    setLoading(false)
    setRefreshing(false)
  }, [])

  useEffect(() => { load() }, [load])

  // Refetch when user tabs back to the app
  useEffect(() => {
    function onVisible() { if (document.visibilityState === 'visible') load() }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [load])

  // Partition patients
  const now    = Date.now()
  const cutoff = now + UPCOMING_MS

  const reviewedPatients = (patients ?? []).filter(p => p.recentlyReviewed)
  const reviewedIds      = new Set(reviewedPatients.map(p => p.id))

  const todayPatients = (patients ?? []).filter(p =>
    !reviewedIds.has(p.id) &&
    p.next_appointment &&
    new Date(p.next_appointment).getTime() > now &&
    new Date(p.next_appointment).getTime() <= cutoff
  )
  const todayIds  = new Set(todayPatients.map(p => p.id))
  const excludeIds = new Set([...todayIds, ...reviewedIds])

  const riskPatients    = (patients ?? []).filter(p => !excludeIds.has(p.id) && p.flags.length > 0)
  const rankingPatients = (patients ?? []).filter(p => !excludeIds.has(p.id) && p.flags.length === 0)

  return (
    <div>
      {/* ── Page header ── */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 className="cl-page-title">Dashboard</h1>
          {!loading && patients && (
            <p className="cl-page-sub">{patients.length} patienter totalt</p>
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

      {/* ── Error ── */}
      {error && (
        <div className="cl-card" style={{ color: 'var(--cl-red)' }}>
          {error}
        </div>
      )}

      {/* ── Loading skeleton ── */}
      {loading && (
        <>
          <div className="cl-card">
            <span className="cl-skeleton" style={{ display: 'block', width: 200, height: 13, marginBottom: 18 }} />
            <SkeletonRows n={2} />
          </div>
          <div className="cl-card">
            <span className="cl-skeleton" style={{ display: 'block', width: 160, height: 13, marginBottom: 18 }} />
            <SkeletonRows n={5} />
          </div>
        </>
      )}

      {/* ── Live content ── */}
      {!loading && !error && (
        patients.length === 0 ? (
          <div className="cl-card">
            <p className="cl-empty">Inga patienter registrerade ännu.</p>
          </div>
        ) : (
          <>
            <TodayWidget          patients={todayPatients} />
            <RiskList             patients={riskPatients} />
            <RankingList          patients={rankingPatients} />
            <RecentlyReviewedList patients={reviewedPatients} />
          </>
        )
      )}
    </div>
  )
}
