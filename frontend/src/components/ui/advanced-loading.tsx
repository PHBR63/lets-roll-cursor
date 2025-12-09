// @ts-nocheck
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AdvancedLoadingProps {
  message?: string
  progress?: number
  variant?: 'spinner' | 'skeleton' | 'progress' | 'dots'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

/**
 * Componente de loading avançado com múltiplas variantes
 */
export function AdvancedLoading({
  message,
  progress,
  variant = 'spinner',
  size = 'md',
  className,
}: AdvancedLoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  if (variant === 'spinner') {
    return (
      <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
        <Loader2 className={cn('animate-spin text-accent', sizeClasses[size])} />
        {message && (
          <p className="text-sm text-text-secondary animate-pulse">{message}</p>
        )}
      </div>
    )
  }

  if (variant === 'dots') {
    return (
      <div className={cn('flex items-center justify-center gap-2', className)}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-accent rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
        {message && (
          <p className="text-sm text-text-secondary ml-2">{message}</p>
        )}
      </div>
    )
  }

  if (variant === 'progress') {
    return (
      <div className={cn('w-full space-y-2', className)}>
        {message && (
          <p className="text-sm text-text-secondary">{message}</p>
        )}
        <div className="w-full bg-card-secondary rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full bg-accent rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress || 0}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        {progress !== undefined && (
          <p className="text-xs text-text-secondary text-right">
            {Math.round(progress)}%
          </p>
        )}
      </div>
    )
  }

  if (variant === 'skeleton') {
    return (
      <div className={cn('space-y-2', className)}>
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="h-4 bg-card-secondary rounded"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    )
  }

  return null
}

/**
 * Skeleton loader para cards
 */
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('bg-card border border-card-secondary rounded-lg p-6', className)}>
      <div className="space-y-4">
        <div className="h-6 bg-card-secondary rounded w-3/4 animate-pulse" />
        <div className="h-4 bg-card-secondary rounded w-full animate-pulse" />
        <div className="h-4 bg-card-secondary rounded w-5/6 animate-pulse" />
      </div>
    </div>
  )
}

/**
 * Skeleton loader para lista
 */
export function ListSkeleton({ count = 3, className }: { count?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}

