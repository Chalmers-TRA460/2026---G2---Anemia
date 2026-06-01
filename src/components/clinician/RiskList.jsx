import { sortPatientsByRisk } from '../../lib/flagSorting'
import PatientListSection from './PatientListSection'
import PatientRow from './PatientRow'

export default function RiskList({ patients }) {
  if (!patients.length) return null
  const sorted = sortPatientsByRisk(patients)

  return (
    <PatientListSection
      title="Aktiv risklista"
      icon="warning"
      badge={patients.length}
      variant="risk"
    >
      {sorted.map(p => <PatientRow key={p.id} patient={p} />)}
    </PatientListSection>
  )
}
