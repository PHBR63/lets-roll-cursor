import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/globals.css'
import { initAnalytics } from './utils/analytics'
import { validateEnvOrThrow } from './utils/envValidation'
// Importar checkSupabase para disponibilizar no window (apenas em desenvolvimento)
if (import.meta.env.DEV) {
  import('./utils/checkSupabase').catch(() => {
    // Ignorar erro se não conseguir importar
  })
}

/**
 * Função para mostrar erro visual na tela
 */
function showError(message: string, details?: string) {
  const rootElement = document.getElementById('root')
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #1A0033; color: white; font-family: system-ui; padding: 20px;">
        <div style="text-align: center; max-width: 600px;">
          <h1 style="color: #8000FF; margin-bottom: 20px;">Erro ao Carregar</h1>
          <p style="margin-bottom: 10px; font-size: 18px;">${message}</p>
          ${details ? `<pre style="text-align: left; background: rgba(0,0,0,0.3); padding: 15px; border-radius: 5px; overflow-x: auto; font-size: 12px; margin: 20px 0;">${details}</pre>` : ''}
          <button onclick="window.location.reload()" style="padding: 10px 20px; background: #8000FF; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; margin-top: 20px;">
            Recarregar Página
          </button>
        </div>
      </div>
    `
  }
}

/**
 * Função para verificar se o React renderizou corretamente
 */
function checkReactRendered() {
  const rootElement = document.getElementById('root')
  if (!rootElement) {
    return false
  }
  
  // Verificar se há conteúdo React renderizado (não apenas HTML estático)
  const hasReactContent = rootElement.children.length > 0 && 
    (rootElement.querySelector('[data-reactroot]') || 
     rootElement.querySelector('*')?.getAttribute('data-react') ||
     rootElement.innerHTML.trim() !== '')
  
  return hasReactContent
}

// Log de início
console.log('[App] Iniciando aplicação...')

// Validar variáveis de ambiente
let envValid = true
try {
  validateEnvOrThrow()
  console.log('[App] Variáveis de ambiente validadas com sucesso')
} catch (error) {
  envValid = false
  const errorMessage = error instanceof Error ? error.message : String(error)
  console.error('[App] ❌ Erro de configuração de ambiente:', errorMessage)
  
  // Sempre mostrar erro, mesmo em produção
  showError(
    'A aplicação não está configurada corretamente.',
    `Erro: ${errorMessage}\n\nPor favor, verifique as variáveis de ambiente necessárias.`
  )
}

// Continuar apenas se ambiente estiver válido
if (envValid) {
  // Inicializar analytics (não bloquear se falhar)
  try {
    initAnalytics()
    console.log('[App] Analytics inicializado')
  } catch (error) {
    console.warn('[App] Erro ao inicializar analytics (não crítico):', error)
  }

  // Registrar Service Worker para PWA (não bloquear se falhar)
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[App] Service Worker registrado:', registration.scope)
        })
        .catch((error) => {
          console.warn('[App] Erro ao registrar Service Worker (não crítico):', error)
        })
    })
  }

  // Renderizar aplicação
  try {
    const rootElement = document.getElementById('root')
    if (!rootElement) {
      throw new Error('Elemento #root não encontrado no DOM')
    }
    
    console.log('[App] Renderizando React...')
    
    const root = ReactDOM.createRoot(rootElement)
    
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    )
    
    console.log('[App] React renderizado com sucesso')
    
    // Verificar se o React renderizou após um pequeno delay
    setTimeout(() => {
      if (!checkReactRendered()) {
        console.error('[App] ⚠️ React pode não ter renderizado corretamente')
        console.error('[App] Root element:', rootElement)
        console.error('[App] Root innerHTML:', rootElement.innerHTML.substring(0, 200))
        
        // Tentar renderizar novamente com um componente simples primeiro
        try {
          root.render(
            <div style={{ padding: '20px', color: 'white', textAlign: 'center' }}>
              <h1>Carregando aplicação...</h1>
            </div>
          )
          
          // Depois de 1 segundo, tentar renderizar o App completo
          setTimeout(() => {
            try {
              root.render(
                <React.StrictMode>
                  <App />
                </React.StrictMode>
              )
            } catch (retryError) {
              console.error('[App] Erro ao renderizar após retry:', retryError)
              showError(
                'Erro ao renderizar a aplicação.',
                retryError instanceof Error ? retryError.stack : String(retryError)
              )
            }
          }, 1000)
        } catch (fallbackError) {
          console.error('[App] Erro ao renderizar fallback:', fallbackError)
          showError(
            'Erro crítico ao renderizar a aplicação.',
            fallbackError instanceof Error ? fallbackError.stack : String(fallbackError)
          )
        }
      }
    }, 1000)
    
  } catch (error) {
    console.error('[App] ❌ Erro ao renderizar aplicação:', error)
    const errorDetails = error instanceof Error 
      ? `${error.message}\n\n${error.stack || ''}`
      : String(error)
    
    showError(
      'Ocorreu um erro ao carregar a aplicação.',
      errorDetails
    )
  }
  
  // Capturar erros não tratados do React
  window.addEventListener('error', (event) => {
    // Não suprimir erros críticos da aplicação
    const isCriticalError = !event.filename || (
      !event.filename.includes('chrome-extension://') &&
      !event.filename.includes('moz-extension://') &&
      !event.filename.includes('autoPip.js') &&
      !event.filename.includes('content.ts')
    )
    
    if (isCriticalError && event.error) {
      console.error('[App] Erro não tratado:', event.error)
      // Não mostrar erro visual aqui para evitar loops, apenas logar
    }
  })
  
  // Capturar rejeições de promises não tratadas
  window.addEventListener('unhandledrejection', (event) => {
    // Não suprimir rejeições críticas
    const reason = event.reason
    const reasonMessage = reason?.message || String(reason || '')
    const reasonStack = reason?.stack || ''
    
    const isCriticalRejection = !reasonStack.includes('chrome-extension://') &&
      !reasonStack.includes('moz-extension://') &&
      !reasonStack.includes('autoPip.js') &&
      !reasonMessage.includes('MediaSession')
    
    if (isCriticalRejection) {
      console.error('[App] Promise rejeitada não tratada:', reason)
    }
  })
}
