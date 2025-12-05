/**
 * Serviço para gerenciamento de rituais paranormais
 */
import { supabase } from '../config/supabase'
import { logger } from '../utils/logger'
import { AppError } from '../types/common'
import { ordemParanormalService } from './ordemParanormalService'
import { characterResourcesService } from './character/characterResourcesService'
import { deleteCache, getCharacterCacheKey } from './cache'

export const ritualService = {
  /**
   * Conjura um ritual para o personagem
   * Sequência: validar PE → gastar PE → rolar teste de custo → aplicar consequência
   * @param characterId - ID do personagem
   * @param ritualId - ID do ritual
   * @param peSpentThisTurn - PE já gasto no turno atual (para validação de limite)
   * @returns Resultado da conjuração
   */
  async conjureRitual(
    characterId: string,
    ritualId: string,
    peSpentThisTurn: number = 0
  ) {
    try {
      // Buscar personagem
      const { data: character, error: fetchError } = await supabase
        .from('characters')
        .select('*')
        .eq('id', characterId)
        .single()

      if (fetchError) throw fetchError

      // Buscar ritual (por enquanto, vamos usar dados hardcoded ou buscar de uma tabela)
      // Por enquanto, vamos assumir que o ritual vem do frontend com seus dados
      // TODO: Criar tabela de rituais no banco se necessário

      // Validar PE disponível (será feito pelo spendPE)
      const stats = character.stats || {}
      const pe = stats.pe || { current: 0, max: 0 }

      // Por enquanto, vamos receber o custo do ritual do frontend
      // Em uma implementação completa, buscaríamos o ritual do banco
      // Para esta implementação, vamos criar uma função que aceita o custo diretamente
      throw new Error('Use conjureRitualWithCost ao invés de conjureRitual')
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error, characterId, ritualId }, 'Error conjuring ritual')
      throw new Error('Erro ao conjurar ritual: ' + (err.message || 'Erro desconhecido'))
    }
  },

  /**
   * Conjura um ritual com custo especificado
   * @param characterId - ID do personagem
   * @param ritualCost - Custo do ritual em PE
   * @param peSpentThisTurn - PE já gasto no turno atual
   * @returns Resultado da conjuração
   */
  async conjureRitualWithCost(
    characterId: string,
    ritualCost: number,
    peSpentThisTurn: number = 0
  ) {
    try {
      // Buscar personagem
      const { data: character, error: fetchError } = await supabase
        .from('characters')
        .select('*')
        .eq('id', characterId)
        .single()

      if (fetchError) throw fetchError

      const stats = character.stats || {}
      const pe = stats.pe || { current: 0, max: 0 }
      const attributes = character.attributes || {}
      const skills = character.skills || {}

      // Validar PE disponível
      if (pe.current < ritualCost) {
        throw new Error(`PE insuficiente. Você tem ${pe.current} PE, mas o ritual custa ${ritualCost} PE.`)
      }

      // Gastar PE (com validação de limite por turno)
      try {
        await characterResourcesService.spendPE(characterId, ritualCost, peSpentThisTurn)
      } catch (peError: any) {
        throw new Error(peError.message || 'Erro ao gastar PE')
      }

      // Preparar dados do personagem para o teste
      // Buscar perícia Ocultismo (pode estar em diferentes formatos)
      let ocultismoBonus = 0
      const ocultismo = skills['Ocultismo'] || skills['ocultismo']
      
      if (ocultismo) {
        // Pode ser { training: string, bonus: number } ou { attribute: string, training: string, bonus: number }
        if (typeof ocultismo === 'object' && 'bonus' in ocultismo) {
          ocultismoBonus = (ocultismo.bonus as number) || 0
        } else if (typeof ocultismo === 'object' && 'training' in ocultismo) {
          // Calcular bônus baseado no treinamento
          const training = (ocultismo.training as string) || 'UNTRAINED'
          ocultismoBonus = ordemParanormalService.calculateSkillBonus(training as any)
        }
      }

      const characterData = {
        attributes: {
          int: attributes.int || 0,
        },
        skills: {
          Ocultismo: {
            attribute: 'INT',
            training: ocultismo?.training || 'UNTRAINED',
            bonus: ocultismoBonus,
          },
        },
      }

      // Rolar teste de custo (secreto)
      const testResult = ordemParanormalService.rollRitualCostTest(characterData, ritualCost)

      let sanLoss = 0
      let sanMaxLoss = 0
      let message = ''

      // Aplicar consequências baseadas no resultado
      if (testResult.success) {
        message = `Ritual conjurado com sucesso! Teste de custo passou (${testResult.rollResult} >= ${testResult.dt}).`
      } else if (testResult.criticalFailure) {
        // Falha crítica: perde SAN atual e reduz SAN máxima permanentemente
        sanLoss = ritualCost
        sanMaxLoss = 1
        message = `Falha crítica no teste de custo! Você perde ${sanLoss} SAN e sua SAN máxima é reduzida em ${sanMaxLoss} permanentemente.`
      } else {
        // Falha normal: perde apenas SAN atual
        sanLoss = ritualCost
        message = `Falha no teste de custo (${testResult.rollResult} < ${testResult.dt}). Você perde ${sanLoss} SAN.`
      }

      // Aplicar perda de SAN se houver
      if (sanLoss > 0) {
        const sanResult = await characterResourcesService.updateSAN(characterId, -sanLoss, true)
        
        // Se houve perda permanente de SAN máxima
        if (sanMaxLoss > 0) {
          const currentStats = sanResult.character.stats || {}
          const currentSAN = currentStats.san || { current: 0, max: 0 }
          
          // Reduzir SAN máxima
          const newSanMax = Math.max(0, currentSAN.max - sanMaxLoss)
          
          await supabase
            .from('characters')
            .update({
              stats: {
                ...currentStats,
                san: {
                  current: currentSAN.current,
                  max: newSanMax,
                },
              },
              updated_at: new Date().toISOString(),
            })
            .eq('id', characterId)

          logger.info(
            { characterId, sanMaxLoss, newSanMax },
            'SAN máxima reduzida permanentemente por falha crítica em ritual'
          )
        }
      }

      // Invalidar cache
      await deleteCache(getCharacterCacheKey({ characterId }))

      return {
        success: testResult.success,
        criticalFailure: testResult.criticalFailure,
        testResult: {
          rollResult: testResult.rollResult,
          dt: testResult.dt,
          dice: testResult.dice,
          attributeValue: testResult.attributeValue,
          skillBonus: testResult.skillBonus,
        },
        sanLoss,
        sanMaxLoss,
        message,
      }
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error, characterId, ritualCost }, 'Error conjuring ritual with cost')
      throw new Error('Erro ao conjurar ritual: ' + (err.message || 'Erro desconhecido'))
    }
  },
}

