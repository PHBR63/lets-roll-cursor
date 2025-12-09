// @ts-nocheck
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { Landing } from './pages/Landing'
import { Login } from './pages/Auth/Login'
import { Register } from './pages/Auth/Register'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { Toaster } from './components/ui/sonner'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { PageTransition } from './components/common/PageTransition'
import { PWAInstallPrompt } from './components/common/PWAInstallPrompt'
import { PageTracker } from './components/common/PageTracker'
import { Loader2 } from 'lucide-react'

// Função helper para lazy loading com retry
const lazyWithRetry = (componentImport: () => Promise<any>, retries = 3) => {
  return lazy(async () => {
    for (let i = 0; i < retries; i++) {
      try {
        const module = await componentImport()
        return module
      } catch (error) {
        if (i === retries - 1) {
          // Última tentativa falhou, recarregar a página
          console.error('Erro ao carregar módulo após', retries, 'tentativas:', error)
          window.location.reload()
          throw error
        }
        // Aguardar antes de tentar novamente (backoff exponencial)
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)))
      }
    }
    throw new Error('Falha ao carregar módulo após múltiplas tentativas')
  })
}

// Lazy loading de componentes pesados com retry
const Dashboard = lazyWithRetry(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })))
const CreateCampaign = lazyWithRetry(() => import('./pages/Campaign/CreateCampaign').then(m => ({ default: m.CreateCampaign })))
const CampaignDetail = lazyWithRetry(() => import('./pages/Campaign/CampaignDetail').then(m => ({ default: m.CampaignDetail })))
const SessionRoom = lazyWithRetry(() => import('./pages/GameSession/SessionRoom').then(m => ({ default: m.SessionRoom })))
const CharacterSheet = lazyWithRetry(() => import('./pages/Character/CharacterSheet').then(m => ({ default: m.CharacterSheet })))
const CreateCharacter = lazyWithRetry(() => import('./pages/Character/CreateCharacter').then(m => ({ default: m.CreateCharacter })))
const CharactersList = lazyWithRetry(() => import('./pages/Character/CharactersList').then(m => ({ default: m.CharactersList })))
const MasterDashboard = lazyWithRetry(() => import('./pages/Master/Dashboard').then(m => ({ default: m.MasterDashboard })))
const RitualsGuide = lazyWithRetry(() => import('./pages/Rituals/RitualsGuide').then(m => ({ default: m.RitualsGuide })))
const SettingsPage = lazyWithRetry(() => import('./pages/Settings/SettingsPage').then(m => ({ default: m.SettingsPage })))

/**
 * Componente de loading para lazy loading
 */
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
        <p className="text-text-secondary">Carregando...</p>
      </div>
    </div>
  )
}

/**
 * Componente principal da aplicação
 * Define as rotas da aplicação e envolve com AuthProvider
 */
function App() {
  return (
    <ErrorBoundary>
        <ThemeProvider>
          <AuthProvider>
          <div className="min-h-screen relative z-0">
          <div className="pattern-icosahedrons" />
          <BrowserRouter>
            <PageTracker />
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary>
                        <PageTransition>
                          <Dashboard />
                        </PageTransition>
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/campaign/create"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary>
                        <CreateCampaign />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/campaign/:id"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary>
                        <CampaignDetail />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/session/:id"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary>
                        <SessionRoom />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/character/:id"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary>
                        <CharacterSheet />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/campaign/:campaignId/character/create"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary>
                        <CreateCharacter />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/character/create"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary>
                        <CreateCharacter />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/characters"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary>
                        <PageTransition>
                          <CharactersList />
                        </PageTransition>
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/master/:campaignId"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary>
                        <MasterDashboard />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/rituals"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary>
                        <PageTransition>
                          <RitualsGuide />
                        </PageTransition>
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary>
                        <PageTransition>
                          <SettingsPage />
                        </PageTransition>
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Suspense>
          </BrowserRouter>
          <Toaster />
          <PWAInstallPrompt />
          <Analytics />
        </div>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
