import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { studyContact } from '../../config/studyContact'
import ProxyLinkSection from '../../components/patient/proxy/ProxyLinkSection'

function getFirstName(fullName) {
  return fullName?.trim().split(/\s+/)[0] ?? ''
}

export default function Account() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  const firstName = getFirstName(profile?.full_name)

  async function handleSignOut() {
    setSigningOut(true)
    await signOut()
    navigate('/logga-in', { replace: true })
  }

  return (
    <div className="page-content">
      <span className="page-tag">Konto</span>
      <h1 className="page-title">Mitt konto</h1>

      {/* ── Kontouppgifter ── */}
      <section className="account-section card">
        <h2 className="account-section-title">Mina uppgifter</h2>

        <div className="account-field">
          <span className="account-field-label">Namn</span>
          <span className="account-field-value">{profile?.full_name ?? '–'}</span>
        </div>
        <div className="account-field">
          <span className="account-field-label">E-post</span>
          <span className="account-field-value">{profile?.email ?? '–'}</span>
        </div>

        <p className="account-note">
          Kontakta din sjuksköterska för att ändra dessa uppgifter.
        </p>
      </section>

      {/* ── Anhörig-länk ── */}
      <section className="account-section card">
        <h2 className="account-section-title">Anhörig-länk</h2>
        {profile?.id && (
          <ProxyLinkSection patientId={profile.id} firstName={firstName} />
        )}
      </section>

      {/* ── Hjälp & kontakt ── */}
      <section className="account-section card">
        <h2 className="account-section-title">Hjälp & kontakt</h2>

        <div className="account-contact-row">
          <span className="material-icons-outlined account-contact-icon">mail</span>
          <div>
            <p className="account-contact-label">{studyContact.technical.description}</p>
            <p className="account-contact-name">{studyContact.technical.name}</p>
            <a href={`mailto:${studyContact.technical.email}`} className="account-contact-value">
              {studyContact.technical.email}
            </a>
          </div>
        </div>

        <div className="account-contact-row">
          <span className="material-icons-outlined account-contact-icon">local_hospital</span>
          <div>
            <p className="account-contact-label">{studyContact.clinical.description}</p>
            <p className="account-contact-name">{studyContact.clinical.name}</p>
            <a href={`mailto:${studyContact.clinical.email}`} className="account-contact-value">
              {studyContact.clinical.email}
            </a>
          </div>
        </div>
      </section>

      {/* ── Om appen ── */}
      <section className="account-section card">
        <h2 className="account-section-title">Om appen</h2>
        <p className="account-version">Version {studyContact.appInfo.version}</p>
        <p className="account-about">
          Daglig Koll är en del av en medicinsk studie vid{' '}
          {studyContact.appInfo.institution}.
        </p>
      </section>

      {/* ── Logga ut ── */}
      <div className="account-signout-wrap">
        <button
          className="btn-signout"
          onClick={() => setShowSignOutConfirm(true)}
        >
          Logga ut
        </button>
      </div>

      {/* ── Utloggnings-dialog ── */}
      {showSignOutConfirm && (
        <div className="blocker-overlay" role="dialog" aria-modal="true">
          <div className="blocker-sheet">
            <h3 className="blocker-title">Logga ut?</h3>
            <p className="blocker-body">
              Vill du logga ut från Daglig Koll?
            </p>
            <div className="blocker-btn-group">
              <button
                className="btn-patient-primary"
                onClick={handleSignOut}
                disabled={signingOut}
                style={{ background: '#c0392b' }}
              >
                {signingOut ? 'Loggar ut…' : 'Ja, logga ut'}
              </button>
              <button
                className="blocker-stay-btn"
                onClick={() => setShowSignOutConfirm(false)}
                disabled={signingOut}
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
