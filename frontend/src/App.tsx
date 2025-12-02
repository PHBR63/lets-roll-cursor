import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { Landing } from './pages/Landing'
import { Login } from './pages/Auth/Login'
import { Register } from './pages/Auth/Register'
import { Dashboard } from './pages/Dashboard'
import { CreateCampaign } from './pages/Campaign/CreateCampaign'
import { CampaignDetail } from './pages/Campaign/CampaignDetail'
import { SessionRoom } from './pages/GameSession/SessionRoom'
import { ProtectedRoute } from './components/auth/ProtectedRoute'

/**
 * Componente principal da aplicação
 * Define as rotas da aplicação e envolve com AuthProvider
 */
function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen">
        <div className="pattern-icosahedrons" />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/campaign/create"
              element={
                <ProtectedRoute>
                  <CreateCampaign />
                </ProtectedRoute>
              }
            />
            <Route
              path="/campaign/:id"
              element={
                <ProtectedRoute>
                  <CampaignDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/session/:id"
              element={
                <ProtectedRoute>
                  <SessionRoom />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </div>
    </AuthProvider>
  )
}

export default App
