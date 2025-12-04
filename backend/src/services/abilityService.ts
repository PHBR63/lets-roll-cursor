import { supabase } from '../config/supabase'
import { logger } from '../utils/logger'
import { CreateAbilityData, UpdateAbilityData } from '../types/ability'
import { AppError } from '../types/common'

/**
 * Serviço para lógica de negócio de habilidades
 */
export const abilityService = {
  /**
   * Obtém habilidades baseado em filtros
   * @param filters - Filtros de busca (campaignId, isGlobal)
   * @returns Lista de habilidades
   */
  async getAbilities(filters: { campaignId?: string; isGlobal?: boolean; limit?: number; offset?: number }) {
    try {
      let query = supabase
        .from('abilities')
        .select(
          `
          *,
          campaign:campaigns (
            id,
            name
          ),
          created_by_user:users!abilities_created_by_fkey (
            id,
            username
          )
        `
        )

      if (filters.campaignId) {
        query = query.eq('campaign_id', filters.campaignId)
      }

      if (filters.isGlobal !== undefined) {
        query = query.eq('is_global', filters.isGlobal)
      }

      // Se não especificar, buscar habilidades globais e da campanha
      if (!filters.campaignId && filters.isGlobal === undefined) {
        query = query.or('is_global.eq.true,campaign_id.is.null')
      }

      // Aplicar paginação
      const limit = filters.limit || 20
      const offset = filters.offset || 0
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query.order('created_at', { ascending: false })

      if (error) throw error

      // Retornar resultado paginado
      return {
        data: data || [],
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      }
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error }, 'Error fetching abilities')
      throw new Error('Erro ao buscar habilidades: ' + (err.message || 'Erro desconhecido'))
    }
  },

  /**
   * Cria uma nova habilidade
   * @param userId - ID do usuário criador
   * @param data - Dados da habilidade
   * @returns Habilidade criada
   */
  async createAbility(userId: string, data: CreateAbilityData) {
    try {
      const { data: ability, error } = await supabase
        .from('abilities')
        .insert({
          campaign_id: data.campaignId || null,
          created_by: userId,
          name: data.name,
          description: data.description || null,
          type: data.type || null,
          cost: data.cost || {},
          attributes: data.attributes || {},
          is_global: data.isGlobal || false,
        })
        .select()
        .single()

      if (error) throw error

      return ability
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error }, 'Error creating ability')
      throw new Error('Erro ao criar habilidade: ' + (err.message || 'Erro desconhecido'))
    }
  },

  /**
   * Obtém habilidade por ID
   * @param id - ID da habilidade
   * @returns Habilidade completa
   */
  async getAbilityById(id: string) {
    try {
      const { data: ability, error } = await supabase
        .from('abilities')
        .select(
          `
          *,
          campaign:campaigns (
            id,
            name,
            system_rpg
          ),
          created_by_user:users!abilities_created_by_fkey (
            id,
            username,
            avatar_url
          )
        `
        )
        .eq('id', id)
        .single()

      if (error) throw error

      return ability
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error }, 'Error fetching ability')
      throw new Error('Erro ao buscar habilidade: ' + (err.message || 'Erro desconhecido'))
    }
  },

  /**
   * Atualiza uma habilidade
   * @param id - ID da habilidade
   * @param data - Dados para atualizar
   * @returns Habilidade atualizada
   */
  async updateAbility(id: string, data: UpdateAbilityData) {
    try {
      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      }

      if (data.name !== undefined) updateData.name = data.name
      if (data.description !== undefined) updateData.description = data.description
      if (data.type !== undefined) updateData.type = data.type
      if (data.cost !== undefined) updateData.cost = data.cost
      if (data.attributes !== undefined) updateData.attributes = data.attributes
      if (data.isGlobal !== undefined) updateData.is_global = data.isGlobal

      const { data: ability, error } = await supabase
        .from('abilities')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return ability
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error }, 'Error updating ability')
      throw new Error('Erro ao atualizar habilidade: ' + (err.message || 'Erro desconhecido'))
    }
  },

  /**
   * Deleta uma habilidade
   * @param id - ID da habilidade
   */
  async deleteAbility(id: string) {
    try {
      const { error } = await supabase.from('abilities').delete().eq('id', id)

      if (error) throw error
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error }, 'Error deleting ability')
      throw new Error('Erro ao deletar habilidade: ' + (err.message || 'Erro desconhecido'))
    }
  },

  /**
   * Obtém habilidades de uma campanha específica
   * @param campaignId - ID da campanha
   * @returns Lista de habilidades da campanha
   */
  async getCampaignAbilities(campaignId: string) {
    try {
      const { data, error } = await supabase
        .from('abilities')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error }, 'Error fetching campaign abilities')
      throw new Error('Erro ao buscar habilidades da campanha: ' + (err.message || 'Erro desconhecido'))
    }
  },

  /**
   * Atribui habilidade a um personagem
   * @param characterId - ID do personagem
   * @param abilityId - ID da habilidade
   * @returns Habilidade atribuída
   */
  async assignAbilityToCharacter(characterId: string, abilityId: string) {
    try {
      // Verificar se habilidade existe
      const { data: ability, error: abilityError } = await supabase
        .from('abilities')
        .select('*')
        .eq('id', abilityId)
        .single()

      if (abilityError) throw abilityError

      // Adicionar habilidade ao personagem
      const { characterService } = await import('./characterService')
      return await characterService.addAbilityToCharacter(characterId, abilityId)
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error }, 'Error assigning ability to character')
      throw new Error('Erro ao atribuir habilidade: ' + (err.message || 'Erro desconhecido'))
    }
  },
}

