import { useRef, useCallback } from 'react'
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { NavigationGuardContext } from '../contexts/NavigationGuardContext'
import '../patient.css'

export default function PatientLayout() {
  const location = useLocation()
  const navigate = useNavigate()

  const isAccountPage = location.pathname === '/patient/konto'
  const isLogPage = location.pathname.startsWith('/patient/logga')
  const showBottomNav = !isAccountPage && !isLogPage
  const showBackButton = isAccountPage || isLogPage

  // Child pages (e.g. LogSymptoms in edit mode) can register a guard that
  // intercepts the back-button click and returns true to block navigation.
  const guardRef = useRef(null)
  const registerGuard = useCallback(fn => { guardRef.current = fn }, [])
  const clearGuard = useCallback(() => { guardRef.current = null }, [])

  function handleBack() {
    // Let the registered guard decide whether to block
    if (guardRef.current && guardRef.current()) return

    if (isLogPage) {
      navigate('/patient', { replace: true })
    } else {
      navigate(-1)
    }
  }

  return (
    <NavigationGuardContext.Provider value={{ registerGuard, clearGuard }}>
      <div className="patient-layout">
        <header className="patient-header">
          <div className="patient-header-inner">
            {showBackButton ? (
              <button
                className="header-icon-btn"
                onClick={handleBack}
                aria-label="Tillbaka"
              >
                <span className="material-icons-outlined">arrow_back</span>
              </button>
            ) : (
              <span className="patient-app-name">Daglig Koll</span>
            )}

            {!showBackButton && (
              <button
                className="header-icon-btn"
                onClick={() => navigate('/patient/konto')}
                aria-label="Mitt konto"
              >
                <span className="material-icons-outlined">person</span>
              </button>
            )}
          </div>
        </header>

        <main className={`patient-main${showBottomNav ? ' with-bottom-nav' : ''}`}>
          <Outlet />
        </main>

        {showBottomNav && (
          <nav className="patient-bottom-nav" aria-label="Navigering">
            <div className="patient-bottom-nav-inner">
              <NavLink
                to="/patient"
                end
                className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}
              >
                {({ isActive }) => (
                  <>
                    <span className={isActive ? 'material-icons' : 'material-icons-outlined'}>
                      home
                    </span>
                    <span>Hem</span>
                  </>
                )}
              </NavLink>

              <NavLink
                to="/patient/min-data"
                className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}
              >
                {({ isActive }) => (
                  <>
                    <span className={isActive ? 'material-icons' : 'material-icons-outlined'}>
                      bar_chart
                    </span>
                    <span>Min data</span>
                  </>
                )}
              </NavLink>
            </div>
          </nav>
        )}
      </div>
    </NavigationGuardContext.Provider>
  )
}
