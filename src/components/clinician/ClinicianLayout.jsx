import { useEffect, useRef, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import '../../clinician.css'

export default function ClinicianLayout() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!menuOpen) return
    function handler(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  async function handleSignOut() {
    setMenuOpen(false)
    await signOut()
    navigate('/logga-in', { replace: true })
  }

  return (
    <div className="cl-app">
      <header className="cl-header">
        <div className="cl-header-inner">
          <div className="cl-logo" role="img" aria-label="Daglig Koll Kliniker">
            <span className="cl-logo-heart" aria-hidden="true">❤</span>
            <span className="cl-logo-name">Daglig Koll</span>
            <span className="cl-logo-sep" aria-hidden="true">•</span>
            <span className="cl-logo-role">Kliniker</span>
          </div>

          <div className="cl-user-menu" ref={menuRef}>
            <button
              className="cl-user-btn"
              onClick={() => setMenuOpen(v => !v)}
              aria-expanded={menuOpen}
              aria-haspopup="true"
              aria-label="Användarmeny"
            >
              <span className="material-icons cl-user-icon" aria-hidden="true">account_circle</span>
              <span className="cl-user-name">{profile?.full_name ?? 'Kliniker'}</span>
              <span className="material-icons cl-chevron" aria-hidden="true">
                {menuOpen ? 'expand_less' : 'expand_more'}
              </span>
            </button>

            {menuOpen && (
              <div className="cl-dropdown" role="menu">
                <button
                  className="cl-dropdown-item"
                  role="menuitem"
                  onClick={() => { setMenuOpen(false); navigate('/kliniker/konto') }}
                >
                  <span className="material-icons" aria-hidden="true">manage_accounts</span>
                  Konto
                </button>
                <button
                  className="cl-dropdown-item cl-dropdown-item--danger"
                  role="menuitem"
                  onClick={handleSignOut}
                >
                  <span className="material-icons" aria-hidden="true">logout</span>
                  Logga ut
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="cl-main">
        <Outlet />
      </main>
    </div>
  )
}
