import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

/**
 * Componente de imagem com lazy loading
 * Carrega a imagem apenas quando está visível no viewport
 */
interface LazyImageProps {
  src?: string | null
  alt: string
  className?: string
  placeholder?: React.ReactNode
  fallback?: React.ReactNode
  onLoad?: () => void
  onError?: () => void
}

export function LazyImage({
  src,
  alt,
  className,
  placeholder,
  fallback,
  onLoad,
  onError,
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  /**
   * Intersection Observer para detectar quando a imagem entra no viewport
   */
  useEffect(() => {
    if (!containerRef.current || isInView) return

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
        rootMargin: '50px', // Começar a carregar 50px antes de entrar no viewport
      }
    )

    observer.observe(containerRef.current)

    return () => {
      observer.disconnect()
    }
  }, [isInView])

  /**
   * Carregar imagem quando entrar no viewport
   */
  useEffect(() => {
    if (!isInView || !src || isLoaded) return

    const img = new Image()
    img.src = src

    img.onload = () => {
      setIsLoaded(true)
      onLoad?.()
    }

    img.onerror = () => {
      setHasError(true)
      onError?.()
    }
  }, [isInView, src, isLoaded, onLoad, onError])

  // Se não há src, mostrar fallback
  if (!src) {
    return (
      <div className={cn('flex items-center justify-center bg-card-secondary', className)}>
        {fallback || <span className="text-text-secondary text-sm">Sem imagem</span>}
      </div>
    )
  }

  // Se houve erro, mostrar fallback
  if (hasError) {
    return (
      <div className={cn('flex items-center justify-center bg-card-secondary', className)}>
        {fallback || <span className="text-text-secondary text-sm">Erro ao carregar</span>}
      </div>
    )
  }

  return (
    <div ref={containerRef} className={cn('relative overflow-hidden', className)}>
      {/* Placeholder enquanto carrega */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-card-secondary animate-pulse">
          {placeholder || (
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          )}
        </div>
      )}

      {/* Imagem */}
      {isInView && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          loading="lazy"
          decoding="async"
        />
      )}
    </div>
  )
}

