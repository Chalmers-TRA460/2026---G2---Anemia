import PatientListSection from './PatientListSection'
import PatientRow from './PatientRow'

// patients: enriched patient objects filtered to upcoming appointments
export default function TodayWidget({ patients }) {
  if (!patients.length) return null

  const sorted = [...patients].sort(
    (a, b) => new Date(a.next_appointment) - new Date(b.next_appointment)
  )

  return (
    <PatientListSection
      title="Patienter idag / imorgon"
      icon="event"
      badge={patients.length}
      variant="today"
    >
      {sorted.map(p => (
        <PatientRow
          key={p.id}
          patient={p}
          subLabel={p.loggedRecently ? undefined : 'Ej loggat senaste 3 dagarna'}
        />
      ))}
    </PatientListSection>
  )
}
