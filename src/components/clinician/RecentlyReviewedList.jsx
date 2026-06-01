import PatientListSection from './PatientListSection'
import PatientRow from './PatientRow'

function fmtReviewTime(iso) {
  const ms = Date.now() - new Date(iso).getTime()
  const h  = Math.floor(ms / 3600000)
  const d  = Math.floor(ms / 86400000)
  if (d >= 1) return `Granskad ${d} dag${d > 1 ? 'ar' : ''} sedan`
  if (h >= 1) return `Granskad ${h} timm${h > 1 ? 'ar' : 'e'} sedan`
  return 'Granskad nyss'
}

export default function RecentlyReviewedList({ patients }) {
  if (!patients.length) return null

  const sorted = [...patients].sort(
    (a, b) => new Date(b.reviewedAt) - new Date(a.reviewedAt)
  )

  return (
    <PatientListSection
      title="Nyligen granskade"
      icon="verified"
      badge={patients.length}
      variant="reviewed"
      extra={<span className="cl-ls-note">Återgår till listan efter 2 dagar</span>}
    >
      {sorted.map(p => (
        <PatientRow
          key={p.id}
          patient={p}
          subLabel={fmtReviewTime(p.reviewedAt)}
        />
      ))}
    </PatientListSection>
  )
}
