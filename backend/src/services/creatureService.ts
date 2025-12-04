import { supabase } from '../config/supabase'
import { logger } from '../utils/logger'
import { CreateCreatureData, UpdateCreatureData } from '../types/creature'
import { AppError } from '../types/common'
import { getCache, setCache, deleteCache, deleteCachePattern, getCreatureCacheKey } from './cache'

/**
 * Serviço para lógica de negócio de criaturas
 */
export const creatureService = {
  /**
   * Obtém criaturas baseado em filtros
   * @param filters - Filtros de busca (campaignId, isGlobal)
   * @returns Lista de criaturas
   */
  async getCreatures(filters: { campaignId?: string; isGlobal?: boolean; limit?: number; offset?: number }) {
    try {
      // Tentar obter do cache primeiro (apenas se não houver paginação ou offset 0)
      if ((!filters.offset || filters.offset === 0) && (!filters.limit || filters.limit === 20)) {
        const cacheKey = getCreatureCacheKey(filters)
        const cached = await getCache<unknown>(cacheKey)
        if (cached) {
          logger.debug({ cacheKey }, 'Cache hit para criaturas')
          return cached as { data: unknown[]; total: number; limit: number; offset: number; hasMore: boolean }
        }
      }

      let query = supabase
        .from('creatures')
        .select(
          `
          *,
          campaign:campaigns (
            id,
            name
          ),
          created_by_user:users!creatures_created_by_fkey (
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

      // Se não especificar, buscar criaturas globais e da campanha
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
      logger.error({ error }, 'Error fetching creatures')
      throw new Error('Erro ao buscar criaturas: ' + (err.message || 'Erro desconhecido'))
    }
  },

  /**
   * Cria uma nova criatura/NPC
   * @param userId - ID do usuário criador
   * @param data - Dados da criatura
   * @returns Criatura criada
   */
  async createCreature(userId: string, data: CreateCreatureData) {
    try {
      const { data: creature, error } = await supabase
        .from('creatures')
        .insert({
          campaign_id: data.campaignId || null,
          created_by: userId,
          name: data.name,
          type: data.type || null,
          description: data.description || null,
          attributes: data.attributes || {},
          stats: data.stats || {
            vida: { current: 10, max: 10 },
            energia: { current: 10, max: 10 },
            saude: { current: 10, max: 10 },
          },
          is_global: data.isGlobal || false,
        })
        .select()
        .single()

      if (error) throw error

      return creature
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error }, 'Error creating creature')
      throw new Error('Erro ao criar criatura: ' + (err.message || 'Erro desconhecido'))
    }
  },

  /**
   * Obtém criatura por ID
   * @param id - ID da criatura
   * @returns Criatura completa
   */
  async getCreatureById(id: string) {
    try {
      const { data: creature, error } = await supabase
        .from('creatures')
        .select(
          `
          *,
          campaign:campaigns (
            id,
            name,
            system_rpg
          ),
          created_by_user:users!creatures_created_by_fkey (
            id,
            username,
            avatar_url
          )
        `
        )
        .eq('id', id)
        .single()

      if (error) throw error

      return creature
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error }, 'Error fetching creature')
      throw new Error('Erro ao buscar criatura: ' + (err.message || 'Erro desconhecido'))
    }
  },

  /**
   * Atualiza uma criatura
   * @param id - ID da criatura
   * @param data - Dados para atualizar
   * @returns Criatura atualizada
   */
  async updateCreature(id: string, data: UpdateCreatureData) {
    try {
      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      }

      if (data.name !== undefined) updateData.name = data.name
      if (data.type !== undefined) updateData.type = data.type
      if (data.description !== undefined) updateData.description = data.description
      if (data.attributes !== undefined) updateData.attributes = data.attributes
      if (data.stats !== undefined) updateData.stats = data.stats
      if (data.isGlobal !== undefined) updateData.is_global = data.isGlobal

      const { data: creature, error } = await supabase
        .from('creatures')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // Invalidar cache relacionado
      await deleteCache(getCreatureCacheKey({ creatureId: id }))
      await deleteCachePattern('creatures:*')
      if (creature.campaign_id) {
        await deleteCache(getCreatureCacheKey({ campaignId: creature.campaign_id }))
      }

      return creature
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error }, 'Error updating creature')
      throw new Error('Erro ao atualizar criatura: ' + (err.message || 'Erro desconhecido'))
    }
  },

  /**
   * Deleta uma criatura
   * @param id - ID da criatura
   */
  async deleteCreature(id: string) {
    try {
      // Buscar criatura antes de deletar para invalidar cache
      const { data: creature } = await supabase
        .from('creatures')
        .select('campaign_id')
        .eq('id', id)
        .single()

      const { error } = await supabase.from('creatures').delete().eq('id', id)

      if (error) throw error
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error }, 'Error deleting creature')
      throw new Error('Erro ao deletar criatura: ' + (err.message || 'Erro desconhecido'))
    }
  },

  /**
   * Obtém criaturas de uma campanha específica
   * @param campaignId - ID da campanha
   * @returns Lista de criaturas da campanha
   */
  async getCampaignCreatures(campaignId: string) {
    try {
      const { data, error } = await supabase
        .from('creatures')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error }, 'Error fetching campaign creatures')
      throw new Error('Erro ao buscar criaturas da campanha: ' + (err.message || 'Erro desconhecido'))
    }
  },
}

