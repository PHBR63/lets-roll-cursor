/**
 * Componente de Aura Visual de Insanidade
 * Versão melhorada com animações complexas e acessibilidade
 */
import React from 'react'
import { useInsanityState, InsanityState } from '@/hooks/useInsanityState'
import { Character } from '@/types/character'
import { cn } from '@/lib/utils'
import { useInsanitySound } from '@/hooks/useInsanitySound'
import { useAccessibility } from '@/hooks/useAccessibility'

interface InsanityAuraProps {
  character: Character
  /**
   * Se deve mostrar a aura (padrão: true se SAN baixa)
   */
  show?: boolean
  /**
   * Intensidade adicional da aura (0-1)
   */
  intensityMultiplier?: number
  /**
   * Classe CSS adicional
   */
  className?: string
  /**
   * Modo: 'fullscreen' (tela inteira) ou 'container' (ao redor do componente)
   */
  mode?: 'fullscreen' | 'container'
}

/**
 * Componente de Aura de Insanidade
 * Cria efeito visual atmosférico baseado no nível de SAN
 */
export function InsanityAura({ 
  character, 
  show, 
  intensityMultiplier = 1,
  className,
  mode = 'container'
}: InsanityAuraProps) {
  const stats = character.stats || {}
  const san = stats.san || { current: 0, max: 0 }
  
  const insanityState = useInsanityState(san.current, san.max)
  const { reducedMotion, disableVisualEffects } = useAccessibility()
  
  // Efeitos sonoros (respeitando preferências de acessibilidade)
  useInsanitySound(san.current, san.max, {
    enabled: !disableVisualEffects && insanityState.severity >= 2,
    volume: 0.3,
    transitionOnly: false,
  })
  
  // Não mostrar se SAN normal, show=false, ou efeitos visuais desabilitados
  if (show === false || insanityState.severity === 0 || disableVisualEffects) {
    return null
  }

  // Se show não foi especificado, mostrar apenas se severidade >= 2
  if (show === undefined && insanityState.severity < 2) {
    return null
  }

  const finalIntensity = Math.min(1, insanityState.intensity * intensityMultiplier)
  const isCritical = insanityState.severity >= 3
  const isExtreme = insanityState.severity === 4

  // Estilos para a aura
  const auraStyle: React.CSSProperties = {
    '--aura-color': insanityState.color,
    '--glow-color': insanityState.glowColor,
    '--intensity': finalIntensity,
  } as React.CSSProperties

  if (mode === 'fullscreen') {
    return (
      <div
        className={cn(
          'fixed inset-0 pointer-events-none z-50',
          !reducedMotion && isCritical && 'animate-pulse',
          !reducedMotion && isExtreme && 'insanity-glitch',
          className
        )}
        style={auraStyle}
      >
        {/* Overlay com gradiente radial */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at center, ${insanityState.glowColor} 0%, transparent 70%)`,
            opacity: finalIntensity * 0.3,
          }}
        />
        
        {/* Partículas flutuantes (efeito de distorção) */}
        {isCritical && !reducedMotion && (
          <div className="absolute inset-0">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: `${20 + i * 10}px`,
                  height: `${20 + i * 10}px`,
                  background: insanityState.color,
                  opacity: finalIntensity * 0.2,
                  left: `${20 + i * 15}%`,
                  top: `${20 + i * 10}%`,
                  filter: 'blur(10px)',
                  animation: `float ${3 + i}s ease-in-out infinite`,
                  animationDelay: `${i * 0.5}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Efeito de distorção/glitch para estados críticos */}
        {isExtreme && !reducedMotion && (
          <>
            {/* Linhas de distorção */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                background: `repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent 2px,
                  ${insanityState.color} 2px,
                  ${insanityState.color} 4px
                )`,
                animation: 'glitch-scan 0.5s linear infinite',
              }}
            />
            {/* Ruído estático */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                mixBlendMode: 'screen',
                animation: 'noise 0.2s steps(4) infinite',
              }}
            />
          </>
        )}

        {/* Vignette effect (escurecimento nas bordas) */}
        {insanityState.severity >= 2 && (
          <div
            className="absolute inset-0"
            style={{
              boxShadow: `inset 0 0 ${100 * finalIntensity}px ${insanityState.color}`,
              opacity: finalIntensity * 0.1,
            }}
          />
        )}
      </div>
    )
  }

  // Modo container (aura ao redor do componente)
  return (
    <div
      className={cn(
        'absolute inset-0 pointer-events-none rounded-lg overflow-hidden',
        !reducedMotion && isCritical && 'animate-pulse',
        !reducedMotion && isExtreme && 'insanity-glitch',
        className
      )}
      style={auraStyle}
    >
      {/* Glow border */}
      <div
        className="absolute inset-0 rounded-lg"
        style={{
          boxShadow: `0 0 ${20 * finalIntensity}px ${insanityState.glowColor}, inset 0 0 ${10 * finalIntensity}px ${insanityState.glowColor}`,
          border: `2px solid ${insanityState.color}`,
          opacity: finalIntensity,
        }}
      />
      
      {/* Efeito de brilho pulsante */}
      {!reducedMotion && insanityState.pulse && (
        <div
          className="absolute inset-0 rounded-lg"
          style={{
            background: `radial-gradient(circle at center, ${insanityState.glowColor} 0%, transparent 70%)`,
            opacity: finalIntensity * 0.3,
            animation: 'pulse 2s ease-in-out infinite',
          }}
        />
      )}

      {/* Efeito de glitch para estados extremos */}
      {isExtreme && !reducedMotion && (
        <div
          className="absolute inset-0 rounded-lg"
          style={{
            background: `linear-gradient(90deg, transparent 50%, ${insanityState.color}20 50%)`,
            backgroundSize: '4px 100%',
            animation: 'glitch-horizontal 0.1s linear infinite',
            mixBlendMode: 'screen',
          }}
        />
      )}
    </div>
  )
}
