import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PatientRow from './PatientRow'
import { avgScore } from '../../lib/flags'

export default function PatientList({ patients, logMap, excludeIds = new Set() }) {
  const navigate = useNavigate()
  const [sort, setSort] = useState('score') // 'score' | 'appointment'

  const visible = patients.filter(p => !excludeIds.has(p.id))

  const sorted = [...visible].sort((a, b) => {
    if (sort === 'score') {
      const aAvg = avgScore(logMap.get(a.id)?.[0])
      const bAvg = avgScore(logMap.get(b.id)?.[0])
      if (aAvg === null && bAvg === null) return a.full_name.localeCompare(b.full_name)
      if (aAvg === null) return 1
      if (bAvg === null) return -1
      return aAvg - bAvg // ascending — lowest (sickest) first
    }
    // appointment
    const aDate = a.next_appointment ? new Date(a.next_appointment) : null
    const bDate = b.next_appointment ? new Date(b.next_appointment) : null
    if (!aDate && !bDate) return a.full_name.localeCompare(b.full_name)
    if (!aDate) return 1
    if (!bDate) return -1
    return aDate - bDate
  })

  return (
    <div className="clinician-card">
      <div className="patient-list-topbar">
        <h2 className="clinician-section-title" style={{ margin: 0 }}>
          Alla patienter
          <span className="patient-list-count">{visible.length}</span>
        </h2>

        <div className="patient-sort-group" role="group" aria-label="Sorteringsval">
          <span className="patient-sort-label">Sortera:</span>
          <button
            className={`sort-btn${sort === 'score' ? ' sort-btn--active' : ''}`}
            onClick={() => setSort('score')}
          >
            Symtompoäng (lägst)
          </button>
          <button
            className={`sort-btn${sort === 'appointment' ? ' sort-btn--active' : ''}`}
            onClick={() => setSort('appointment')}
          >
            Nästa besök
          </button>
        </div>
      </div>

      {sorted.length === 0 ? (
        <p className="clinician-empty">Inga patienter hittades.</p>
      ) : (
        <div className="patient-table">
          <div className="patient-table-head" aria-hidden="true">
            <span className="ptcol-name">Patient</span>
            <span className="ptcol-score">Senaste snitt</span>
            <span className="ptcol-log">Senaste loggning</span>
            <span className="ptcol-appt">Nästa besök</span>
            <span className="ptcol-arrow" />
          </div>

          {sorted.map(p => (
            <PatientRow
              key={p.id}
              patient={p}
              logs={logMap.get(p.id) ?? []}
              onClick={() => navigate(`/kliniker/patient/${p.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
