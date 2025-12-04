import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/useToast'
import { validateDiceFormula } from '@/utils/diceValidation'
import { logger } from '@/utils/logger'
import { DiceRollResult } from './types'
import { DiceRollResult as DiceRollResultType } from '@/types/dice'
import { AppError } from '@/types/common'

/**
 * Hook para gerenciar lógica de rolagem de dados
 */
export function useDiceRoll(sessionId?: string, campaignId?: string, characterId?: string) {
  const toast = useToast()
  const [rolling, setRolling] = useState(false)
  const [lastResult, setLastResult] = useState<DiceRollResultType | null>(null)
  const [showAnimation, setShowAnimation] = useState(false)
  const [animationResult, setAnimationResult] = useState<{ result: number; dice: number[] } | null>(null)

  /**
   * Rola dados baseado na fórmula
   */
  const rollFormula = async (formula: string, isPrivate: boolean = false) => {
    if (!campaignId) {
      toast.error('Erro', 'Você precisa estar em uma campanha para rolar dados')
      return
    }

    const rollFormula = formula.trim()
    if (!rollFormula) {
      toast.warning('Aviso', 'Digite uma fórmula de dados')
      return
    }

    // Validar fórmula
    const validation = validateDiceFormula(rollFormula)
    if (!validation.valid) {
      toast.error('Fórmula inválida', validation.error || 'Use formato: 1d20, 2d6+3, etc.')
      return { error: validation.error }
    }

    setRolling(true)

    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return { error: 'Não autenticado' }

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'

      const response = await fetch(`${apiUrl}/api/dice/roll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.session.access_token}`,
        },
        body: JSON.stringify({
          formula: rollFormula,
          sessionId: sessionId || null,
          campaignId,
          characterId: characterId || null,
          isPrivate,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Erro ao rolar dados')
      }

      const result = await response.json()
      
      // Mostrar animação
      if (result.details?.rolls) {
        setAnimationResult({
          result: result.result,
          dice: result.details.rolls,
        })
        setShowAnimation(true)
      }

      const rollResult: DiceRollResult = {
        type: 'basic',
        ...result,
      }
      setLastResult(rollResult)

      return { success: true, result: rollResult }
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error }, 'Erro ao rolar dados')
      toast.error('Erro ao rolar dados', err.message || 'Tente novamente.')
      return { error: err.message || 'Erro desconhecido' }
    } finally {
      setRolling(false)
    }
  }

  /**
   * Rola teste de perícia
   */
  const rollSkillTest = async (
    characterId: string,
    skillName: string,
    difficulty: number,
    advantage: boolean = false,
    disadvantage: boolean = false
  ) => {
    setRolling(true)

    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return { error: 'Não autenticado' }

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'

      const response = await fetch(
        `${apiUrl}/api/characters/${characterId}/roll-skill`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.session.access_token}`,
          },
          body: JSON.stringify({
            skillName,
            difficulty,
            advantage,
            disadvantage,
          }),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao rolar teste de perícia')
      }

      const result = await response.json()
      
      // Mostrar animação
      if (result.details?.rolls) {
        setAnimationResult({
          result: result.total,
          dice: result.details.rolls,
        })
        setShowAnimation(true)
      }

      const rollResult: DiceRollResult = {
        type: 'skill',
        ...result,
      }
      setLastResult(rollResult)

      return { success: true, result: rollResult }
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error }, 'Erro ao rolar teste de perícia')
      toast.error('Erro ao rolar teste de perícia', err.message || 'Tente novamente.')
      return { error: err.message || 'Erro desconhecido' }
    } finally {
      setRolling(false)
    }
  }

  /**
   * Rola ataque
   */
  const rollAttack = async (
    characterId: string,
    skillName: string,
    targetDefense: number,
    weaponDice: string,
    isMelee: boolean = true
  ) => {
    setRolling(true)

    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return { error: 'Não autenticado' }

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'

      const response = await fetch(
        `${apiUrl}/api/characters/${characterId}/roll-attack`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.session.access_token}`,
          },
          body: JSON.stringify({
            skillName,
            targetDefense: parseInt(String(targetDefense)),
            weaponDice,
            isMelee,
            criticalMultiplier: 2,
          }),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao rolar ataque')
      }

      const result = await response.json()
      
      // Mostrar animação
      if (result.details?.rolls) {
        setAnimationResult({
          result: result.total,
          dice: result.details.rolls,
        })
        setShowAnimation(true)
      }

      const rollResult: DiceRollResult = {
        type: 'attack',
        ...result,
      }
      setLastResult(rollResult)

      return { success: true, result: rollResult }
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error }, 'Erro ao rolar ataque')
      toast.error('Erro ao rolar ataque', err.message || 'Tente novamente.')
      return { error: err.message || 'Erro desconhecido' }
    } finally {
      setRolling(false)
    }
  }

  return {
    rolling,
    lastResult,
    showAnimation,
    animationResult,
    setShowAnimation,
    setAnimationResult,
    rollFormula,
    rollSkillTest,
    rollAttack,
  }
}

