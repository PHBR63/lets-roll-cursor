// @ts-nocheck
import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

/**
 * Props do SkeletonLoader
 */
interface SkeletonLoaderProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Variante do skeleton
   */
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
  /**
   * Largura (opcional)
   */
  width?: string | number
  /**
   * Altura (opcional)
   */
  height?: string | number
  /**
   * Animação shimmer
   */
  animate?: boolean
}

/**
 * Componente de skeleton loading
 * Exibe placeholder animado enquanto conteúdo carrega
 */
export function SkeletonLoader({
  className,
  variant = 'rectangular',
  width,
  height,
  animate = true,
  ...props
}: SkeletonLoaderProps) {
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full aspect-square',
    rectangular: 'rounded',
    rounded: 'rounded-lg',
  }

  return (
    <div
      className={cn(
        'bg-card-secondary',
        variantClasses[variant],
        animate && 'animate-pulse',
        className
      )}
      style={{
        width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
        height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
      }}
      {...props}
    >
      {/* Efeito shimmer */}
      {animate && (
        <div
          className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent"
          style={{
            animation: 'shimmer 2s infinite',
          }}
        />
      )}
    </div>
  )
}

/**
 * Skeleton específico para texto
 */
export function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number
  className?: string
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLoader
          key={i}
          variant="text"
          width={i === lines - 1 ? '80%' : '100%'}
        />
      ))}
    </div>
  )
}

/**
 * Skeleton específico para card
 */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('p-4 space-y-4', className)}>
      <SkeletonLoader variant="rounded" height={200} />
      <div className="space-y-2">
        <SkeletonLoader variant="text" width="60%" />
        <SkeletonText lines={2} />
      </div>
    </div>
  )
}

