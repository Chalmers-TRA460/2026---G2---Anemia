import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import '../../proxy.css'

const TZ = 'Europe/Stockholm'

function formatExpiry(expiresAt) {
  if (!expiresAt) return null
  const expires = new Date(expiresAt)
  const now = new Date()
  const fmt = opts => new Intl.DateTimeFormat('sv-SE', { timeZone: TZ, ...opts }).format

  const dateOf  = fmt({ year: 'numeric', month: '2-digit', day: '2-digit' })
  const timeStr = fmt({ hour: '2-digit', minute: '2-digit' })(expires)

  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)

  if (dateOf(expires) === dateOf(now))       return `idag kl ${timeStr}`
  if (dateOf(expires) === dateOf(tomorrow))  return `imorgon kl ${timeStr}`

  const dayLabel = fmt({ day: 'numeric', month: 'short' })(expires)
  return `${dayLabel} kl ${timeStr}`
}

export default function ProxyConfirmation() {
  const { token } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const { proxyName, patientFirstName, expiresAt } = location.state ?? {}

  useEffect(() => {
    if (!proxyName && !patientFirstName) {
      navigate(`/anhorig/${token}`, { replace: true })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const name  = patientFirstName || 'patienten'
  const proxy = proxyName || 'Du'
  const expiryLabel = formatExpiry(expiresAt)

  return (
    <div className="proxy-page">
      <header className="proxy-header">
        <div className="proxy-header-inner">
          <span className="proxy-logo-heart" aria-hidden="true">❤</span>
          <span className="proxy-logo-text">Daglig Koll</span>
        </div>
      </header>

      <main className="proxy-main">
        <div className="proxy-confirm-card">
          <div className="proxy-confirm-icon-wrap" aria-hidden="true">
            <span className="material-icons proxy-confirm-check">check_circle</span>
          </div>

          <h1 className="proxy-confirm-title">Tack, {proxy}!</h1>

          <p className="proxy-confirm-body">
            Loggningen är skickad till {name}s vårdteam.
          </p>

          {expiryLabel && (
            <p className="proxy-confirm-expiry">
              Länken är giltig till {expiryLabel}. Du kan komma tillbaka och
              ändra dina svar fram tills dess.
            </p>
          )}

          <button
            className="proxy-confirm-edit-btn"
            onClick={() => navigate(`/anhorig/${token}/logga`)}
          >
            Ändra mina svar
          </button>
        </div>
      </main>
    </div>
  )
}
