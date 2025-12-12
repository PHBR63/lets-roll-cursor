/**
 * Serviço principal para lógica de negócio de personagens
 * Delega funcionalidades específicas para módulos especializados
 */
import { supabase } from '../config/supabase'
import { ordemParanormalService } from './ordemParanormalService'
import { CharacterClass, Attributes, SkillTraining } from '../types/ordemParanormal'
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
import { originService } from './originService'
import { Origin } from '../types/origin'

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
        agi: 1,
        for: 1,
        int: 1,
        pre: 1,
        vig: 1,
      }

      // Validação de atributos na criação (conforme regras oficiais)
      const agi: number = typeof attributes.agi === 'number' ? attributes.agi : 1
      const forAttr: number = typeof attributes.for === 'number' ? attributes.for : 1
      const int: number = typeof attributes.int === 'number' ? attributes.int : 1
      const pre: number = typeof attributes.pre === 'number' ? attributes.pre : 1
      const vig: number = typeof attributes.vig === 'number' ? attributes.vig : 1

      // Usar função centralizada do domínio para validar atributos
      const validatedAttributes: Attributes = {
        agi,
        for: forAttr,
        int,
        pre,
        vig,
      }
      ordemParanormalService.validateCreationAttributes(validatedAttributes)

      // Se campaignId for fornecido, validar que a campanha existe e o usuário participa
      if (data.campaignId) {
        const { data: campaign, error: campaignError } = await supabase
          .from('campaigns')
          .select('id')
          .eq('id', data.campaignId)
          .single()

        if (campaignError || !campaign) {
          throw new Error('Campanha não encontrada')
        }

        // Verificar se usuário participa da campanha
        const { data: participant, error: participantError } = await supabase
          .from('campaign_participants')
          .select('role')
          .eq('campaign_id', data.campaignId)
          .eq('user_id', userId)
          .single()

        if (participantError || !participant) {
          throw new Error('Você não participa desta campanha')
        }

        // Se for mestre, não pode criar personagem
        if (participant.role === 'master') {
          throw new Error('Mestres não podem criar personagens')
        }
      }

      const characterClass: CharacterClass = (data.class as CharacterClass) || 'COMBATENTE'
      // NEX pode vir de data.nex ou data.stats.nex
      const nex: number = typeof (data as any).nex === 'number'
        ? (data as any).nex
        : (typeof (data.stats as any)?.nex === 'number' ? (data.stats as any).nex : 5) // NEX inicial padrão

      // validatedAttributes já foi criado acima

      // Calcular recursos máximos baseado em classe e atributos
      const maxPV = ordemParanormalService.calculateMaxPV(characterClass, validatedAttributes.vig, nex)
      const maxSAN = ordemParanormalService.calculateMaxSAN(characterClass, nex)
      const maxPE = ordemParanormalService.calculateMaxPE(characterClass, validatedAttributes.pre, nex)
      const defense = ordemParanormalService.calculateDefense(validatedAttributes.agi)

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
      // Converter formato de skills se fornecido (value/trained -> attribute/training/bonus)
      let skills: Record<string, { attribute: string; training: string; bonus: number }> = {}

      if (data.skills) {
        // Validar perícias fornecidas conforme NEX
        for (const [skillName, skillData] of Object.entries(data.skills)) {
          let training: SkillTraining
          const skillDataAny = skillData as any

          if ('value' in skillDataAny && 'trained' in skillDataAny) {
            // Formato antigo: converter
            training = skillDataAny.trained ? 'TRAINED' : 'UNTRAINED'
          } else if ('training' in skillDataAny) {
            // Já está no formato novo
            training = skillDataAny.training as SkillTraining
          } else {
            training = 'UNTRAINED'
          }

          // Validar se o treinamento é permitido para o NEX
          if (!ordemParanormalService.canUseSkillTraining(training, nex)) {
            throw new Error(
              `Nível de treinamento ${training} não é permitido para NEX ${nex}% na criação. ` +
              `COMPETENT requer NEX >= 35% e EXPERT requer NEX >= 70%.`
            )
          }

          // Converter para formato novo
          if ('value' in skillDataAny && 'trained' in skillDataAny) {
            skills[skillName] = {
              attribute: 'INT', // Default, será ajustado pela origem se necessário
              training,
              bonus: skillDataAny.trained ? 5 : 0,
            }
          } else {
            // Já está no formato novo
            skills[skillName] = skillDataAny
          }
        }
      }

      // Aplicar origem se fornecida (adiciona perícias treinadas automaticamente)
      if (data.origin) {
        try {
          skills = originService.applyOriginSkills(data.origin as Origin, skills as any)
        } catch (originError) {
          logger.warn({ error: originError, origin: data.origin }, 'Error applying origin, continuing without origin skills')
        }
      }

      const { data: character, error } = await supabase
        .from('characters')
        .insert({
          campaign_id: data.campaignId || null, // Permite null para personagens standalone
          user_id: userId,
          name: data.name,
          avatar_url: data.avatarUrl || null,
          class: characterClass,
          origin: data.origin || null,
          path: data.path || null,
          affinity: data.affinity || null,
          narrative_concept: data.narrativeConcept || null,
          attributes: validatedAttributes,
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

      // Se origem foi alterada, aplicar/remover perícias automaticamente
      if (data.origin !== undefined) {
        const oldOrigin = (currentCharacter.origin as Origin) || null
        const newOrigin = data.origin as Origin | null

        // Se mudou de origem, remover perícias da origem anterior
        if (oldOrigin && oldOrigin !== newOrigin) {
          const skillsWithoutOldOrigin = originService.removeOriginSkills(
            oldOrigin,
            (currentCharacter.skills as any) || {}
          )
          updateData.skills = skillsWithoutOldOrigin
        }

        // Aplicar perícias da nova origem
        if (newOrigin) {
          const currentSkills = (updateData.skills as any) || (currentCharacter.skills as any) || {}
          updateData.skills = originService.applyOriginSkills(newOrigin, currentSkills)
        }

        updateData.origin = newOrigin
      }

      // Se atributos foram fornecidos, usar serviço especializado
      if (data.attributes !== undefined) {
        return await characterAttributesService.updateAttributes(id, data.attributes)
      }

      // Se skills foram fornecidos, usar serviço especializado
      if (data.skills !== undefined) {
        return await characterAttributesService.updateSkills(id, data.skills as any)
      }

      // Atualizar stats com recálculo se NEX mudar
      if (data.stats !== undefined) {
        let newStats = { ...(data.stats as any) }

        // Verifica se NEX existe e mudou
        const currentNex = (currentCharacter.stats as any)?.nex || 0
        const newNex = newStats.nex

        if (newNex !== undefined && newNex !== currentNex) {
          const characterClass = (data.class as CharacterClass) || (currentCharacter.class as CharacterClass) || 'COMBATENTE'

          // Se atributos estiverem sendo atualizados nesta mesma chamada, use-os. Senão, use os atuais.
          const attributes = data.attributes || (currentCharacter.attributes as any) || {}

          const vig = attributes.vig || 0
          const pre = attributes.pre || 0

          // Recalcular máximos
          const maxPV = ordemParanormalService.calculateMaxPV(characterClass, vig, newNex)
          const maxSAN = ordemParanormalService.calculateMaxSAN(characterClass, newNex)
          const maxPE = ordemParanormalService.calculateMaxPE(characterClass, pre, newNex)

          // Atualizar objeto stats preservando valores atuais ou o que veio no request, mas forçando o novo MAX
          newStats.pv = {
            current: Math.min((newStats.pv?.current ?? (currentCharacter.stats as any)?.pv?.current ?? maxPV), maxPV),
            max: maxPV
          }
          newStats.san = {
            current: Math.min((newStats.san?.current ?? (currentCharacter.stats as any)?.san?.current ?? maxSAN), maxSAN),
            max: maxSAN
          }
          newStats.pe = {
            current: Math.min((newStats.pe?.current ?? (currentCharacter.stats as any)?.pe?.current ?? maxPE), maxPE),
            max: maxPE
          }

          logger.info({ characterId: id, newNex, maxPV, maxSAN, maxPE }, 'Recalculated stats due to NEX update')
        }

        updateData.stats = newStats
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
  calculateLoad: characterInventoryService.calculateLoad,
  getMaxLoad: characterInventoryService.getMaxLoad,
  checkAndApplyOverload: characterInventoryService.checkAndApplyOverload,

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
  processTurn: characterConditionsService.processTurn,
  performMedicineCheck: characterConditionsService.performMedicineCheck,
  stopBleeding: characterConditionsService.stopBleeding,

  // Recursos
  updateNEX: characterResourcesService.updateNEX,
  updatePV: characterResourcesService.updatePV,
  updateSAN: characterResourcesService.updateSAN,
  updatePE: characterResourcesService.updatePE,
  spendPE: characterResourcesService.spendPE,
  applyDamage: characterResourcesService.applyDamage,
  recoverPE: characterResourcesService.recoverPE,

  // Atributos e Perícias
  updateAttributes: characterAttributesService.updateAttributes,
  updateSkills: characterAttributesService.updateSkills,
  rollSkillTest: characterAttributesService.rollSkillTest,
  rollAttack: characterAttributesService.rollAttack,
  rollResistance: characterAttributesService.rollResistance,
}
