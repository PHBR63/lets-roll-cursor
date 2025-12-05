/**
 * Serviço para gerenciamento de Origens
 * Aplica automaticamente perícias treinadas e poderes baseados na origem
 */
import { Origin, OriginConfig, getOriginConfig, getAllOrigins } from '../types/origin'
import { Skills, SkillTraining } from '../types/ordemParanormal'
import { logger } from '../utils/logger'

/**
 * Mapeamento de nomes de perícias para atributos base
 * Baseado na lista completa de perícias do sistema
 */
const SKILL_ATTRIBUTE_MAP: Record<string, 'AGI' | 'FOR' | 'INT' | 'PRE' | 'VIG'> = {
  // Agilidade
  Atletismo: 'FOR',
  Acrobacia: 'AGI',
  Furtividade: 'AGI',
  Reflexos: 'AGI',
  Pilotagem: 'AGI',
  Iniciativa: 'AGI',
  Crime: 'AGI',
  Prestidigitação: 'AGI',
  Pontaria: 'AGI',
  
  // Força
  Luta: 'FOR',
  
  // Vigor
  Fortitude: 'VIG',
  
  // Presença
  Intuição: 'PRE',
  Percepção: 'PRE',
  Diplomacia: 'PRE',
  Intimidação: 'PRE',
  Enganação: 'PRE',
  Vontade: 'PRE',
  Religião: 'PRE',
  Artes: 'PRE',
  Adestramento: 'PRE',
  
  // Intelecto
  Ocultismo: 'INT',
  Ciências: 'INT',
  Tecnologia: 'INT',
  Medicina: 'INT',
  Investigação: 'INT',
  Atualidades: 'INT',
  Tática: 'INT',
  Sobrevivência: 'INT',
  Profissão: 'INT',
}

/**
 * Serviço de origem
 */
export const originService = {
  /**
   * Lista todas as origens disponíveis
   * @returns Lista de configurações de origens
   */
  getAllOrigins(): OriginConfig[] {
    return getAllOrigins()
  },

  /**
   * Obtém configuração de uma origem específica
   * @param origin - ID da origem
   * @returns Configuração da origem
   */
  getOriginConfig(origin: Origin): OriginConfig {
    return getOriginConfig(origin)
  },

  /**
   * Aplica origem a um personagem, adicionando perícias treinadas automaticamente
   * @param origin - ID da origem
   * @param currentSkills - Perícias atuais do personagem
   * @returns Perícias atualizadas com as perícias treinadas da origem
   */
  applyOriginSkills(origin: Origin, currentSkills: Skills = {}): Skills {
    try {
      const originConfig = getOriginConfig(origin)
      const updatedSkills = { ...currentSkills }

      // Aplicar perícias treinadas da origem
      for (const skillName of originConfig.trainedSkills) {
        const attribute = SKILL_ATTRIBUTE_MAP[skillName] || 'INT' // Default para INT se não encontrado

        // Se a perícia já existe, atualizar para treinada (se não for melhor)
        if (updatedSkills[skillName]) {
          const currentTraining = updatedSkills[skillName].training
          const trainingLevels: SkillTraining[] = ['UNTRAINED', 'TRAINED', 'COMPETENT', 'EXPERT']
          const currentLevel = trainingLevels.indexOf(currentTraining)
          const trainedLevel = trainingLevels.indexOf('TRAINED')

          // Só atualizar se o nível atual for menor que TRAINED
          if (currentLevel < trainedLevel) {
            updatedSkills[skillName] = {
              attribute,
              training: 'TRAINED',
              bonus: 5, // Bônus de treinado
            }
          }
        } else {
          // Criar nova perícia treinada
          updatedSkills[skillName] = {
            attribute,
            training: 'TRAINED',
            bonus: 5,
          }
        }
      }

      logger.info(
        { origin, skillsAdded: originConfig.trainedSkills },
        'Origin skills applied'
      )

      return updatedSkills
    } catch (error: unknown) {
      logger.error({ error, origin }, 'Error applying origin skills')
      throw new Error('Erro ao aplicar perícias da origem: ' + ((error as Error).message || 'Erro desconhecido'))
    }
  },

  /**
   * Obtém o poder da origem
   * @param origin - ID da origem
   * @returns Poder da origem
   */
  getOriginPower(origin: Origin): { name: string; description: string; effect?: string } {
    const originConfig = getOriginConfig(origin)
    return originConfig.power
  },

  /**
   * Remove efeitos de uma origem anterior (se houver mudança de origem)
   * @param oldOrigin - ID da origem anterior
   * @param currentSkills - Perícias atuais
   * @returns Perícias sem as perícias treinadas da origem anterior
   */
  removeOriginSkills(oldOrigin: Origin | null, currentSkills: Skills = {}): Skills {
    if (!oldOrigin) return currentSkills

    try {
      const oldOriginConfig = getOriginConfig(oldOrigin)
      const updatedSkills = { ...currentSkills }

      // Remover perícias treinadas da origem anterior (apenas se estiverem como TRAINED)
      for (const skillName of oldOriginConfig.trainedSkills) {
        if (updatedSkills[skillName] && updatedSkills[skillName].training === 'TRAINED') {
          // Se foi treinada apenas pela origem, remover
          // Se foi treinada por outro motivo (ex: escolha do jogador), manter
          // Por enquanto, vamos apenas resetar para UNTRAINED se for TRAINED
          // (O jogador pode ter treinado manualmente, então não removemos completamente)
          updatedSkills[skillName] = {
            ...updatedSkills[skillName],
            training: 'UNTRAINED',
            bonus: 0,
          }
        }
      }

      logger.info({ oldOrigin }, 'Origin skills removed')

      return updatedSkills
    } catch (error: unknown) {
      logger.error({ error, oldOrigin }, 'Error removing origin skills')
      // Não lançar erro, apenas logar
      return currentSkills
    }
  },
}

