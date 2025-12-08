import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { trackPageView } from '@/utils/analytics'

/**
 * Hook para rastrear mudanças de página com analytics
 */
export function usePageTracking() {
  const location = useLocation()

  useEffect(() => {
    // Rastrear visualização de página
    trackPageView(location.pathname + location.search)
  }, [location])
}
