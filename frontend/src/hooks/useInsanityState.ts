/**
 * Hook para calcular estados de insanidade baseado em SAN
 * Retorna estado atual, severidade, cores e efeitos visuais
 */
import { useMemo } from 'react'

export type InsanityState = 
  | 'NORMAL'
  | 'ABALADO_MENTAL'
  | 'PERTURBADO'
  | 'ENLOUQUECENDO'
  | 'TOTALMENTE_INSANO'

export interface InsanityStateData {
  state: InsanityState
  severity: number // 0-4 (0 = normal, 4 = totalmente insano)
  percentage: number
  color: string
  glowColor: string
  intensity: number // 0-1 (intensidade da aura)
  pulse: boolean
  message: string
  description: string
}

/**
 * Hook para calcular estado de insanidade
 */
export function useInsanityState(currentSAN: number, maxSAN: number): InsanityStateData {
  return useMemo(() => {
    if (maxSAN === 0) {
      return {
        state: 'NORMAL',
        severity: 0,
        percentage: 100,
        color: '#22C55E', // Verde
        glowColor: 'rgba(34, 197, 94, 0.1)',
        intensity: 0,
        pulse: false,
        message: 'Sanidade normal',
        description: 'Mente estável e saudável',
      }
    }

    const percentage = (currentSAN / maxSAN) * 100

    // Totalmente Insano (SAN = 0)
    if (currentSAN <= 0) {
      return {
        state: 'TOTALMENTE_INSANO',
        severity: 4,
        percentage: 0,
        color: '#DC2626', // Vermelho intenso
        glowColor: 'rgba(220, 38, 38, 0.6)',
        intensity: 1.0,
        pulse: true,
        message: 'Totalmente Insano!',
        description: 'SAN = 0. A mente foi completamente consumida pelo Outro Lado.',
      }
    }

    // Enlouquecendo (SAN <= 25%)
    if (percentage <= 25) {
      return {
        state: 'ENLOUQUECENDO',
        severity: 3,
        percentage,
        color: '#F97316', // Laranja
        glowColor: 'rgba(249, 115, 22, 0.5)',
        intensity: 0.75,
        pulse: true,
        message: 'Enlouquecendo!',
        description: `SAN ≤ 25%. A mente está à beira do colapso.`,
      }
    }

    // Perturbado (SAN <= 50%)
    if (percentage <= 50) {
      return {
        state: 'PERTURBADO',
        severity: 2,
        percentage,
        color: '#EAB308', // Amarelo
        glowColor: 'rgba(234, 179, 8, 0.3)',
        intensity: 0.5,
        pulse: false,
        message: 'Perturbado mentalmente',
        description: `SAN ≤ 50%. A mente está abalada e vulnerável.`,
      }
    }

    // Abalado Mentalmente (SAN <= 75%)
    if (percentage <= 75) {
      return {
        state: 'ABALADO_MENTAL',
        severity: 1,
        percentage,
        color: '#3B82F6', // Azul
        glowColor: 'rgba(59, 130, 246, 0.2)',
        intensity: 0.25,
        pulse: false,
        message: 'Mentalmente abalado',
        description: `SAN ≤ 75%. Sinais de estresse mental começam a aparecer.`,
      }
    }

    // Normal
    return {
      state: 'NORMAL',
      severity: 0,
      percentage,
      color: '#22C55E', // Verde
      glowColor: 'rgba(34, 197, 94, 0.1)',
      intensity: 0,
      pulse: false,
      message: 'Sanidade normal',
      description: 'Mente estável e saudável',
    }
  }, [currentSAN, maxSAN])
}

