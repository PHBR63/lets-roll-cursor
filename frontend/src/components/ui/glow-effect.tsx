// @ts-nocheck
import { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Props do GlowEffect
 */
interface GlowEffectProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Conteúdo a ser envolvido
   */
  children: ReactNode
  /**
   * Intensidade do glow (sm, md, lg, xl)
   */
  intensity?: 'sm' | 'md' | 'lg' | 'xl'
  /**
   * Cor do glow
   */
  color?: string
  /**
   * Animação pulsante
   */
  pulse?: boolean
}

/**
 * Efeito de brilho/glow ao redor de elementos
 */
export function GlowEffect({
  children,
  className,
  intensity = 'md',
  color = '#8000FF',
  pulse = false,
  ...props
}: GlowEffectProps) {
  const intensityClasses = {
    sm: 'shadow-[0_0_10px]',
    md: 'shadow-[0_0_20px]',
    lg: 'shadow-[0_0_30px]',
    xl: 'shadow-[0_0_40px]',
  }

  return (
    <div
      className={cn(
        'relative inline-block',
        intensityClasses[intensity],
        pulse && 'animate-pulse',
        className
      )}
      style={{
        '--glow-color': color,
        boxShadow: `0 0 ${intensity === 'sm' ? '10px' : intensity === 'md' ? '20px' : intensity === 'lg' ? '30px' : '40px'} ${color}40`,
      } as React.CSSProperties}
      {...props}
    >
      {children}
    </div>
  )
}

