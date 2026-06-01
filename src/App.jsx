import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import PatientLayout from './components/PatientLayout'
import Login from './pages/Login'
import Home from './pages/patient/Home'
import LogSymptoms from './pages/patient/LogSymptoms'
import Confirmation from './pages/patient/Confirmation'
import MyData from './pages/patient/MyData'
import Account from './pages/patient/Account'
import ProxyLanding from './pages/proxy/ProxyLanding'
import ProxyLogForm from './pages/proxy/ProxyLogForm'
import ProxyConfirmation from './pages/proxy/ProxyConfirmation'
import ClinicianLayout from './components/clinician/ClinicianLayout'
import Dashboard from './pages/clinician/Dashboard'
import PatientView from './pages/clinician/PatientView'
import ClinicianAccount from './pages/clinician/Account'
import './App.css'

function RootRedirect() {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Laddar…</p>
      </div>
    )
  }

  if (!user) return <Navigate to="/logga-in" replace />
  if (profile?.role === 'clinician') return <Navigate to="/kliniker" replace />
  return <Navigate to="/patient" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/logga-in" element={<Login />} />
          <Route path="/" element={<RootRedirect />} />

          <Route
            path="/patient"
            element={
              <ProtectedRoute requiredRole="patient">
                <PatientLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Home />} />
            <Route path="logga" element={<LogSymptoms />} />
            <Route path="logga/klar" element={<Confirmation />} />
            <Route path="min-data" element={<MyData />} />
            <Route path="konto" element={<Account />} />
          </Route>

          {/* Public proxy routes — no auth required */}
          <Route path="/anhorig/:token" element={<ProxyLanding />} />
          <Route path="/anhorig/:token/logga" element={<ProxyLogForm />} />
          <Route path="/anhorig/:token/bekraftad" element={<ProxyConfirmation />} />

          <Route
            path="/kliniker"
            element={
              <ProtectedRoute requiredRole="clinician">
                <ClinicianLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="patient/:id" element={<PatientView />} />
            <Route path="konto" element={<ClinicianAccount />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
