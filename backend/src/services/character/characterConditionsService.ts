/**
 * Serviço para gerenciamento de condições de personagens
 */
import { supabase } from '../../config/supabase'
import { logger } from '../../utils/logger'
import { AppError } from '../../types/common'
import { Condition } from '../../types/ordemParanormal'
import { ordemParanormalService } from '../ordemParanormalService'
import { characterResourcesService } from './characterResourcesService'
import { deleteCache, getCharacterCacheKey } from '../cache'

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

  /**
   * Processa turno do personagem aplicando efeitos automáticos de condições
   * @param id - ID do personagem
   * @returns Resumo das mudanças aplicadas
   */
  async processTurn(id: string) {
    try {
      const { data: character, error: fetchError } = await supabase
        .from('characters')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      const conditions: Condition[] = character.conditions || []
      const stats = character.stats || {}
      const attributes = character.attributes || {}
      const changes: string[] = []
      let updatedConditions = [...conditions]
      let updatedStats = { ...stats }
      let updatedTimers = (character.conditionTimers as Array<{ condition: string; duration: number }>) || []
      let isDead = false

      // Processar cada condição automática
      for (const condition of conditions) {
        switch (condition) {
          case 'SANGRANDO': {
            // Sangrando: rolar 1d6 e aplicar como dano verdadeiro (ignora RD)
            const bleedingDamage = Math.floor(Math.random() * 6) + 1
            const pv = updatedStats.pv || stats.pv || { current: 0, max: 0 }
            const newPV = Math.max(0, pv.current - bleedingDamage)
            
            updatedStats = {
              ...updatedStats,
              pv: {
                current: newPV,
                max: pv.max,
              },
            }

            changes.push(`Sangrando: ${bleedingDamage} de dano verdadeiro (PV: ${pv.current} → ${newPV})`)

            // Se PV chegou a 0, aplicar condição Morrendo
            if (newPV <= 0 && !updatedConditions.includes('MORRENDO')) {
              const { newConditions } = ordemParanormalService.applyCondition('MORRENDO', updatedConditions)
              updatedConditions = newConditions
              // Iniciar contador de rodadas de morte
              updatedTimers = updatedTimers.filter(t => t.condition !== 'MORRENDO')
              updatedTimers.push({ condition: 'MORRENDO', duration: 0 })
              changes.push('Personagem entrou em estado de Morrendo!')
            }
            break
          }

          case 'VULNERAVEL': {
            // Vulnerável: Defesa reduzida em 2 (já aplicado nas penalidades)
            // Apenas registrar que a condição está ativa
            if (!changes.some(c => c.includes('Vulnerável'))) {
              changes.push('Vulnerável: Defesa reduzida em 2')
            }
            break
          }

          case 'MORRENDO': {
            // Morrendo: incrementar contador de rodadas de morte (3 turnos iniciados -> morte)
            const dyingTimer = updatedTimers.find(t => t.condition === 'MORRENDO')
            let dyingRounds = dyingTimer?.duration || 0

            // Incrementar contador
            dyingRounds++

            if (dyingRounds >= 3) {
              // Após 3 rodadas, personagem morre
              updatedConditions = updatedConditions.filter(c => c !== 'MORRENDO' && c !== 'INCONSCIENTE' && c !== 'SANGRANDO')
              updatedConditions.push('MORTO' as Condition)
              changes.push(`Morrendo: 3 rodadas completadas. Personagem morreu.`)
              
              // Remover timer
              updatedTimers = updatedTimers.filter(t => t.condition !== 'MORRENDO')
              isDead = true
            } else {
              // Atualizar contador
              updatedTimers = updatedTimers.filter(t => t.condition !== 'MORRENDO')
              updatedTimers.push({ condition: 'MORRENDO', duration: dyingRounds })
              
              changes.push(`Morrendo: Rodada ${dyingRounds}/3. Personagem precisa ser curado urgentemente!`)
            }
            break
          }

          case 'INCONSCIENTE': {
            // Inconsciente: bloquear ações (já aplicado nas penalidades)
            if (!changes.some(c => c.includes('Inconsciente'))) {
              changes.push('Inconsciente: Personagem não pode realizar ações')
            }
            break
          }

          case 'PERTURBADO':
          case 'ENLOUQUECENDO': {
            // Estados de insanidade: incrementar contador de turnos
            const san = updatedStats.san || stats.san || { current: 0, max: 0 }
            const isInsane = san.current <= 0 || (san.current / san.max) <= 0.25
            
            if (isInsane) {
              // Buscar ou criar timer de insanidade
              const insanityTimer = updatedTimers.find(t => t.condition === 'INSANIDADE')
              let insanityTurns = insanityTimer?.duration || 0
              
              // Incrementar contador
              insanityTurns++
              
              // Atualizar timer
              updatedTimers = updatedTimers.filter(t => t.condition !== 'INSANIDADE')
              updatedTimers.push({ condition: 'INSANIDADE', duration: insanityTurns })
              
              if (insanityTurns === 1) {
                changes.push('Insanidade: Contador de turnos iniciado')
              } else if (insanityTurns >= 10) {
                changes.push(`Insanidade: ${insanityTurns} turnos! Estado crítico - risco de consequências permanentes`)
              } else if (insanityTurns >= 5) {
                changes.push(`Insanidade: ${insanityTurns} turnos - atenção!`)
              } else {
                changes.push(`Insanidade: ${insanityTurns} turno(s) em estado de insanidade`)
              }
            }
            break
          }
        }
      }

      // Atualizar personagem se houver mudanças
      if (changes.length > 0 || JSON.stringify(updatedStats) !== JSON.stringify(stats) || isDead) {
        const { data, error } = await supabase
          .from('characters')
          .update({
            conditions: updatedConditions,
            stats: updatedStats,
            conditionTimers: updatedTimers,
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
          changes,
          isDead,
        }
      }

      return {
        character,
        changes: ['Nenhuma mudança aplicada neste turno'],
        isDead: false,
      }
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error, characterId: id }, 'Error processing turn')
      throw new Error('Erro ao processar turno: ' + (err.message || 'Erro desconhecido'))
    }
  },

  /**
   * Tenta estancar sangramento (teste de Vigor DT 20)
   * @param id - ID do personagem
   * @returns Resultado do teste
   */
  async stopBleeding(id: string) {
    try {
      const { data: character, error: fetchError } = await supabase
        .from('characters')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      const conditions: Condition[] = character.conditions || []
      if (!conditions.includes('SANGRANDO')) {
        throw new Error('Personagem não está sangrando')
      }

      const attributes = character.attributes || {}
      const vig = attributes.vig || 0

      // Rolar teste de Vigor DT 20
      const rollResult = ordemParanormalService.rollAttributeTest(vig, 0)
      const success = rollResult.total >= 20

      if (success) {
        // Remover condição Sangrando
        const newConditions = conditions.filter(c => c !== 'SANGRANDO')
        
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

        await deleteCache(getCharacterCacheKey({ characterId: id }))

        return {
          success: true,
          message: `Sangramento estancado! Teste de Vigor passou (${rollResult.total} >= 20)`,
          rollResult: rollResult.total,
          character: data,
        }
      } else {
        return {
          success: false,
          message: `Falha ao estancar sangramento. Teste de Vigor falhou (${rollResult.total} < 20)`,
          rollResult: rollResult.total,
        }
      }
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error, characterId: id }, 'Error stopping bleeding')
      throw new Error('Erro ao estancar sangramento: ' + (err.message || 'Erro desconhecido'))
    }
  },

  /**
   * Teste de Medicina (DT 20) para remover Sangrando/Morrendo
   * - Sucesso: remove SANGRANDO e MORRENDO (nessa ordem), estabiliza (PV permanece como está, podendo ser 0)
   * - Falha: sem efeito
   */
  async performMedicineCheck(
    id: string,
    options?: {
      roll?: number // valor do d20 já rolado (total bruto). Se não vier, rola no servidor.
      modifier?: number // bônus de perícia (default 0)
      advantage?: boolean
      disadvantage?: boolean
      dc?: number
    }
  ) {
    const dc = options?.dc ?? 20
    const modifier = options?.modifier ?? 0
    const advantage = options?.advantage ?? false
    const disadvantage = options?.disadvantage ?? false

    const rollD20 = () => Math.floor(Math.random() * 20) + 1
    let d20 = options?.roll
    if (d20 === undefined || d20 === null) {
      if (advantage && !disadvantage) {
        d20 = Math.max(rollD20(), rollD20())
      } else if (disadvantage && !advantage) {
        d20 = Math.min(rollD20(), rollD20())
      } else {
        d20 = rollD20()
      }
    }
    const total = d20 + modifier

    try {
      const { data: character, error: fetchError } = await supabase
        .from('characters')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      const conditions: Condition[] = character.conditions || []
      const timers = (character.conditionTimers as Array<{ condition: string; duration: number }>) || []
      const hasBleeding = conditions.includes('SANGRANDO')
      const hasDying = conditions.includes('MORRENDO')

      if (!hasBleeding && !hasDying) {
        return { character, success: false, total, dc, changes: ['Nenhuma condição removida'] }
      }

      const success = total >= dc
      let updatedConditions = [...conditions]
      let updatedTimers = [...timers]
      const changes: string[] = []

      if (success) {
        if (hasBleeding) {
          updatedConditions = updatedConditions.filter((c) => c !== 'SANGRANDO')
          changes.push('Medicina: Sangrando removido')
        }
        if (hasDying) {
          updatedConditions = updatedConditions.filter((c) => c !== 'MORRENDO' && c !== 'INCONSCIENTE')
          updatedTimers = updatedTimers.filter((t) => t.condition !== 'MORRENDO')
          changes.push('Medicina: Morrendo removido (estabilizado, PV permanece em 0)')
        }
      } else {
        changes.push('Medicina: Falha (sem efeitos)')
      }

      const { data, error } = await supabase
        .from('characters')
        .update({
          conditions: updatedConditions,
          conditionTimers: updatedTimers,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      await deleteCache(getCharacterCacheKey({ characterId: id }))

      return {
        character: data,
        success,
        total,
        dc,
        changes,
      }
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error }, 'Error performing medicine check')
      throw new Error('Erro ao realizar teste de Medicina: ' + (err.message || 'Erro desconhecido'))
    }
  },
}

