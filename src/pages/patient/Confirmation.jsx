import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

function getFirstName(fullName) {
  return fullName?.trim().split(/\s+/)[0] ?? ''
}

const REDIRECT_SECONDS = 20

export default function Confirmation() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [countdown, setCountdown] = useState(REDIRECT_SECONDS)

  const firstName = getFirstName(profile?.full_name)

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          navigate('/patient', { replace: true })
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [navigate])

  return (
    <div className="confirmation-page">
      <div className="confirmation-content">
        <div className="confirmation-icon-wrap">
          <span className="material-icons confirmation-check" aria-hidden="true">
            check_circle
          </span>
        </div>

        <span className="page-tag">Skickat</span>

        <h1 className="confirmation-title">Tack, {firstName}.</h1>

        <p className="confirmation-text">
          Din loggning har registrerats och skickats till ditt vårdteam.
        </p>

        <button
          className="btn-patient-primary"
          onClick={() => navigate('/patient', { replace: true })}
        >
          Tillbaka till hem
        </button>

        <p className="confirmation-countdown">
          Tar dig till hemskärmen om {countdown} sekunder…
        </p>
      </div>
    </div>
  )
}
