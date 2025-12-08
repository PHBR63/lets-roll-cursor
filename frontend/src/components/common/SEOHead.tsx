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
  ogType?: string
  twitterTitle?: string
  twitterDescription?: string
  noindex?: boolean
}

/**
 * Componente para gerenciar SEO dinâmico por página
 * Usa o hook useSEO internamente
 */
export function SEOHead({
  title,
  description,
  keywords,
  canonical,
  ogTitle,
  ogDescription,
  ogImage,
  ogType,
  twitterTitle,
  twitterDescription,
  noindex,
}: SEOHeadProps) {
  useSEO({
    title,
    description,
    keywords,
    canonical,
    ogTitle,
    ogDescription,
    ogImage,
    ogType,
    twitterTitle,
    twitterDescription,
    noindex,
  })

  return null // Componente não renderiza nada
}

