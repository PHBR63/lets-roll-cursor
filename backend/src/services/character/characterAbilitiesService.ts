/**
 * Serviço para gerenciamento de habilidades de personagens
 */
import { supabase } from '../../config/supabase'
import { logger } from '../../utils/logger'
import { AppError } from '../../types/common'

export const characterAbilitiesService = {
  /**
   * Obtém habilidades do personagem
   * @param characterId - ID do personagem
   * @returns Lista de habilidades
   */
  async getCharacterAbilities(characterId: string) {
    try {
      const { data, error } = await supabase
        .from('character_abilities')
        .select(
          `
          *,
          ability:abilities (
            id,
            name,
            description,
            type,
            cost,
            attributes
          )
        `
        )
        .eq('character_id', characterId)

      if (error) throw error

      return data || []
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error }, 'Error fetching character abilities')
      throw new Error('Erro ao buscar habilidades: ' + (err.message || 'Erro desconhecido'))
    }
  },

  /**
   * Adiciona habilidade ao personagem
   * @param characterId - ID do personagem
   * @param abilityId - ID da habilidade
   * @returns Habilidade adicionada
   */
  async addAbilityToCharacter(characterId: string, abilityId: string) {
    try {
      const { data, error } = await supabase
        .from('character_abilities')
        .insert({
          character_id: characterId,
          ability_id: abilityId,
        })
        .select()
        .single()

      if (error) {
        // Se já existe (erro de chave duplicada 23505), buscar o existente
        if (error.code === '23505') {
          const { data: existing, error: existingError } = await supabase
            .from('character_abilities')
            .select('*')
            .eq('character_id', characterId)
            .eq('ability_id', abilityId)
            .single()

          if (existingError) {
            throw new Error('Erro ao buscar habilidade existente: ' + existingError.message)
          }

          if (!existing) {
            throw new Error('Habilidade não encontrada após erro de duplicação')
          }

          return existing
        }
        throw error
      }

      return data
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error }, 'Error adding ability to character')
      throw new Error('Erro ao adicionar habilidade: ' + (err.message || 'Erro desconhecido'))
    }
  },

  /**
   * Remove habilidade do personagem
   * @param characterId - ID do personagem
   * @param abilityId - ID da habilidade
   */
  async removeAbilityFromCharacter(characterId: string, abilityId: string) {
    try {
      const { error } = await supabase
        .from('character_abilities')
        .delete()
        .eq('character_id', characterId)
        .eq('ability_id', abilityId)

      if (error) throw error
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error }, 'Error removing ability from character')
      throw new Error('Erro ao remover habilidade: ' + (err.message || 'Erro desconhecido'))
    }
  },
}

