// @ts-nocheck
import { useState, useEffect, ImgHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

/**
 * Props do OptimizedImage
 */
interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet'> {
  /**
   * URL da imagem
   */
  src: string
  /**
   * Texto alternativo (obrigatório para acessibilidade)
   */
  alt: string
  /**
   * URL do placeholder blur (base64 ou URL)
   */
  blurPlaceholder?: string
  /**
   * Largura da imagem (para srcset)
   */
  width?: number
  /**
   * Altura da imagem (para srcset)
   */
  height?: number
  /**
   * Tamanhos responsivos para srcset
   */
  sizes?: string
  /**
   * Prioridade de carregamento (preload)
   */
  priority?: boolean
  /**
   * Classe CSS adicional
   */
  className?: string
  /**
   * Fallback quando imagem falha ao carregar
   */
  fallback?: React.ReactNode
  /**
   * Callback quando imagem carrega
   */
  onLoad?: () => void
  /**
   * Callback quando imagem falha
   */
  onError?: () => void
}

/**
 * Componente de imagem otimizada
 * - Lazy loading automático
 * - WebP com fallback
 * - Responsive images (srcset)
 * - Blur placeholder
 * - Error handling
 */
export function OptimizedImage({
  src,
  alt,
  blurPlaceholder,
  width,
  height,
  sizes,
  priority = false,
  className,
  fallback,
  onLoad,
  onError,
  ...props
}: OptimizedImageProps) {
  const [imageSrc, setImageSrc] = useState<string>(blurPlaceholder || '')
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isInView, setIsInView] = useState(priority)

  // Intersection Observer para lazy loading
  useEffect(() => {
    if (priority || isInView) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observer.disconnect()
          }
        })
      },
      {
        rootMargin: '50px', // Começar a carregar 50px antes de entrar na viewport
      }
    )

    const imgElement = document.querySelector(`[data-image-id="${src}"]`)
    if (imgElement) {
      observer.observe(imgElement)
    }

    return () => observer.disconnect()
  }, [src, priority, isInView])

  // Carregar imagem quando entrar na viewport
  useEffect(() => {
    if (!isInView) return

    const img = new Image()
    img.onload = () => {
      setImageSrc(src)
      setIsLoaded(true)
      onLoad?.()
    }
    img.onerror = () => {
      setHasError(true)
      onError?.()
    }
    img.src = src
  }, [src, isInView, onLoad, onError])

  // Gerar srcset para WebP e fallback
  const generateSrcSet = (baseSrc: string, format: 'webp' | 'original'): string => {
    if (!width) return ''
    
    const widths = [320, 640, 768, 1024, 1280, 1920]
    const filteredWidths = widths.filter((w) => w <= (width * 2))
    
    return filteredWidths
      .map((w) => {
        if (format === 'webp') {
          // Tentar gerar URL WebP (depende do backend/CDN)
          const webpSrc = baseSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp')
          return `${webpSrc}?w=${w} ${w}w`
        }
        return `${baseSrc}?w=${w} ${w}w`
      })
      .join(', ')
  }

  // Erro ao carregar
  if (hasError && fallback) {
    return <>{fallback}</>
  }

  if (hasError) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-card-secondary text-text-secondary',
          className
        )}
        style={{ width, height }}
        role="img"
        aria-label={alt}
      >
        <span className="text-xs">Imagem não disponível</span>
      </div>
    )
  }

  const defaultSizes = sizes || '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'

  return (
    <div
      className={cn('relative overflow-hidden', className)}
      style={{ width, height }}
      data-image-id={src}
    >
      {/* Blur placeholder */}
      {blurPlaceholder && !isLoaded && (
        <img
          src={blurPlaceholder}
          alt=""
          className="absolute inset-0 w-full h-full object-cover blur-md scale-110"
          aria-hidden="true"
        />
      )}

      {/* Imagem principal */}
      <img
        src={isInView ? imageSrc : blurPlaceholder || ''}
        alt={alt}
        width={width}
        height={height}
        srcSet={
          isInView && imageSrc
            ? `${generateSrcSet(imageSrc, 'webp')}, ${generateSrcSet(imageSrc, 'original')}`
            : undefined
        }
        sizes={isInView ? defaultSizes : undefined}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className={cn(
          'transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0',
          className
        )}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        {...props}
      />

      {/* Loading skeleton */}
      {!isLoaded && !blurPlaceholder && (
        <div className="absolute inset-0 bg-card-secondary animate-pulse" />
      )}
    </div>
  )
}

/**
 * Helper para gerar blur placeholder base64
 * Útil para criar placeholders pequenos de imagens grandes
 */
export function generateBlurPlaceholder(width = 10, height = 10): string {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  
  if (ctx) {
    // Criar gradiente simples como placeholder
    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, '#2A2A3A')
    gradient.addColorStop(1, '#1A0033')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)
  }
  
  return canvas.toDataURL('image/png')
}

