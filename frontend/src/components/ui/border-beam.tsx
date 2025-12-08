/**
 * Border Beam - Borda animada com efeito de brilho
 * Baseado no componente do 21st.dev Magic UI
 * Customizado para tema roxo Let's Roll
 */
import * as React from 'react'
import { cn } from '@/lib/utils'

interface BorderBeamProps {
  /**
   * Tamanho do beam (padrão: 150)
   */
  size?: number
  /**
   * Duração da animação em segundos (padrão: 15)
   */
  duration?: number
  /**
   * Cor do beam (padrão: roxo)
   */
  colorFrom?: string
  colorTo?: string
  /**
   * Delay da animação (padrão: 0)
   */
  delay?: number
  /**
   * Classe CSS adicional
   */
  className?: string
  /**
   * Se deve desabilitar a animação
   */
  disabled?: boolean
}

/**
 * Componente Border Beam
 * Cria borda animada com efeito de brilho que percorre o perímetro
 */
export function BorderBeam({
  size = 150,
  duration = 15,
  colorFrom = '#8000FF',
  colorTo = '#A855F7',
  delay = 0,
  className,
  disabled = false,
}: BorderBeamProps) {
  if (disabled) return null

  return (
    <>
      <style>{`
        @keyframes border-beam-${size}-${duration} {
          0% {
            background-position: 0% 0%;
          }
          50% {
            background-position: 100% 100%;
          }
          100% {
            background-position: 0% 0%;
          }
        }
      `}</style>
      <div
        className={cn(
          'pointer-events-none absolute -inset-px rounded-lg',
          'opacity-0 transition-opacity duration-500 group-hover:opacity-100',
          className
        )}
        style={{
          background: `linear-gradient(0deg, transparent, ${colorFrom}20, transparent)`,
          backgroundSize: `${size}px ${size}px`,
          animation: `border-beam-${size}-${duration} ${duration}s linear infinite`,
          animationDelay: `${delay}s`,
        } as React.CSSProperties}
      />
    </>
  )
}

