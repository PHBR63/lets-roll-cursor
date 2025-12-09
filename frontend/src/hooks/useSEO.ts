// @ts-nocheck
import { useEffect } from 'react'

interface SEOOptions {
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

const DEFAULT_TITLE = 'Let\'s Roll - Sistema de RPG Online'
const DEFAULT_DESCRIPTION = 'Plataforma completa para gerenciar suas campanhas de RPG, personagens e sessões de jogo em tempo real.'
const DEFAULT_OG_IMAGE = '/og-image.png'
const DEFAULT_SITE_NAME = 'Let\'s Roll'

/**
 * Hook para gerenciar SEO dinâmico
 */
export function useSEO(options: SEOOptions = {}) {
  const {
    title,
    description,
    keywords,
    canonical,
    ogTitle,
    ogDescription,
    ogImage,
    ogType = 'website',
    ogUrl,
    ogSiteName,
    twitterTitle,
    twitterDescription,
    twitterImage,
    twitterCard = 'summary_large_image',
    twitterSite,
    twitterCreator,
    noindex = false,
    structuredData,
    author,
    publishedTime,
    modifiedTime,
    locale = 'pt_BR',
  } = options

  useEffect(() => {
    const fullTitle = title ? `${title} | ${DEFAULT_TITLE}` : DEFAULT_TITLE
    const fullDescription = description || DEFAULT_DESCRIPTION
    const fullOgImage = ogImage || DEFAULT_OG_IMAGE
    const fullOgUrl = ogUrl || (typeof window !== 'undefined' ? window.location.href : '')
    const fullCanonical = canonical || fullOgUrl

    // Título da página
    document.title = fullTitle

    // Meta tags básicas
    updateMetaTag('description', fullDescription)
    if (keywords) {
      updateMetaTag('keywords', keywords)
    }
    if (author) {
      updateMetaTag('author', author)
    }

    // Robots
    if (noindex) {
      updateMetaTag('robots', 'noindex, nofollow')
    } else {
      updateMetaTag('robots', 'index, follow')
    }

    // Canonical URL
    updateLinkTag('canonical', fullCanonical)

    // Open Graph
    updateMetaTag('og:title', ogTitle || fullTitle, 'property')
    updateMetaTag('og:description', ogDescription || fullDescription, 'property')
    updateMetaTag('og:image', fullOgImage, 'property')
    updateMetaTag('og:type', ogType, 'property')
    updateMetaTag('og:url', fullOgUrl, 'property')
    updateMetaTag('og:site_name', ogSiteName || DEFAULT_SITE_NAME, 'property')
    updateMetaTag('og:locale', locale, 'property')

    // Twitter Cards
    updateMetaTag('twitter:card', twitterCard)
    updateMetaTag('twitter:title', twitterTitle || ogTitle || fullTitle)
    updateMetaTag('twitter:description', twitterDescription || ogDescription || fullDescription)
    updateMetaTag('twitter:image', twitterImage || fullOgImage)
    if (twitterSite) {
      updateMetaTag('twitter:site', twitterSite)
    }
    if (twitterCreator) {
      updateMetaTag('twitter:creator', twitterCreator)
    }

    // Article meta (se for tipo article)
    if (ogType === 'article') {
      if (author) {
        updateMetaTag('article:author', author, 'property')
      }
      if (publishedTime) {
        updateMetaTag('article:published_time', publishedTime, 'property')
      }
      if (modifiedTime) {
        updateMetaTag('article:modified_time', modifiedTime, 'property')
      }
    }

    // Structured Data (JSON-LD)
    if (structuredData) {
      updateStructuredData(structuredData)
    } else {
      // Structured data padrão
      updateStructuredData({
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: DEFAULT_SITE_NAME,
        description: fullDescription,
        url: fullOgUrl,
        applicationCategory: 'Game',
        operatingSystem: 'Web',
      })
    }
  }, [
    title,
    description,
    keywords,
    canonical,
    ogTitle,
    ogDescription,
    ogImage,
    ogType,
    ogUrl,
    ogSiteName,
    twitterTitle,
    twitterDescription,
    twitterImage,
    twitterCard,
    twitterSite,
    twitterCreator,
    noindex,
    structuredData,
    author,
    publishedTime,
    modifiedTime,
    locale,
  ])
}

/**
 * Atualizar ou criar meta tag
 */
function updateMetaTag(name: string, content: string, attribute: 'name' | 'property' = 'name') {
  if (typeof document === 'undefined') return

  let meta = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement | null

  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute(attribute, name)
    document.head.appendChild(meta)
  }

  meta.setAttribute('content', content)
}

/**
 * Atualizar ou criar link tag
 */
function updateLinkTag(rel: string, href: string) {
  if (typeof document === 'undefined') return

  let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null

  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', rel)
    document.head.appendChild(link)
  }

  link.setAttribute('href', href)
}

/**
 * Atualizar structured data (JSON-LD)
 */
function updateStructuredData(data: Record<string, unknown>) {
  if (typeof document === 'undefined') return

  // Remover structured data existente
  const existingScript = document.querySelector('script[type="application/ld+json"]')
  if (existingScript) {
    existingScript.remove()
  }

  // Criar novo script com structured data
  const script = document.createElement('script')
  script.type = 'application/ld+json'
  script.textContent = JSON.stringify(data, null, 2)
  document.head.appendChild(script)
}

