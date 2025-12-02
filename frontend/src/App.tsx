import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { Landing } from './pages/Landing'
import { Login } from './pages/Auth/Login'
import { Register } from './pages/Auth/Register'
import { Dashboard } from './pages/Dashboard'
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
          </Routes>
        </BrowserRouter>
      </div>
    </AuthProvider>
  )
}

export default App
