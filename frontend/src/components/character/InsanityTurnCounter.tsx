// @ts-nocheck
/**
 * Componente de Contador de Turnos em Estado de Insanidade
 * Rastreia quantos turnos o personagem está em estado de insanidade
 */
import { useState, useEffect } from 'react'
import { useInsanityState } from '@/hooks/useInsanityState'
import { Character } from '@/types/character'
import { Badge } from '@/components/ui/badge'
import { Clock, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InsanityTurnCounterProps {
  character: Character
  /**
   * Callback quando o contador é atualizado
   */
  onTurnCountChange?: (turns: number) => void
  /**
   * Classe CSS adicional
   */
  className?: string
}

/**
 * Componente de Contador de Turnos de Insanidade
 * Mostra quantos turnos o personagem está em estado de insanidade
 */
export function InsanityTurnCounter({ 
  character, 
  onTurnCountChange,
  className 
}: InsanityTurnCounterProps) {
  const stats = character.stats || {}
  const san = stats.san || { current: 0, max: 0 }
  
  const insanityState = useInsanityState(san.current, san.max)
  
  // Buscar contador de turnos do conditionTimers do personagem
  const turnCount = (() => {
    const conditionTimers = character.conditionTimers || []
    const insanityTimer = conditionTimers.find(t => t.condition === 'INSANIDADE')
    return insanityTimer?.duration || 0
  })()

  // Notificar mudanças no contador
  useEffect(() => {
    onTurnCountChange?.(turnCount)
  }, [turnCount, onTurnCountChange])

  // Não mostrar se não está em estado de insanidade
  if (insanityState.severity < 2) {
    return null
  }

  const getWarningMessage = () => {
    if (turnCount >= 10) {
      return 'Estado crítico! A mente está à beira do colapso permanente.'
    }
    if (turnCount >= 5) {
      return 'Atenção! Muitos turnos em estado de insanidade podem ter consequências permanentes.'
    }
    return 'Personagem está em estado de insanidade.'
  }

  return (
    <div
      className={cn(
        'flex items-center gap-2 p-3 rounded-lg border',
        'bg-red-900/20 border-red-500/50',
        insanityState.pulse && 'animate-pulse',
        className
      )}
    >
      <AlertTriangle className="w-5 h-5 text-red-500" />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-red-400" />
          <span className="text-white font-semibold text-sm">
            Turnos em Insanidade: {turnCount}
          </span>
        </div>
        <p className="text-red-300 text-xs mt-1">{getWarningMessage()}</p>
      </div>
      <Badge 
        variant="destructive" 
        className={cn(
          'text-xs',
          turnCount >= 10 && 'animate-pulse'
        )}
      >
        {insanityState.state}
      </Badge>
    </div>
  )
}

