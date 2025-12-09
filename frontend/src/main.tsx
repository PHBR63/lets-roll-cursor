import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/globals.css'
import { initAnalytics } from './utils/analytics'
import { validateEnvOrThrow } from './utils/envValidation'

// Validar variáveis de ambiente antes de inicializar a aplicação
let envValid = true
try {
  validateEnvOrThrow()
} catch (error) {
  envValid = false
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

// Não continuar se houver erro de configuração
if (!envValid) {
  // Já mostramos o erro, não fazer mais nada
} else {

  // Inicializar analytics (com tratamento de erro)
  try {
    initAnalytics()
  } catch (error) {
    console.warn('Erro ao inicializar analytics:', error)
    // Não bloquear a aplicação se analytics falhar
  }

  // Registrar Service Worker para PWA (com tratamento de erro)
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registrado:', registration.scope)
        })
        .catch((error) => {
          console.warn('Erro ao registrar Service Worker:', error)
          // Não bloquear a aplicação se service worker falhar
        })
    })
  }

  // Renderizar aplicação com tratamento de erro robusto
  try {
    const rootElement = document.getElementById('root')
    if (!rootElement) {
      throw new Error('Elemento root não encontrado')
    }
    
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    )
  } catch (error) {
    console.error('❌ Erro ao renderizar aplicação:', error)
    // Mostrar mensagem de erro amigável
    document.body.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #1A0033; color: white; font-family: system-ui; padding: 20px;">
        <div style="text-align: center; max-width: 600px;">
          <h1 style="color: #8000FF; margin-bottom: 20px;">Erro ao Carregar</h1>
          <p style="margin-bottom: 10px;">Ocorreu um erro ao carregar a aplicação.</p>
          <p style="color: #A0A0A0; font-size: 14px; margin-bottom: 20px;">Por favor, recarregue a página.</p>
          <button onclick="window.location.reload()" style="padding: 10px 20px; background: #8000FF; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Recarregar Página
          </button>
        </div>
      </div>
    `
  }
}

