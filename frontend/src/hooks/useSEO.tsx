// @ts-nocheck
import { useEffect } from 'react'

interface SEOData {
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
 * Hook para gerenciar SEO dinâmico por página
 * Atualiza título, meta tags e canonical URL
 */
export function useSEO(data: SEOData) {
  useEffect(() => {
    const {
      title,
      description,
      keywords,
      canonical,
      ogTitle,
      ogDescription,
      ogImage,
      ogType = 'website',
      twitterTitle,
      twitterDescription,
      noindex = false,
    } = data

    // Título da página
    if (title) {
      document.title = title
    }

    // Meta description
    let metaDescription = document.querySelector('meta[name="description"]')
    if (!metaDescription) {
      metaDescription = document.createElement('meta')
      metaDescription.setAttribute('name', 'description')
      document.head.appendChild(metaDescription)
    }
    if (description) {
      metaDescription.setAttribute('content', description)
    }

    // Meta keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]')
    if (keywords) {
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta')
        metaKeywords.setAttribute('name', 'keywords')
        document.head.appendChild(metaKeywords)
      }
      metaKeywords.setAttribute('content', keywords)
    }

    // Canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]')
    if (canonical) {
      if (!canonicalLink) {
        canonicalLink = document.createElement('link')
        canonicalLink.setAttribute('rel', 'canonical')
        document.head.appendChild(canonicalLink)
      }
      canonicalLink.setAttribute('href', canonical)
    }

    // Open Graph
    const updateOGTag = (property: string, content: string) => {
      let tag = document.querySelector(`meta[property="${property}"]`)
      if (!tag) {
        tag = document.createElement('meta')
        tag.setAttribute('property', property)
        document.head.appendChild(tag)
      }
      tag.setAttribute('content', content)
    }

    if (ogTitle || title) updateOGTag('og:title', ogTitle || title || '')
    if (ogDescription || description) updateOGTag('og:description', ogDescription || description || '')
    if (ogImage) updateOGTag('og:image', ogImage)
    updateOGTag('og:type', ogType)
    updateOGTag('og:url', canonical || window.location.href)

    // Twitter Cards
    const updateTwitterTag = (name: string, content: string) => {
      let tag = document.querySelector(`meta[name="twitter:${name}"]`)
      if (!tag) {
        tag = document.createElement('meta')
        tag.setAttribute('name', `twitter:${name}`)
        document.head.appendChild(tag)
      }
      tag.setAttribute('content', content)
    }

    if (twitterTitle || title) updateTwitterTag('title', twitterTitle || title || '')
    if (twitterDescription || description) updateTwitterTag('description', twitterDescription || description || '')

    // Robots noindex
    let robotsTag = document.querySelector('meta[name="robots"]')
    if (noindex) {
      if (!robotsTag) {
        robotsTag = document.createElement('meta')
        robotsTag.setAttribute('name', 'robots')
        document.head.appendChild(robotsTag)
      }
      robotsTag.setAttribute('content', 'noindex, nofollow')
    } else if (robotsTag) {
      robotsTag.setAttribute('content', 'index, follow')
    }
  }, [data])
}

