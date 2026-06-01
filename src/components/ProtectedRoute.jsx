import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, profile, loading, profileError, signOut } = useAuth()

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Laddar…</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/logga-in" replace />
  }

  if (profileError || !profile) {
    return (
      <div className="error-screen">
        <h2>Något gick fel</h2>
        <p>{profileError ?? 'Profil saknas.'}</p>
        <button className="btn-primary" onClick={signOut}>
          Logga ut
        </button>
      </div>
    )
  }

  if (requiredRole && profile.role !== requiredRole) {
    const correctPath = profile.role === 'clinician' ? '/kliniker' : '/patient'
    return <Navigate to={correctPath} replace />
  }

  return children
}