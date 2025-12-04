/**
 * Serviço para gerenciamento de habilidades de classe automáticas
 */
import { supabase } from '../../config/supabase'
import { logger } from '../../utils/logger'
import { AppError } from '../../types/common'
import { CharacterClass } from '../../types/ordemParanormal'
import {
  getUnlockedAbilities,
  getNewlyUnlockedAbilities,
  ClassAbility,
} from '../../types/classAbilities'
import { abilityService } from '../abilityService'
import { characterAbilitiesService } from './characterAbilitiesService'

/**
 * ID do usuário do sistema para criar habilidades automáticas
 */
const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000'

/**
 * Cria ou obtém habilidade de classe no banco de dados
 */
async function ensureClassAbility(ability: ClassAbility, campaignId?: string): Promise<string> {
  try {
    // Verificar se habilidade já existe (por classAbilityId no attributes)
    const { data: existing } = await supabase
      .from('abilities')
      .select('id')
      .eq('attributes->>classAbilityId', ability.id)
      .eq('is_global', true)
      .single()

    if (existing) {
      return existing.id
    }

    // Criar habilidade global de classe
    // Usar um usuário do sistema ou o primeiro usuário disponível
    let systemUserId = SYSTEM_USER_ID

    // Verificar se o usuário do sistema existe, se não, usar o primeiro usuário
    const { data: systemUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', SYSTEM_USER_ID)
      .single()

    if (!systemUser) {
      // Se não existe usuário do sistema, buscar o primeiro usuário
      const { data: firstUser } = await supabase
        .from('users')
        .select('id')
        .limit(1)
        .single()

      if (firstUser) {
        systemUserId = firstUser.id
      } else {
        throw new Error('Nenhum usuário encontrado no sistema')
      }
    }

    const createdAbility = await abilityService.createAbility(systemUserId, {
      name: ability.name,
      description: ability.description,
      type: ability.type,
      cost: ability.cost || {},
      attributes: {
        ...ability.attributes,
        classAbilityId: ability.id,
        nexRequired: ability.nexRequired,
        isClassAbility: true,
      },
      isGlobal: true,
      campaignId: null,
    })

    logger.info({ abilityId: createdAbility.id, abilityName: ability.name }, 'Class ability created')

    return createdAbility.id
  } catch (error: unknown) {
    const err = error as AppError
    logger.error({ error, ability }, 'Error ensuring class ability')
    throw new Error('Erro ao garantir habilidade de classe: ' + (err.message || 'Erro desconhecido'))
  }
}

export const characterClassAbilitiesService = {
  /**
   * Concede habilidades de classe automaticamente baseado em NEX
   * @param characterId - ID do personagem
   * @param characterClass - Classe do personagem
   * @param nex - NEX atual
   */
  async grantClassAbilities(characterId: string, characterClass: CharacterClass, nex: number) {
    try {
      const unlockedAbilities = getUnlockedAbilities(characterClass, nex)

      if (unlockedAbilities.length === 0) {
        logger.debug({ characterId, characterClass, nex }, 'No class abilities to grant')
        return
      }

      // Obter habilidades já atribuídas ao personagem
      const existingAbilities = await characterAbilitiesService.getCharacterAbilities(characterId)
      const existingAbilityIds = new Set(
        existingAbilities.map((ca: { ability: { id: string } }) => ca.ability.id)
      )

      // Conceder habilidades desbloqueadas que ainda não foram atribuídas
      let grantedCount = 0
      for (const classAbility of unlockedAbilities) {
        try {
          const abilityId = await ensureClassAbility(classAbility)

          if (!existingAbilityIds.has(abilityId)) {
            await characterAbilitiesService.addAbilityToCharacter(characterId, abilityId)
            grantedCount++
            logger.info(
              { characterId, abilityId, abilityName: classAbility.name, nex },
              'Class ability granted'
            )
          }
        } catch (error) {
          logger.error(
            { error, characterId, classAbility },
            'Error granting class ability'
          )
          // Continuar com outras habilidades mesmo se uma falhar
        }
      }

      if (grantedCount > 0) {
        logger.info(
          { characterId, grantedCount, totalUnlocked: unlockedAbilities.length },
          'Class abilities granted successfully'
        )
      }
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error, characterId }, 'Error granting class abilities')
      throw new Error('Erro ao conceder habilidades de classe: ' + (err.message || 'Erro desconhecido'))
    }
  },

  /**
   * Obtém habilidades de classe desbloqueáveis para um personagem
   * @param characterClass - Classe do personagem
   * @param nex - NEX atual
   * @returns Lista de habilidades desbloqueáveis
   */
  getUnlockedClassAbilities(characterClass: CharacterClass, nex: number): ClassAbility[] {
    return getUnlockedAbilities(characterClass, nex)
  },

  /**
   * Obtém habilidades recém-desbloqueadas
   * @param characterClass - Classe do personagem
   * @param oldNex - NEX anterior
   * @param newNex - NEX novo
   * @returns Lista de habilidades recém-desbloqueadas
   */
  getNewlyUnlockedClassAbilities(
    characterClass: CharacterClass,
    oldNex: number,
    newNex: number
  ): ClassAbility[] {
    return getNewlyUnlockedAbilities(characterClass, oldNex, newNex)
  },
}

