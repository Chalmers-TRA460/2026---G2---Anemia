const TZ = 'Europe/Stockholm'

function formatDate(isoString) {
  if (!isoString) return ''
  const date = new Date(isoString)
  const now = new Date()
  const yearStr = new Intl.DateTimeFormat('sv-SE', { timeZone: TZ, year: 'numeric' }).format
  const sameYear = yearStr(date) === yearStr(now)
  const opts = sameYear
    ? { day: 'numeric', month: 'short', timeZone: TZ }
    : { day: 'numeric', month: 'short', year: 'numeric', timeZone: TZ }
  return new Intl.DateTimeFormat('sv-SE', opts).format(date)
}

function classify(t) {
  if (t.revoked) return 'revoked'
  if (t.used)    return 'used'
  if (new Date(t.expires_at) <= new Date()) return 'expired'
  return 'active'
}

function HistoryRow({ token }) {
  const status = classify(token)
  if (status === 'active') return null

  let icon, label, date

  if (status === 'used') {
    icon = 'check_circle'
    label = 'Använd'
    date = formatDate(token.used_at || token.created_at)
  } else if (status === 'revoked') {
    icon = 'undo'
    label = 'Återkallad'
    date = formatDate(token.created_at)
  } else {
    icon = 'schedule'
    label = 'Utgången'
    date = formatDate(token.expires_at)
  }

  return (
    <li className={`proxy-history-row proxy-history-row--${status}`}>
      <span className="material-icons proxy-history-icon" aria-hidden="true">
        {icon}
      </span>
      <span className="proxy-history-label">{label}</span>
      <span className="proxy-history-date">{date}</span>
    </li>
  )
}

export default function ProxyHistoryList({ tokens }) {
  const past = tokens
    .filter(t => classify(t) !== 'active')
    .slice(0, 10)

  if (past.length === 0) return null

  return (
    <div className="proxy-history">
      <p className="proxy-history-heading">Tidigare länkar</p>
      <ul className="proxy-history-list">
        {past.map(t => (
          <HistoryRow key={t.id} token={t} />
        ))}
      </ul>
    </div>
  )
}
