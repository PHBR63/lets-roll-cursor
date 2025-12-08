import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/globals.css'
import { initAnalytics } from './utils/analytics'
import { validateEnvOrThrow } from './utils/envValidation'

// Validar variáveis de ambiente antes de inicializar a aplicação
try {
  validateEnvOrThrow()
} catch (error) {
  console.error('❌ Erro de configuração de ambiente:', error)
  // Em produção, mostrar erro amigável ao usuário
  if (import.meta.env.PROD) {
    document.body.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #1A0033; color: white; font-family: system-ui; padding: 20px;">
        <div style="text-align: center; max-width: 600px;">
          <h1 style="color: #8000FF; margin-bottom: 20px;">Erro de Configuração</h1>
          <p style="margin-bottom: 10px;">A aplicação não está configurada corretamente.</p>
          <p style="color: #A0A0A0; font-size: 14px;">Por favor, verifique as variáveis de ambiente necessárias.</p>
        </div>
      </div>
    `
  } else {
    // Em desenvolvimento, lançar erro para debugging
    throw error
  }
}

// Inicializar analytics
initAnalytics()

// Registrar Service Worker para PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('Service Worker registrado:', registration.scope)
      })
      .catch((error) => {
        console.warn('Erro ao registrar Service Worker:', error)
      })
  })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

