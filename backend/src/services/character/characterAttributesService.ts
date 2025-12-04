/**
 * Serviço para gerenciamento de atributos e perícias de personagens
 */
import { supabase } from '../../config/supabase'
import { logger } from '../../utils/logger'
import { AppError } from '../../types/common'
import { Condition } from '../../types/ordemParanormal'
import { ordemParanormalService } from '../ordemParanormalService'
import { deleteCache, getCharacterCacheKey } from '../cache'

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
   * @returns Resultado da rolagem
   */
  async rollSkillTest(id: string, skillName: string, difficulty: number = 15) {
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

      // Aplicar penalidade em dados (se houver)
      const effectiveAttribute = attributeValue + attributePenalty

      // Rolar teste
      const rollResult = ordemParanormalService.rollAttributeTest(
        effectiveAttribute,
        skill.bonus + skillPenalty
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
        },
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
   * @returns Resultado do ataque
   */
  async rollAttack(id: string, skillName: string, targetDefense: number) {
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
        targetDefense
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
}

