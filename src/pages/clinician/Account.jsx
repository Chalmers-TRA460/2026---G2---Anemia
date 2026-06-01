import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function Account() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/logga-in', { replace: true })
  }

  return (
    <div>
      <button className="cl-back-btn" onClick={() => navigate('/kliniker')}>
        <span className="material-icons" aria-hidden="true">arrow_back</span>
        Tillbaka till dashboard
      </button>

      <h1 className="cl-page-title">Konto</h1>
      <p className="cl-page-sub">Dina uppgifter som kliniker</p>

      <div className="cl-card" style={{ maxWidth: 480 }}>
        <div className="cl-field">
          <span className="cl-field-label">Namn</span>
          <p className="cl-field-value">{profile?.full_name ?? '—'}</p>
        </div>
        <div className="cl-field">
          <span className="cl-field-label">E-post</span>
          <p className="cl-field-value">{profile?.email ?? '—'}</p>
        </div>
        <div className="cl-field">
          <span className="cl-field-label">Roll</span>
          <p className="cl-field-value">Kliniker</p>
        </div>
      </div>

      <button className="cl-btn-danger" onClick={handleSignOut}>
        <span className="material-icons" aria-hidden="true">logout</span>
        Logga ut
      </button>
    </div>
  )
}
