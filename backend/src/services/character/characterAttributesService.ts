/**
 * Serviço para gerenciamento de atributos e perícias de personagens
 */
import { supabase } from '../../config/supabase'
import { logger } from '../../utils/logger'
import { AppError } from '../../types/common'
import { Condition, skillRequiresKit, SKILL_KIT_REQUIREMENTS, SkillTraining } from '../../types/ordemParanormal'
import { ordemParanormalService } from '../ordemParanormalService'
import { deleteCache, getCharacterCacheKey } from '../cache'
import { characterInventoryService } from './characterInventoryService'

export const characterAttributesService = {
  /**
   * Atualiza atributos do personagem e recalcula recursos automaticamente
   * @param id - ID do personagem
   * @param attributes - Novos valores de atributos
   * @returns Personagem atualizado
   */
  async updateAttributes(id: string, attributes: Record<string, number>) {
    try {
      const { data: character, error: fetchError } = await supabase
        .from('characters')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      const characterClass = character.class || 'COMBATENTE'
      const stats = character.stats || {}
      const nex = stats.nex || 5

      // Recalcular recursos máximos
      const maxPV = ordemParanormalService.calculateMaxPV(
        characterClass,
        attributes.vig || 0,
        nex
      )
      const maxSAN = ordemParanormalService.calculateMaxSAN(characterClass, nex)
      const maxPE = ordemParanormalService.calculateMaxPE(
        characterClass,
        attributes.pre || 0,
        nex
      )
      const defense = ordemParanormalService.calculateDefense(attributes.agi || 0)

      // Atualizar stats mantendo valores atuais se não excederem máximo
      const updatedStats = {
        ...stats,
        pv: {
          current: Math.min(stats.pv?.current || maxPV, maxPV),
          max: maxPV,
        },
        san: {
          current: Math.min(stats.san?.current || maxSAN, maxSAN),
          max: maxSAN,
        },
        pe: {
          current: Math.min(stats.pe?.current || maxPE, maxPE),
          max: maxPE,
        },
        nex: nex,
      }

      const { data, error } = await supabase
        .from('characters')
        .update({
          attributes,
          stats: updatedStats,
          defense,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // Invalidar cache
      await deleteCache(getCharacterCacheKey({ characterId: id }))

      return data
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error }, 'Error updating attributes')
      throw new Error('Erro ao atualizar atributos: ' + (err.message || 'Erro desconhecido'))
    }
  },

  /**
   * Atualiza perícias do personagem
   * @param id - ID do personagem
   * @param skills - Objeto com perícias atualizadas
   * @returns Personagem atualizado
   */
  async updateSkills(id: string, skills: Record<string, { training: string; bonus?: number }>) {
    try {
      // Buscar personagem para obter NEX
      const { data: character, error: fetchError } = await supabase
        .from('characters')
        .select('stats')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      const stats = character.stats || {}
      const nex = stats.nex || 5

      // Validar cada perícia antes de atualizar
      for (const [skillName, skillData] of Object.entries(skills)) {
        const training = skillData.training as SkillTraining
        if (!ordemParanormalService.canUseSkillTraining(training, nex)) {
          throw new Error(
            `Nível de treinamento ${training} não é permitido para NEX ${nex}%. ` +
            `COMPETENT requer NEX >= 35% e EXPERT requer NEX >= 70%.`
          )
        }
      }

      // Recalcular bônus de todas as perícias
      const updatedSkills: Record<string, { training: string; bonus: number }> = {}
      for (const [skillName, skillData] of Object.entries(skills)) {
        updatedSkills[skillName] = {
          ...skillData,
          bonus: ordemParanormalService.calculateSkillBonus(skillData.training as any),
        }
      }

      const { data, error } = await supabase
        .from('characters')
        .update({
          skills: updatedSkills,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // Invalidar cache
      await deleteCache(getCharacterCacheKey({ characterId: id }))

      return data
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error }, 'Error updating skills')
      throw new Error('Erro ao atualizar perícias: ' + (err.message || 'Erro desconhecido'))
    }
  },

  /**
   * Rola teste de perícia para o personagem
   * @param id - ID do personagem
   * @param skillName - Nome da perícia
   * @param difficulty - Dificuldade do teste (DT)
   * @param advantageDice - Bônus/penalidade de dados (+1d20 ou -1d20)
   * @returns Resultado da rolagem
   */
  async rollSkillTest(id: string, skillName: string, difficulty: number = 15, advantageDice: number = 0) {
    try {
      const { data: character, error: fetchError } = await supabase
        .from('characters')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      const attributes = character.attributes || {}
      const skills = character.skills || {}
      const conditions: Condition[] = character.conditions || []

      // Buscar perícia
      const skill = skills[skillName]
      if (!skill) {
        throw new Error(`Perícia ${skillName} não encontrada`)
      }

      // Obter valor do atributo base
      const attributeMap: { [key: string]: string } = {
        AGI: 'agi',
        FOR: 'for',
        INT: 'int',
        PRE: 'pre',
        VIG: 'vig',
      }

      const attributeKey = attributeMap[skill.attribute]
      if (!attributeKey) {
        throw new Error(`Atributo ${skill.attribute} não encontrado`)
      }
      const attributeValue = (attributes[attributeKey as keyof typeof attributes] as number) || 0

      // Calcular penalidades de condições
      const penalties = ordemParanormalService.calculateConditionPenalties(conditions)
      const skillPenalty = penalties.skillPenalties[skillName] || 0
      const attributePenalty =
        (penalties.attributePenalties[attributeKey as keyof typeof penalties.attributePenalties] as number) || 0

      // Verificar se perícia requer kit e se personagem possui
      let kitPenalty = 0
      let hasRequiredKit = true
      if (skillRequiresKit(skillName)) {
        const requiredKits = SKILL_KIT_REQUIREMENTS[skillName] || []
        const inventory = await characterInventoryService.getCharacterInventory(id)
        
        // Verificar se possui algum dos kits necessários
        hasRequiredKit = requiredKits.some(kitName => {
          return inventory.some(
            (item: any) =>
              item.item?.name?.toLowerCase().includes(kitName.toLowerCase()) ||
              item.item?.name?.toLowerCase().includes('kit')
          )
        })

        // Aplicar penalidade de -5 se não tiver kit
        if (!hasRequiredKit) {
          kitPenalty = -5
        }
      }

      // Aplicar penalidade em dados (se houver)
      const effectiveAttribute = attributeValue + attributePenalty

      // Rolar teste (incluindo penalidade de kit e vantagem/desvantagem)
      const rollResult = ordemParanormalService.rollAttributeTest(
        effectiveAttribute,
        skill.bonus + skillPenalty + kitPenalty,
        advantageDice
      )

      const success = rollResult.total >= difficulty

      return {
        ...rollResult,
        skillName,
        skillBonus: skill.bonus,
        attributeValue,
        difficulty,
        success,
        penalties: {
          skillPenalty,
          attributePenalty,
          kitPenalty,
        },
        hasRequiredKit,
      }
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error }, 'Error rolling skill test')
      throw new Error('Erro ao rolar teste de perícia: ' + (err.message || 'Erro desconhecido'))
    }
  },

  /**
   * Rola ataque do personagem
   * @param id - ID do personagem
   * @param skillName - Nome da perícia de ataque (Luta ou Pontaria)
   * @param targetDefense - Defesa do alvo
   * @param threatRange - Margem de Ameaça para crítico (padrão: 20)
   * @param advantageDice - Bônus/penalidade de dados (+1d20 ou -1d20)
   * @returns Resultado do ataque
   */
  async rollAttack(
    id: string, 
    skillName: string, 
    targetDefense: number,
    threatRange: number = 20,
    advantageDice: number = 0
  ) {
    try {
      const { data: character, error: fetchError } = await supabase
        .from('characters')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      const attributes = character.attributes || {}
      const skills = character.skills || {}
      const conditions: Condition[] = character.conditions || []

      // Buscar perícia
      const skill = skills[skillName]
      if (!skill) {
        throw new Error(`Perícia ${skillName} não encontrada`)
      }

      // Obter valor do atributo base
      const attributeMap: { [key: string]: string } = {
        AGI: 'agi',
        FOR: 'for',
        INT: 'int',
        PRE: 'pre',
        VIG: 'vig',
      }

      const attributeKey = attributeMap[skill.attribute]
      if (!attributeKey) {
        throw new Error(`Atributo ${skill.attribute} não encontrado`)
      }
      const attributeValue = (attributes[attributeKey as keyof typeof attributes] as number) || 0

      // Calcular penalidades de condições
      const penalties = ordemParanormalService.calculateConditionPenalties(conditions)
      const skillPenalty = penalties.skillPenalties[skillName] || 0
      const attributePenalty =
        (penalties.attributePenalties[attributeKey as keyof typeof penalties.attributePenalties] as number) || 0

      const effectiveAttribute = attributeValue + attributePenalty

      // Rolar ataque
      const attackResult = ordemParanormalService.rollAttack(
        effectiveAttribute,
        skill.bonus + skillPenalty,
        targetDefense,
        threatRange,
        advantageDice
      )

      return {
        ...attackResult,
        skillName,
        skillBonus: skill.bonus,
        attributeValue,
        penalties: {
          skillPenalty,
          attributePenalty,
        },
      }
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error }, 'Error rolling attack')
      throw new Error('Erro ao rolar ataque: ' + (err.message || 'Erro desconhecido'))
    }
  },

  /**
   * Rola teste de resistência do personagem
   * @param id - ID do personagem
   * @param resistanceType - Tipo de resistência: 'Fortitude' (VIG), 'Reflexos' (AGI) ou 'Vontade' (PRE)
   * @param difficulty - Dificuldade do teste (DT)
   * @param advantageDice - Bônus/penalidade de dados (+1d20 ou -1d20)
   * @returns Resultado do teste de resistência
   */
  async rollResistance(
    id: string,
    resistanceType: 'Fortitude' | 'Reflexos' | 'Vontade',
    difficulty: number,
    advantageDice: number = 0
  ) {
    try {
      const { data: character, error: fetchError } = await supabase
        .from('characters')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      const attributes = character.attributes || {}

      // Mapear tipo de resistência para atributo
      const resistanceMap: { [key: string]: keyof typeof attributes } = {
        Fortitude: 'vig', // VIG
        Reflexos: 'agi', // AGI
        Vontade: 'pre', // PRE
      }

      const attributeKey = resistanceMap[resistanceType]
      if (!attributeKey) {
        throw new Error(`Tipo de resistência ${resistanceType} inválido`)
      }

      const attributeValue = (attributes[attributeKey] as number) || 0

      // Calcular penalidades de condições
      const conditions: Condition[] = character.conditions || []
      const penalties = ordemParanormalService.calculateConditionPenalties(conditions)
      const attributePenalty =
        (penalties.attributePenalties[attributeKey as keyof typeof penalties.attributePenalties] as number) || 0

      const effectiveAttribute = attributeValue + attributePenalty

      // Rolar teste de resistência (sem bônus de perícia)
      const resistanceResult = ordemParanormalService.rollResistance(
        effectiveAttribute,
        difficulty,
        advantageDice
      )

      return {
        ...resistanceResult,
        resistanceType,
        attributeValue,
        penalties: {
          attributePenalty,
        },
      }
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error }, 'Error rolling resistance')
      throw new Error('Erro ao rolar teste de resistência: ' + (err.message || 'Erro desconhecido'))
    }
  },
}

