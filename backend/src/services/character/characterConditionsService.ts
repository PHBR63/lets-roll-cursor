/**
 * Serviço para gerenciamento de condições de personagens
 */
import { supabase } from '../../config/supabase'
import { logger } from '../../utils/logger'
import { AppError } from '../../types/common'
import { Condition } from '../../types/ordemParanormal'
import { ordemParanormalService } from '../ordemParanormalService'

export const characterConditionsService = {
  /**
   * Aplica uma condição ao personagem
   * @param id - ID do personagem
   * @param condition - Condição a ser aplicada
   * @returns Personagem atualizado com condições
   */
  async applyCondition(id: string, condition: Condition) {
    try {
      const { data: character, error: fetchError } = await supabase
        .from('characters')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      const currentConditions: Condition[] = character.conditions || []

      // Usar serviço para aplicar condição (inclui lógica de condições derivadas)
      const { newConditions, effects } = ordemParanormalService.applyCondition(
        condition,
        currentConditions
      )

      const { data, error } = await supabase
        .from('characters')
        .update({
          conditions: newConditions,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return {
        character: data,
        effects,
      }
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error }, 'Error applying condition')
      throw new Error('Erro ao aplicar condição: ' + (err.message || 'Erro desconhecido'))
    }
  },

  /**
   * Remove uma condição do personagem
   * @param id - ID do personagem
   * @param condition - Condição a ser removida
   * @returns Personagem atualizado
   */
  async removeCondition(id: string, condition: Condition) {
    try {
      const { data: character, error: fetchError } = await supabase
        .from('characters')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      const currentConditions: Condition[] = character.conditions || []
      const newConditions = currentConditions.filter((c) => c !== condition)

      const { data, error } = await supabase
        .from('characters')
        .update({
          conditions: newConditions,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error }, 'Error removing condition')
      throw new Error('Erro ao remover condição: ' + (err.message || 'Erro desconhecido'))
    }
  },
}

