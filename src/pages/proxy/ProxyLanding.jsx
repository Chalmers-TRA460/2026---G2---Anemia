import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import ProxyError from './ProxyError'
import '../../proxy.css'

export default function ProxyLanding() {
  const { token } = useParams()
  const navigate = useNavigate()

  const [status, setStatus] = useState('loading') // 'loading' | 'valid' | 'invalid'
  const [patientFirstName, setPatientFirstName] = useState('')
  const [errorReason, setErrorReason] = useState(null)

  useEffect(() => {
    async function validate() {
      try {
        const { data, error } = await supabase.functions.invoke(
          'proxy-validate-token',
          { body: { token } }
        )

        if (error || !data) {
          setErrorReason('server_error')
          setStatus('invalid')
          return
        }

        if (data.valid) {
          setPatientFirstName(data.patientFirstName ?? '')
          setStatus('valid')
        } else {
          setErrorReason(data.reason ?? 'not_found')
          setStatus('invalid')
        }
      } catch {
        setErrorReason('server_error')
        setStatus('invalid')
      }
    }

    validate()
  }, [token])

  function handleStart() {
    navigate(`/anhorig/${token}/logga`, {
      state: { token, patientFirstName },
    })
  }

  return (
    <div className="proxy-page">
      <header className="proxy-header">
        <div className="proxy-header-inner">
          <span className="proxy-logo-heart" aria-hidden="true">❤</span>
          <span className="proxy-logo-text">Daglig Koll</span>
        </div>
      </header>

      <main className="proxy-main">
        {status === 'loading' && (
          <div className="proxy-loading-state">
            <div className="proxy-spinner" />
            <p className="proxy-loading-text">Kontrollerar länken…</p>
          </div>
        )}

        {status === 'invalid' && (
          <ProxyError reason={errorReason} />
        )}

        {status === 'valid' && (
          <div className="proxy-welcome-card">
            <div className="proxy-welcome-icon-wrap" aria-hidden="true">
              <span className="material-icons proxy-welcome-heart">favorite</span>
            </div>

            <h1 className="proxy-welcome-title">
              Du loggar nu åt {patientFirstName}
            </h1>
            <p className="proxy-welcome-body">
              {patientFirstName} har bett dig hjälpa till att registrera
              symtom idag. Det tar bara några minuter.
            </p>

            <div className="proxy-how-section">
              <p className="proxy-how-heading">Så här fungerar det:</p>
              <ol className="proxy-steps" aria-label="Steg för att logga symtom">
                <li className="proxy-step">
                  <span className="material-icons-outlined proxy-step-icon" aria-hidden="true">
                    speed
                  </span>
                  <span>Bedöm hur {patientFirstName} mår i fem områden</span>
                </li>
                <li className="proxy-step">
                  <span className="material-icons-outlined proxy-step-icon" aria-hidden="true">
                    checklist
                  </span>
                  <span>Välj eventuella symtom hen har idag</span>
                </li>
                <li className="proxy-step">
                  <span className="material-icons-outlined proxy-step-icon" aria-hidden="true">
                    check_circle
                  </span>
                  <span>Skicka in — färdigt!</span>
                </li>
              </ol>
            </div>

            <button className="proxy-start-btn" onClick={handleStart}>
              Börja loggning →
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
