import { useState } from 'react'
import { avgLogScore } from '../../lib/flagSorting'
import PatientListSection from './PatientListSection'
import PatientRow from './PatientRow'

function sortPatients(patients, sortBy) {
  const arr = [...patients]
  if (sortBy === 'appointment') {
    return arr.sort((a, b) => {
      if (!a.next_appointment && !b.next_appointment) return 0
      if (!a.next_appointment) return 1
      if (!b.next_appointment) return -1
      return new Date(a.next_appointment) - new Date(b.next_appointment)
    })
  }
  return arr.sort((a, b) => {
    const sA = avgLogScore(a.latestLog)
    const sB = avgLogScore(b.latestLog)
    if (sA === null && sB === null) return 0
    if (sA === null) return 1
    if (sB === null) return -1
    return sA - sB
  })
}

export default function RankingList({ patients }) {
  const [sortBy, setSortBy] = useState('score')
  const sorted = sortPatients(patients, sortBy)

  const sortControl = (
    <select
      className="cl-sort-select"
      value={sortBy}
      onChange={e => setSortBy(e.target.value)}
      aria-label="Sorteringsordning"
    >
      <option value="score">Efter senaste mående</option>
      <option value="appointment">Efter nästa besök</option>
    </select>
  )

  return (
    <PatientListSection
      title="Alla patienter"
      badge={patients.length}
      variant="default"
      extra={sortControl}
      empty="Inga patienter utan aktiva flaggor."
    >
      {sorted.length > 0 ? sorted.map(p => <PatientRow key={p.id} patient={p} />) : null}
    </PatientListSection>
  )
}
