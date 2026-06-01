import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { studyContact } from '../config/studyContact'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) {
      setError('Fel e-post eller lösenord. Försök igen.')
    } else {
      navigate('/')
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="logo-icon">❤</div>
          <h1 className="app-title">Daglig Koll</h1>
          <p className="app-subtitle">Hematologi & Koagulation</p>
          <p className="app-subtitle">Chalmers medicinska studie</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">E-postadress</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="din@epost.se"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Lösenord</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Ditt lösenord"
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Loggar in…' : 'Logga in'}
          </button>
        </form>

        <p className="login-help">
          Problem med inloggning? Kontakta {studyContact.technical.name} på{' '}
          <a href={`mailto:${studyContact.technical.email}`}>
            {studyContact.technical.email}
          </a>
        </p>
      </div>
    </div>
  )
}
