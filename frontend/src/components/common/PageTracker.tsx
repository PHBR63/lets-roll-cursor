import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { trackPageView } from '@/utils/analytics'

/**
 * Componente para rastrear mudanças de página com analytics
 * Deve ser usado dentro de BrowserRouter
 */
export function PageTracker() {
  const location = useLocation()

  useEffect(() => {
    // Rastrear visualização de página
    trackPageView(location.pathname + location.search)
  }, [location])

  return null
}
