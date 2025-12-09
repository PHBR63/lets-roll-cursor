/**
 * Utilitário de Analytics
 * Suporta Google Analytics e eventos customizados
 */

interface AnalyticsEvent {
  action: string
  category: string
  label?: string
  value?: number
}

/**
 * Inicializa analytics (Google Analytics)
 */
export function initAnalytics(measurementId?: string) {
  if (typeof window === 'undefined') return

  // Se não houver measurementId, usar variável de ambiente
  const gaId = measurementId || import.meta.env.VITE_GA_MEASUREMENT_ID

  if (!gaId) {
    // Analytics desabilitado se não houver ID
    return
  }

  // Carregar Google Analytics
  const script1 = document.createElement('script')
  script1.async = true
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`
  document.head.appendChild(script1)

  const script2 = document.createElement('script')
  script2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${gaId}', {
      page_path: window.location.pathname,
    });
  `
  document.head.appendChild(script2)
}

/**
 * Registra um evento de analytics
 */
export function trackEvent(event: AnalyticsEvent) {
  if (typeof window === 'undefined' || !window.gtag) return

  window.gtag('event', event.action, {
    event_category: event.category,
    event_label: event.label,
    value: event.value,
  })
}

/**
 * Registra navegação de página
 */
export function trackPageView(path: string) {
  if (typeof window === 'undefined' || !window.gtag) return

  window.gtag('config', import.meta.env.VITE_GA_MEASUREMENT_ID || '', {
    page_path: path,
  })
}

/**
 * Eventos pré-definidos para o app
 */
export const AnalyticsEvents = {
  // Autenticação
  login: () => trackEvent({ action: 'login', category: 'auth' }),
  logout: () => trackEvent({ action: 'logout', category: 'auth' }),
  register: () => trackEvent({ action: 'register', category: 'auth' }),

  // Campanhas
  createCampaign: () => trackEvent({ action: 'create_campaign', category: 'campaign' }),
  joinCampaign: () => trackEvent({ action: 'join_campaign', category: 'campaign' }),

  // Personagens
  createCharacter: () => trackEvent({ action: 'create_character', category: 'character' }),
  updateCharacter: () => trackEvent({ action: 'update_character', category: 'character' }),

  // Sessões
  createSession: () => trackEvent({ action: 'create_session', category: 'session' }),
  joinSession: () => trackEvent({ action: 'join_session', category: 'session' }),

  // Dados
  rollDice: (diceType: string) =>
    trackEvent({ action: 'roll_dice', category: 'dice', label: diceType }),

  // GameBoard
  uploadMap: () => trackEvent({ action: 'upload_map', category: 'gameboard' }),
  addToken: (tokenType: string) =>
    trackEvent({ action: 'add_token', category: 'gameboard', label: tokenType }),
}

// Tipos para Google Analytics
type GtagCommand = 'config' | 'event' | 'set' | 'js'
type GtagEventParams = Record<string, string | number | boolean>

// Declaração de tipo para window.gtag
declare global {
  interface Window {
    gtag?: (command: GtagCommand, targetId: string, config?: GtagEventParams) => void
    dataLayer?: Array<Record<string, unknown>>
  }
}
