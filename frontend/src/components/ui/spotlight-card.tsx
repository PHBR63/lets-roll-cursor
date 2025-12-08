// @ts-nocheck
/**
 * Spotlight Card - Card com efeito de spotlight que segue o mouse
 * Baseado no componente do 21st.dev Magic UI
 * Customizado para tema roxo Let's Roll
 */
import React, { useState, useRef } from 'react'
import { cn } from '@/lib/utils'

interface SpotlightCardProps {
  /**
   * Conteúdo do card
   */
  children: React.ReactNode
  /**
   * Classe CSS adicional
   */
  className?: string
  /**
   * Cor do spotlight (padrão: roxo)
   */
  spotlightColor?: string
  /**
   * Intensidade do spotlight (0-1, padrão: 0.3)
   */
  intensity?: number
  /**
   * Se deve desabilitar o efeito
   */
  disabled?: boolean
}

/**
 * Componente Spotlight Card
 * Cria efeito de spotlight que segue o movimento do mouse
 */
export function SpotlightCard({
  children,
  className,
  spotlightColor = 'rgba(128, 0, 255, 0.3)',
  intensity = 0.3,
  disabled = false,
}: SpotlightCardProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || !cardRef.current) return

    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setPosition({ x, y })
  }

  const handleMouseEnter = () => {
    if (disabled) return
    setIsHovering(true)
  }

  const handleMouseLeave = () => {
    setIsHovering(false)
  }

  return (
    <div
      ref={cardRef}
      className={cn(
        'relative group rounded-lg overflow-hidden',
        'bg-[#2A2A3A] border border-[#8000FF]/20',
        'transition-all duration-300',
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Spotlight effect */}
      {!disabled && isHovering && (
        <div
          className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 40%)`,
            opacity: intensity,
          }}
        />
      )}

      {/* Conteúdo */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}

