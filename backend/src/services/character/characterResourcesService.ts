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

      // Verificar estados de insanidade
      const insanityState = ordemParanormalService.getInsanityState(newSAN, maxSAN)
      const isInsane = ordemParanormalService.isInsane(newSAN)

      // Aplicar condições automáticas baseadas em SAN
      let conditions: Condition[] = [...(character.conditions || [])]

      // Remover condições de insanidade antigas que não se aplicam mais
      const oldInsanityConditions: Condition[] = ['PERTURBADO', 'ENLOUQUECENDO']
      conditions = conditions.filter(c => !oldInsanityConditions.includes(c))

      // Aplicar novas condições baseadas no estado atual
      for (const condition of insanityState.conditions) {
        if (!conditions.includes(condition)) {
          conditions.push(condition)
        }
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
        insanityState,
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
   * @param validateTurnLimit - Se deve validar limite de PE por turno (padrão: false)
   * @param peSpentThisTurn - PE já gasto no turno atual (para validação)
   * @returns Personagem atualizado
   */
  async updatePE(
    id: string,
    pe: number,
    isDelta: boolean = false,
    validateTurnLimit: boolean = false,
    peSpentThisTurn: number = 0
  ) {
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
      const nex = stats.nex || 5

      // Se está gastando PE (delta negativo) e deve validar limite
      if (validateTurnLimit && isDelta && pe < 0) {
        const peToSpend = Math.abs(pe)
        const peLimit = ordemParanormalService.getPELimitByNEX(nex)
        const totalPESpent = peSpentThisTurn + peToSpend

        if (totalPESpent > peLimit) {
          throw new Error(
            `Limite de PE por turno excedido. Você pode gastar até ${peLimit} PE por turno (NEX ${nex}%), mas tentou gastar ${totalPESpent} PE.`
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
   * @param peCost - Custo em PE a ser gasto
   * @param peSpentThisTurn - PE já gasto no turno atual (opcional)
   * @returns Personagem atualizado
   */
  async spendPE(id: string, peCost: number, peSpentThisTurn: number = 0) {
    if (peCost <= 0) {
      throw new Error('Custo de PE deve ser maior que zero')
    }

    return await this.updatePE(id, -peCost, true, true, peSpentThisTurn)
  },

  /**
   * Aplica dano ao personagem (físico ou mental) com RD
   * @param id - ID do personagem
   * @param damage - Quantidade de dano bruto
   * @param type - Tipo de dano ('physical' ou 'mental')
   * @param damageType - Tipo específico de dano para RD (ex: 'balistico', 'cortante', 'perfurante', 'geral')
   * @returns Personagem atualizado e breakdown do dano
   */
  async applyDamage(
    id: string,
    damage: number,
    type: 'physical' | 'mental' = 'physical',
    damageType: string = 'geral'
  ) {
    try {
      if (type === 'physical') {
        // Buscar personagem para obter resistências
        const { data: character, error: fetchError } = await supabase
          .from('characters')
          .select('resistances')
          .eq('id', id)
          .single()

        if (fetchError) throw fetchError

        const resistances = (character.resistances as Record<string, number>) || {}

        // Calcular dano com RD
        const damageBreakdown = ordemParanormalService.calculateDamageWithRD(
          { value: damage, type: damageType },
          resistances
        )

        // Aplicar dano final ao PV
        const result = await this.updatePV(id, -damageBreakdown.finalDamage, true)

        // Log do breakdown
        logger.info(
          {
            characterId: id,
            rawDamage: damageBreakdown.rawDamage,
            damageType: damageBreakdown.damageType,
            rd: damageBreakdown.rd,
            finalDamage: damageBreakdown.finalDamage,
          },
          'Dano aplicado com RD'
        )

        return {
          character: result,
          damageBreakdown,
        }
      } else {
        // Dano mental reduz SAN (sem RD)
        return {
          character: await this.updateSAN(id, -damage, true),
          damageBreakdown: {
            rawDamage: damage,
            damageType: 'mental',
            rd: 0,
            finalDamage: damage,
          },
        }
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

