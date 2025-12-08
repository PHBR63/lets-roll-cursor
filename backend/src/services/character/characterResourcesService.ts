/**
 * Serviço para gerenciamento de recursos de personagens (PV, SAN, PE, NEX)
 */
import { supabase } from '../../config/supabase'
import { logger } from '../../utils/logger'
import { AppError } from '../../types/common'
import { Condition } from '../../types/ordemParanormal'
import { ordemParanormalService } from '../ordemParanormalService'
import { deleteCache, getCharacterCacheKey } from '../cache'
import { characterClassAbilitiesService } from './characterClassAbilitiesService'

export const characterResourcesService = {
  /**
   * Atualiza NEX e recalcula recursos máximos
   * @param id - ID do personagem
   * @param nex - Novo valor de NEX (0-99)
   * @returns Personagem atualizado
   */
  async updateNEX(id: string, nex: number) {
    try {
      if (nex < 0 || nex > 99) {
        throw new Error('NEX deve estar entre 0 e 99')
      }

      const { data: character, error: fetchError } = await supabase
        .from('characters')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      const characterClass = character.class || 'COMBATENTE'
      const attributes = character.attributes || {}
      const stats = character.stats || {}

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
          stats: updatedStats,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // Conceder habilidades de classe automaticamente se NEX aumentou
      const oldNex = stats.nex || 5
      if (nex > oldNex) {
        try {
          await characterClassAbilitiesService.grantClassAbilities(
            id,
            characterClass,
            nex
          )
        } catch (abilityError) {
          // Log do erro mas não falha a atualização de NEX
          logger.error(
            { error: abilityError, characterId: id },
            'Error granting class abilities during NEX update'
          )
        }
      }

      // Invalidar cache
      await deleteCache(getCharacterCacheKey({ characterId: id }))

      return data
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error }, 'Error updating NEX')
      throw new Error('Erro ao atualizar NEX: ' + (err.message || 'Erro desconhecido'))
    }
  },

  /**
   * Atualiza PV do personagem com validações
   * @param id - ID do personagem
   * @param pv - Novo valor de PV (ou delta)
   * @param isDelta - Se pv é um delta (true) ou valor absoluto (false)
   * @returns Personagem atualizado
   */
  async updatePV(id: string, pv: number, isDelta: boolean = false) {
    try {
      const { data: character, error: fetchError } = await supabase
        .from('characters')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      const stats = character.stats || {}
      const currentPV = stats.pv?.current || 0
      const maxPV = stats.pv?.max || 0

      let newPV = isDelta ? currentPV + pv : pv
      newPV = Math.max(0, Math.min(newPV, maxPV)) // Clamp entre 0 e máximo

      // Verificar estados
      const isDying = ordemParanormalService.isDying(newPV)
      const isInjured = ordemParanormalService.isInjured(newPV, maxPV)

      // Aplicar condições automáticas
      let conditions: Condition[] = [...(character.conditions || [])]

      if (isDying && !conditions.includes('MORRENDO')) {
        const { newConditions } = ordemParanormalService.applyCondition('MORRENDO', conditions)
        conditions = newConditions
      } else if (!isDying && conditions.includes('MORRENDO')) {
        conditions = conditions.filter((c) => c !== 'MORRENDO' && c !== 'INCONSCIENTE')
      }

      const updatedStats = {
        ...stats,
        pv: {
          current: newPV,
          max: maxPV,
        },
      }

      const { data, error } = await supabase
        .from('characters')
        .update({
          stats: updatedStats,
          conditions,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // Invalidar cache
      await deleteCache(getCharacterCacheKey({ characterId: id }))

      return {
        character: data,
        isDying,
        isInjured,
      }
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error }, 'Error updating PV')
      throw new Error('Erro ao atualizar PV: ' + (err.message || 'Erro desconhecido'))
    }
  },

  /**
   * Atualiza SAN do personagem com validações
   * @param id - ID do personagem
   * @param san - Novo valor de SAN (ou delta)
   * @param isDelta - Se san é um delta (true) ou valor absoluto (false)
   * @returns Personagem atualizado
   */
  async updateSAN(id: string, san: number, isDelta: boolean = false) {
    try {
      const { data: character, error: fetchError } = await supabase
        .from('characters')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      const stats = character.stats || {}
      const currentSAN = stats.san?.current || 0
      const maxSAN = stats.san?.max || 0

      let newSAN = isDelta ? currentSAN + san : san
      newSAN = Math.max(0, Math.min(newSAN, maxSAN)) // Clamp entre 0 e máximo

      // Verificar estados
      const isInsane = ordemParanormalService.isInsane(newSAN)
      const isLowSAN = newSAN <= maxSAN * 0.25 // 25% ou menos

      // Aplicar condições automáticas baseadas em SAN
      let conditions: Condition[] = [...(character.conditions || [])]

      if (isInsane && !conditions.includes('ENLOUQUECENDO')) {
        conditions.push('ENLOUQUECENDO')
      } else if (isLowSAN && !conditions.includes('PERTURBADO') && !isInsane) {
        conditions.push('PERTURBADO')
      }

      const updatedStats = {
        ...stats,
        san: {
          current: newSAN,
          max: maxSAN,
        },
      }

      const { data, error } = await supabase
        .from('characters')
        .update({
          stats: updatedStats,
          conditions,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // Invalidar cache
      await deleteCache(getCharacterCacheKey({ characterId: id }))

      return {
        character: data,
        isInsane,
        isLowSAN,
      }
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error }, 'Error updating SAN')
      throw new Error('Erro ao atualizar SAN: ' + (err.message || 'Erro desconhecido'))
    }
  },

  /**
   * Atualiza PE do personagem
   * @param id - ID do personagem
   * @param pe - Novo valor de PE (ou delta)
   * @param isDelta - Se pe é um delta (true) ou valor absoluto (false)
   * @param validateTurnLimit - Se deve validar limite de PE por turno (padrão: false para ajustes manuais)
   * @returns Personagem atualizado
   */
  async updatePE(id: string, pe: number, isDelta: boolean = false, validateTurnLimit: boolean = false) {
    try {
      const { data: character, error: fetchError } = await supabase
        .from('characters')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      const stats = character.stats || {}
      const currentPE = stats.pe?.current || 0
      const maxPE = stats.pe?.max || 0
      const nex = stats.nex || 0

      // Se for um gasto de PE (delta negativo) e deve validar limite por turno
      if (validateTurnLimit && isDelta && pe < 0) {
        const peCost = Math.abs(pe)
        const isValid = ordemParanormalService.validatePETurnLimit(nex, peCost)
        if (!isValid) {
          const limit = ordemParanormalService.calculatePETurnLimit(nex)
          throw new Error(
            `Limite de PE por turno excedido. Você pode gastar no máximo ${limit} PE por turno (NEX ${nex}%).`
          )
        }
      }

      let newPE = isDelta ? currentPE + pe : pe
      newPE = Math.max(0, Math.min(newPE, maxPE)) // Clamp entre 0 e máximo

      const updatedStats = {
        ...stats,
        pe: {
          current: newPE,
          max: maxPE,
        },
      }

      const { data, error } = await supabase
        .from('characters')
        .update({
          stats: updatedStats,
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
      logger.error({ error }, 'Error updating PE')
      throw new Error('Erro ao atualizar PE: ' + (err.message || 'Erro desconhecido'))
    }
  },

  /**
   * Gasta PE do personagem com validação de limite por turno
   * @param id - ID do personagem
   * @param peCost - Custo de PE a ser gasto
   * @returns Personagem atualizado
   */
  async spendPE(id: string, peCost: number) {
    return this.updatePE(id, -peCost, true, true)
  },

  /**
   * Aplica dano ao personagem (físico ou mental)
   * @param id - ID do personagem
   * @param damage - Quantidade de dano
   * @param type - Tipo de dano ('physical' ou 'mental')
   * @returns Personagem atualizado
   */
  async applyDamage(id: string, damage: number, type: 'physical' | 'mental' = 'physical') {
    try {
      if (type === 'physical') {
        // Dano físico reduz PV
        return await this.updatePV(id, -damage, true)
      } else {
        // Dano mental reduz SAN
        return await this.updateSAN(id, -damage, true)
      }
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error }, 'Error applying damage')
      throw new Error('Erro ao aplicar dano: ' + (err.message || 'Erro desconhecido'))
    }
  },

  /**
   * Recupera PE do personagem (descanso)
   * @param id - ID do personagem
   * @returns Personagem atualizado
   */
  async recoverPE(id: string) {
    try {
      const { data: character, error: fetchError } = await supabase
        .from('characters')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      const stats = character.stats || {}
      const nex = stats.nex || 5

      // Calcular recuperação
      const recovery = ordemParanormalService.calculatePERecovery(nex)

      // Aplicar recuperação
      return await this.updatePE(id, recovery, true)
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error }, 'Error recovering PE')
      throw new Error('Erro ao recuperar PE: ' + (err.message || 'Erro desconhecido'))
    }
  },
}

