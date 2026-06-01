import { useState } from 'react'
import ShareButtons from './ShareButtons'

const TZ = 'Europe/Stockholm'

function formatExpiry(expiresAt) {
  const expires = new Date(expiresAt)
  const now = new Date()

  const fmt = opts => new Intl.DateTimeFormat('sv-SE', { timeZone: TZ, ...opts }).format

  const dateStr  = fmt({ year: 'numeric', month: '2-digit', day: '2-digit' })(expires)
  const todayStr = fmt({ year: 'numeric', month: '2-digit', day: '2-digit' })(now)
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = fmt({ year: 'numeric', month: '2-digit', day: '2-digit' })(tomorrow)
  const timeStr = fmt({ hour: '2-digit', minute: '2-digit' })(expires)

  if (dateStr === todayStr)     return `idag kl ${timeStr}`
  if (dateStr === tomorrowStr)  return `imorgon kl ${timeStr}`

  const dayLabel = fmt({ day: 'numeric', month: 'short' })(expires)
  return `${dayLabel} kl ${timeStr}`
}

export default function ActiveLinkCard({ token, expiresAt, firstName, onRevoke, revoking }) {
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false)

  const url = `${window.location.origin}/anhorig/${token}`

  return (
    <div className="proxy-active-card">
      <p className="proxy-active-tag">● Aktiv länk</p>
      <h3 className="proxy-active-title">Anhörig-länk klar att skickas</h3>
      <p className="proxy-active-expires">Giltig till {formatExpiry(expiresAt)}</p>

      <p className="proxy-share-heading">Skicka länken till din anhörig:</p>
      <ShareButtons url={url} firstName={firstName} />

      <p className="proxy-active-note">
        Länken kan användas en gång och förfaller automatiskt.
      </p>

      <button
        type="button"
        className="proxy-revoke-btn"
        onClick={() => setShowRevokeConfirm(true)}
        disabled={revoking}
      >
        Återkalla denna länk
      </button>

      {showRevokeConfirm && (
        <div className="blocker-overlay" role="dialog" aria-modal="true">
          <div className="blocker-sheet">
            <h3 className="blocker-title">Återkalla anhörig-länken?</h3>
            <p className="blocker-body">
              Länken slutar fungera omedelbart. Du kan skapa en ny länk när du vill.
            </p>
            <div className="blocker-btn-group">
              <button
                className="btn-patient-primary"
                onClick={() => { setShowRevokeConfirm(false); onRevoke() }}
                disabled={revoking}
                style={{ background: '#c0392b' }}
              >
                {revoking ? 'Återkallar…' : 'Ja, återkalla'}
              </button>
              <button
                className="blocker-stay-btn"
                onClick={() => setShowRevokeConfirm(false)}
                disabled={revoking}
              >
                Avbryt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
