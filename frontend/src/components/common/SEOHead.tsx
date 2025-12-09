// @ts-nocheck
import { useSEO } from '@/hooks/useSEO'

interface SEOHeadProps {
  title?: string
  description?: string
  keywords?: string
  canonical?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  ogType?: 'website' | 'article' | 'profile'
  ogUrl?: string
  ogSiteName?: string
  twitterTitle?: string
  twitterDescription?: string
  twitterImage?: string
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player'
  twitterSite?: string
  twitterCreator?: string
  noindex?: boolean
  structuredData?: Record<string, unknown>
  author?: string
  publishedTime?: string
  modifiedTime?: string
  locale?: string
}

/**
 * Componente para gerenciar SEO dinâmico por página
 * Usa o hook useSEO internamente
 */
export function SEOHead(props: SEOHeadProps) {
  useSEO(props)

  return null // Componente não renderiza nada
}

