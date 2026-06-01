import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getWeekLogs } from '../../lib/logs'
import { getWeekDays, getWeekNumber } from '../../lib/dates'
import { computeWeekAvg, computeFieldAvg } from '../../lib/stats'
import WeeklySummaryCard from '../../components/patient/WeeklySummaryCard'
import DailyChart from '../../components/patient/DailyChart'
import TrendStrip from '../../components/patient/TrendStrip'
import CategoryCard from '../../components/patient/CategoryCard'

const CATEGORIES = [
  { key: 'energy',          emoji: '⚡',   label: 'Energi',         color: '#e67e22' },
  { key: 'breathing',       emoji: '🫁',   label: 'Andning',        color: '#2980b9' },
  { key: 'head_balance',    emoji: '🧠',   label: 'Huvud & balans', color: '#8e44ad' },
  { key: 'general_wellbeing', emoji: '🌡️', label: 'Allmänt mående', color: '#27ae60' },
  { key: 'mental_wellbeing',  emoji: '💭', label: 'Mentalt mående', color: '#34495e' },
]

// Fetch all 4 weeks of data once
function useWeeksData(patientId) {
  const [weeksData, setWeeksData] = useState(null) // null = loading

  const weekDaySets = useMemo(
    () => [getWeekDays(0), getWeekDays(-1), getWeekDays(-2), getWeekDays(-3)],
    []
  )

  useEffect(() => {
    if (!patientId) return
    let cancelled = false

    async function load() {
      const results = await Promise.all(
        weekDaySets.map(days => getWeekLogs(patientId, days))
      )
      if (cancelled) return
      setWeeksData(
        results.map((r, i) => ({
          days: weekDaySets[i],
          logs: r.data ?? [],
          weekNum: getWeekNumber(weekDaySets[i][0]),
        }))
      )
    }

    load()
    return () => { cancelled = true }
  }, [patientId, weekDaySets])

  return weeksData
}

export default function MyData() {
  const { profile } = useAuth()
  const weeksData = useWeeksData(profile?.id)

  if (weeksData === null) {
    return (
      <div className="page-content">
        <span className="page-tag">Min data</span>
        <h1 className="page-title">Hur du har mått</h1>
        <div className="home-loading">
          <div className="loading-spinner" />
        </div>
      </div>
    )
  }

  const thisWeek = weeksData[0]
  const lastWeek = weeksData[1]

  // TrendStrip expects oldest → newest
  const trendWeeks = [...weeksData].reverse()

  return (
    <div className="page-content">
      <span className="page-tag">Min data</span>
      <h1 className="page-title">Hur du har mått</h1>

      {/* ── 1. Veckans sammanfattning ── */}
      <WeeklySummaryCard logs={thisWeek.logs} />

      {/* ── 2. Daglig graf för denna vecka ── */}
      <div className="card">
        <h2 className="card-title">Den här veckan, dag för dag</h2>
        <DailyChart logs={thisWeek.logs} weekDays={thisWeek.days} />
      </div>

      {/* ── 3. Trend – 4 senaste veckorna ── */}
      <div className="card">
        <h2 className="card-title">Senaste 4 veckorna</h2>
        <TrendStrip weeksData={trendWeeks} />
      </div>

      {/* ── 4. Per kategori ── */}
      <div className="card">
        <h2 className="card-title">Per kategori</h2>
        <div className="category-data-list">
          {CATEGORIES.map(cat => (
            <CategoryCard
              key={cat.key}
              emoji={cat.emoji}
              label={cat.label}
              color={cat.color}
              thisAvg={computeFieldAvg(thisWeek.logs, cat.key)}
              lastAvg={computeFieldAvg(lastWeek.logs, cat.key)}
            />
          ))}
        </div>
      </div>

      {/* ── Fotnot ── */}
      <p className="data-footnote">
        Din data delas säkert med ditt vårdteam på Hematologi &amp; Koagulation.
      </p>
    </div>
  )
}
