/**
 * Serviço principal para lógica de negócio de personagens
 * Delega funcionalidades específicas para módulos especializados
 */
import { supabase } from '../config/supabase'
import { ordemParanormalService } from './ordemParanormalService'
import { CharacterClass } from '../types/ordemParanormal'
import { logger } from '../utils/logger'
import { CreateCharacterData, UpdateCharacterData, CharacterFilters } from '../types/character'
import { AppError } from '../types/common'
import { getCache, setCache, deleteCache, deleteCachePattern, getCharacterCacheKey } from './cache'
import { characterInventoryService } from './character/characterInventoryService'
import { characterAbilitiesService } from './character/characterAbilitiesService'
import { characterClassAbilitiesService } from './character/characterClassAbilitiesService'
import { characterConditionsService } from './character/characterConditionsService'
import { characterResourcesService } from './character/characterResourcesService'
import { characterAttributesService } from './character/characterAttributesService'

/**
 * Serviço para lógica de negócio de personagens
 */
export const characterService = {
  /**
   * Obtém personagens baseado em filtros
   * @param filters - Filtros de busca (campaignId, userId)
   * @returns Lista de personagens
   */
  async getCharacters(filters: CharacterFilters) {
    try {
      // Tentar obter do cache primeiro
      const cacheKey = getCharacterCacheKey(filters)
      const cached = await getCache<unknown[]>(cacheKey)
      if (cached) {
        logger.debug({ cacheKey }, 'Cache hit para personagens')
        return cached
      }

      let query = supabase
        .from('characters')
        .select(
          `
          *,
          campaign:campaigns (
            id,
            name
          ),
          user:users (
            id,
            username,
            avatar_url
          )
        `
        )

      if (filters.campaignId) {
        query = query.eq('campaign_id', filters.campaignId)
      }

      if (filters.userId) {
        query = query.eq('user_id', filters.userId)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error

      const result = data || []

      // Armazenar no cache (TTL: 5 minutos)
      await setCache(cacheKey, result, 300)

      return result
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error }, 'Error fetching characters')
      throw new Error('Erro ao buscar personagens: ' + (err.message || 'Erro desconhecido'))
    }
  },

  /**
   * Cria um novo personagem com cálculos automáticos do sistema Ordem Paranormal
   * @param userId - ID do usuário criador
   * @param data - Dados do personagem
   * @returns Personagem criado
   */
  async createCharacter(userId: string, data: CreateCharacterData) {
    try {
      // Valores padrão para sistema Ordem Paranormal
      const attributes = data.attributes || {
        agi: 0,
        for: 0,
        int: 0,
        pre: 0,
        vig: 0,
      }

      const characterClass: CharacterClass = (data.class as CharacterClass) || 'COMBATENTE'
      const nex: number = typeof data.nex === 'number' ? data.nex : 5 // NEX inicial padrão

      // Extrair valores de atributos garantindo que sejam números
      const vig: number = typeof attributes.vig === 'number' ? attributes.vig : 0
      const pre: number = typeof attributes.pre === 'number' ? attributes.pre : 0
      const agi: number = typeof attributes.agi === 'number' ? attributes.agi : 0

      // Calcular recursos máximos baseado em classe e atributos
      const maxPV = ordemParanormalService.calculateMaxPV(characterClass, vig, nex)
      const maxSAN = ordemParanormalService.calculateMaxSAN(characterClass, nex)
      const maxPE = ordemParanormalService.calculateMaxPE(characterClass, pre, nex)
      const defense = ordemParanormalService.calculateDefense(agi)

      // Estrutura de stats no formato Ordem Paranormal
      const stats = data.stats || {
        pv: {
          current: maxPV,
          max: maxPV,
        },
        san: {
          current: maxSAN,
          max: maxSAN,
        },
        pe: {
          current: maxPE,
          max: maxPE,
        },
        nex: nex,
      }

      // Perícias iniciais (todas destreinadas por padrão)
      const skills = data.skills || {}

      const { data: character, error } = await supabase
        .from('characters')
        .insert({
          campaign_id: data.campaignId,
          user_id: userId,
          name: data.name,
          avatar_url: data.avatarUrl || null,
          class: characterClass,
          path: data.path || null,
          affinity: data.affinity || null,
          attributes: attributes,
          stats: stats,
          skills: skills,
          conditions: data.conditions || [],
          defense: defense,
          level: 1, // Mantido para compatibilidade
          xp: 0, // Mantido para compatibilidade
        })
        .select()
        .single()

      if (error) throw error

      // Conceder habilidades de classe iniciais
      try {
        await characterClassAbilitiesService.grantClassAbilities(
          character.id,
          characterClass,
          nex
        )
      } catch (abilityError) {
        // Log do erro mas não falha a criação do personagem
        logger.error(
          { error: abilityError, characterId: character.id },
          'Error granting class abilities during character creation'
        )
      }

      // Invalidar cache relacionado
      await deleteCachePattern('characters:*')
      if (data.campaignId) {
        await deleteCache(getCharacterCacheKey({ campaignId: data.campaignId }))
      }
      if (userId) {
        await deleteCache(getCharacterCacheKey({ userId }))
      }

      return character
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error }, 'Error creating character')
      throw new Error('Erro ao criar personagem: ' + (err.message || 'Erro desconhecido'))
    }
  },

  /**
   * Obtém personagem por ID com todos os relacionamentos
   * @param id - ID do personagem
   * @returns Personagem completo com inventário e habilidades
   */
  async getCharacterById(id: string) {
    try {
      // Tentar obter do cache primeiro
      const cacheKey = getCharacterCacheKey({ characterId: id })
      const cached = await getCache<unknown>(cacheKey)
      if (cached) {
        logger.debug({ cacheKey }, 'Cache hit para personagem')
        return cached
      }

      // Buscar personagem
      const { data: character, error: characterError } = await supabase
        .from('characters')
        .select(
          `
          *,
          campaign:campaigns (
            id,
            name,
            system_rpg
          ),
          user:users (
            id,
            username,
            avatar_url
          )
        `
        )
        .eq('id', id)
        .single()

      if (characterError) throw characterError

      // Buscar inventário e habilidades usando serviços especializados
      const [inventory, abilities] = await Promise.all([
        characterInventoryService.getCharacterInventory(id),
        characterAbilitiesService.getCharacterAbilities(id),
      ])

      const result = {
        ...character,
        inventory: inventory || [],
        abilities: abilities || [],
      }

      // Armazenar no cache (TTL: 5 minutos)
      await setCache(cacheKey, result, 300)

      return result
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error }, 'Error fetching character')
      throw new Error('Erro ao buscar personagem: ' + (err.message || 'Erro desconhecido'))
    }
  },

  /**
   * Atualiza um personagem com recálculo automático de recursos
   * @param id - ID do personagem
   * @param data - Dados para atualizar
   * @returns Personagem atualizado
   */
  async updateCharacter(id: string, data: UpdateCharacterData) {
    try {
      // Buscar personagem atual para cálculos
      const { data: currentCharacter, error: fetchError } = await supabase
        .from('characters')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      }

      // Atualizar campos básicos
      if (data.name !== undefined) updateData.name = data.name
      if (data.avatarUrl !== undefined) updateData.avatar_url = data.avatarUrl
      if (data.class !== undefined) updateData.class = data.class
      if (data.path !== undefined) updateData.path = data.path
      if (data.affinity !== undefined) updateData.affinity = data.affinity
      if (data.conditions !== undefined) updateData.conditions = data.conditions

      // Se atributos foram fornecidos, usar serviço especializado
      if (data.attributes !== undefined) {
        return await characterAttributesService.updateAttributes(id, data.attributes)
      }

      // Se skills foram fornecidos, usar serviço especializado
      if (data.skills !== undefined) {
        return await characterAttributesService.updateSkills(id, data.skills as any)
      }

      // Atualizar stats diretamente se fornecido
      if (data.stats !== undefined) {
        updateData.stats = data.stats
      }

      // Atualizar level e xp (mantido para compatibilidade)
      if (data.level !== undefined) updateData.level = data.level
      if (data.xp !== undefined) updateData.xp = data.xp

      const { data: character, error } = await supabase
        .from('characters')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // Invalidar cache relacionado
      await deleteCache(getCharacterCacheKey({ characterId: id }))
      await deleteCachePattern('characters:*')
      if (character.campaign_id) {
        await deleteCache(getCharacterCacheKey({ campaignId: character.campaign_id }))
      }
      if (character.user_id) {
        await deleteCache(getCharacterCacheKey({ userId: character.user_id }))
      }

      return character
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error }, 'Error updating character')
      throw new Error('Erro ao atualizar personagem: ' + (err.message || 'Erro desconhecido'))
    }
  },

  /**
   * Deleta um personagem
   * @param id - ID do personagem
   */
  async deleteCharacter(id: string) {
    try {
      // Buscar personagem antes de deletar para invalidar cache
      const { data: character } = await supabase
        .from('characters')
        .select('campaign_id, user_id')
        .eq('id', id)
        .single()

      const { error } = await supabase.from('characters').delete().eq('id', id)

      if (error) throw error

      // Invalidar cache relacionado
      await deleteCache(getCharacterCacheKey({ characterId: id }))
      await deleteCachePattern('characters:*')
      if (character?.campaign_id) {
        await deleteCache(getCharacterCacheKey({ campaignId: character.campaign_id }))
      }
      if (character?.user_id) {
        await deleteCache(getCharacterCacheKey({ userId: character.user_id }))
      }
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error }, 'Error deleting character')
      throw new Error('Erro ao deletar personagem: ' + (err.message || 'Erro desconhecido'))
    }
  },

  // Delegar métodos para serviços especializados
  // Inventário
  getCharacterInventory: characterInventoryService.getCharacterInventory,
  addItemToCharacter: characterInventoryService.addItemToCharacter,
  removeItemFromCharacter: characterInventoryService.removeItemFromCharacter,
  equipItem: characterInventoryService.equipItem,

  // Habilidades
  getCharacterAbilities: characterAbilitiesService.getCharacterAbilities,
  addAbilityToCharacter: characterAbilitiesService.addAbilityToCharacter,
  removeAbilityFromCharacter: characterAbilitiesService.removeAbilityFromCharacter,

  // Habilidades de classe
  getUnlockedClassAbilities: characterClassAbilitiesService.getUnlockedClassAbilities,
  getNewlyUnlockedClassAbilities: characterClassAbilitiesService.getNewlyUnlockedClassAbilities,

  // Condições
  applyCondition: characterConditionsService.applyCondition,
  removeCondition: characterConditionsService.removeCondition,

  // Recursos
  updateNEX: characterResourcesService.updateNEX,
  updatePV: characterResourcesService.updatePV,
  updateSAN: characterResourcesService.updateSAN,
  updatePE: characterResourcesService.updatePE,
  applyDamage: characterResourcesService.applyDamage,
  recoverPE: characterResourcesService.recoverPE,

  // Atributos e Perícias
  updateAttributes: characterAttributesService.updateAttributes,
  updateSkills: characterAttributesService.updateSkills,
  rollSkillTest: characterAttributesService.rollSkillTest,
  rollAttack: characterAttributesService.rollAttack,
}
