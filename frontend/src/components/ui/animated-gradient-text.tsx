/**
 * Animated Gradient Text - Texto com gradiente animado
 * Baseado no componente do 21st.dev Magic UI
 * Customizado para tema roxo Let's Roll
 */
import * as React from 'react'
import { cn } from '@/lib/utils'

interface AnimatedGradientTextProps {
  /**
   * Texto a ser exibido
   */
  children: React.ReactNode
  /**
   * Classe CSS adicional
   */
  className?: string
  /**
   * Cores do gradiente (padrão: roxo)
   */
  gradientFrom?: string
  gradientTo?: string
  /**
   * Duração da animação em segundos (padrão: 3)
   */
  duration?: number
  /**
   * Se deve desabilitar a animação
   */
  disabled?: boolean
  /**
   * Tamanho do texto
   */
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'
}

/**
 * Componente Animated Gradient Text
 * Cria texto com gradiente animado
 */
export function AnimatedGradientText({
  children,
  className,
  gradientFrom = '#8000FF',
  gradientTo = '#A855F7',
  duration = 3,
  disabled = false,
  size = 'md',
}: AnimatedGradientTextProps) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl',
  }

  return (
    <span
      className={cn(
        'inline-block font-bold bg-clip-text text-transparent',
        sizeClasses[size],
        className
      )}
      style={
        disabled
          ? {
              backgroundImage: `linear-gradient(to right, ${gradientFrom}, ${gradientTo})`,
            }
          : {
              backgroundImage: `linear-gradient(to right, ${gradientFrom}, ${gradientTo}, ${gradientFrom})`,
              backgroundSize: '200% auto',
              animation: `gradient-text ${duration}s linear infinite`,
            } as React.CSSProperties
      }
    >
      {children}
    </span>
  )
}

