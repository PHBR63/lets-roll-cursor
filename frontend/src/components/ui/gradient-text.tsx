// @ts-nocheck
import { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Props do GradientText
 */
interface GradientTextProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * Texto a ser exibido
   */
  children: ReactNode
  /**
   * Gradiente customizado (opcional)
   */
  gradient?: string
  /**
   * Animação do gradiente
   */
  animated?: boolean
  /**
   * Tamanho do texto
   */
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

/**
 * Texto com gradiente animado
 */
export function GradientText({
  children,
  className,
  gradient,
  animated = true,
  size = 'md',
  ...props
}: GradientTextProps) {
  const defaultGradient =
    gradient ||
    'linear-gradient(135deg, #8000FF 0%, #A855F7 50%, #C084FC 100%)'

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  }

  return (
    <span
      className={cn(
        'font-bold bg-clip-text text-transparent',
        sizeClasses[size],
        animated && 'animate-gradient',
        className
      )}
      style={{
        backgroundImage: defaultGradient,
        backgroundSize: animated ? '200% auto' : '100% auto',
      }}
      {...props}
    >
      {children}
    </span>
  )
}

