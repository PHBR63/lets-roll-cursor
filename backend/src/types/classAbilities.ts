/**
 * Habilidades de classe únicas do sistema Ordem Paranormal
 * Concedidas automaticamente ao atingir marcos de NEX
 */

import { CharacterClass } from './ordemParanormal'

export interface ClassAbility {
  id: string
  name: string
  description: string
  nexRequired: number // NEX mínimo necessário (5, 10, 15, etc.)
  type: 'passive' | 'active' | 'reaction'
  cost?: {
    pe?: number
    san?: number
    action?: 'action' | 'movement' | 'free'
  }
  effects?: Record<string, unknown>
  attributes?: Record<string, unknown>
}

/**
 * Habilidades do Combatente
 */
export const COMBATENTE_ABILITIES: ClassAbility[] = [
  {
    id: 'combatente-ataque-especial',
    name: 'Ataque Especial',
    description: 'Você pode gastar 2 PE para receber +5 em um teste de ataque ou +2d6 de dano.',
    nexRequired: 5,
    type: 'active',
    cost: { pe: 2, action: 'action' },
    effects: {
      attackBonus: 5,
      damageBonus: '2d6',
    },
  },
  {
    id: 'combatente-golpe-de-sorte',
    name: 'Golpe de Sorte',
    description: 'Uma vez por rodada, quando faz um teste de ataque, você pode rolar novamente.',
    nexRequired: 10,
    type: 'reaction',
    cost: { action: 'free' },
    effects: {
      reroll: true,
      usesPerRound: 1,
    },
  },
  {
    id: 'combatente-resistencia-sobrenatural',
    name: 'Resistência Sobrenatural',
    description: 'Você recebe +5 em testes de resistência.',
    nexRequired: 15,
    type: 'passive',
    effects: {
      resistanceBonus: 5,
    },
  },
  {
    id: 'combatente-ataque-poderoso',
    name: 'Ataque Poderoso',
    description: 'Você pode gastar 3 PE para receber +10 em um teste de ataque ou +4d6 de dano.',
    nexRequired: 20,
    type: 'active',
    cost: { pe: 3, action: 'action' },
    effects: {
      attackBonus: 10,
      damageBonus: '4d6',
    },
  },
  {
    id: 'combatente-combate-defensivo',
    name: 'Combate Defensivo',
    description: 'Você pode gastar 1 PE para receber +5 em Defesa até o início do seu próximo turno.',
    nexRequired: 25,
    type: 'active',
    cost: { pe: 1, action: 'action' },
    effects: {
      defenseBonus: 5,
      duration: 'until_next_turn',
    },
  },
  {
    id: 'combatente-ataque-furioso',
    name: 'Ataque Furioso',
    description: 'Você pode gastar 4 PE para fazer um ataque adicional na mesma rodada.',
    nexRequired: 30,
    type: 'active',
    cost: { pe: 4, action: 'action' },
    effects: {
      extraAttack: 1,
    },
  },
]

/**
 * Habilidades do Especialista
 */
export const ESPECIALISTA_ABILITIES: ClassAbility[] = [
  {
    id: 'especialista-perito',
    name: 'Perito',
    description: 'Escolha uma perícia. Você recebe +5 nessa perícia e pode usá-la mesmo sem treinamento.',
    nexRequired: 5,
    type: 'passive',
    effects: {
      skillBonus: 5,
      ignoreTraining: true,
    },
  },
  {
    id: 'especialista-investigador',
    name: 'Investigador',
    description: 'Você recebe +5 em testes de Investigação e Percepção.',
    nexRequired: 10,
    type: 'passive',
    effects: {
      skillBonus: 5,
      skills: ['Investigação', 'Percepção'],
    },
  },
  {
    id: 'especialista-especialista-em',
    name: 'Especialista em...',
    description: 'Escolha uma perícia. Você recebe +10 nessa perícia.',
    nexRequired: 15,
    type: 'passive',
    effects: {
      skillBonus: 10,
    },
  },
  {
    id: 'especialista-mestre-das-pericias',
    name: 'Mestre das Perícias',
    description: 'Você recebe +2 em todas as perícias treinadas.',
    nexRequired: 20,
    type: 'passive',
    effects: {
      trainedSkillBonus: 2,
    },
  },
  {
    id: 'especialista-pericia-versatil',
    name: 'Perícia Versátil',
    description: 'Você pode usar qualquer perícia como se fosse treinado, mesmo sem treinamento.',
    nexRequired: 25,
    type: 'passive',
    effects: {
      allSkillsTrained: true,
    },
  },
  {
    id: 'especialista-perito-absoluto',
    name: 'Perito Absoluto',
    description: 'Escolha uma perícia. Você recebe +15 nessa perícia e pode rolar novamente falhas.',
    nexRequired: 30,
    type: 'passive',
    effects: {
      skillBonus: 15,
      rerollFailures: true,
    },
  },
]

/**
 * Habilidades do Ocultista
 */
export const OCULTISTA_ABILITIES: ClassAbility[] = [
  {
    id: 'ocultista-ritualista',
    name: 'Ritualista',
    description: 'Você pode aprender rituais. Você conhece 2 rituais de 1º círculo.',
    nexRequired: 5,
    type: 'passive',
    effects: {
      knownRituals: 2,
      ritualCircle: 1,
    },
  },
  {
    id: 'ocultista-afinidade-elemental',
    name: 'Afinidade Elemental',
    description: 'Escolha um elemento. Você recebe +2 em testes de rituais desse elemento.',
    nexRequired: 10,
    type: 'passive',
    effects: {
      ritualBonus: 2,
    },
  },
  {
    id: 'ocultista-ritualista-avancado',
    name: 'Ritualista Avançado',
    description: 'Você conhece 1 ritual adicional de 2º círculo.',
    nexRequired: 15,
    type: 'passive',
    effects: {
      knownRituals: 1,
      ritualCircle: 2,
    },
  },
  {
    id: 'ocultista-mestre-dos-rituais',
    name: 'Mestre dos Rituais',
    description: 'Você pode lançar rituais gastando 1 PE a menos.',
    nexRequired: 20,
    type: 'passive',
    effects: {
      ritualCostReduction: 1,
    },
  },
  {
    id: 'ocultista-ritualista-mestre',
    name: 'Ritualista Mestre',
    description: 'Você conhece 1 ritual adicional de 3º círculo.',
    nexRequired: 25,
    type: 'passive',
    effects: {
      knownRituals: 1,
      ritualCircle: 3,
    },
  },
  {
    id: 'ocultista-arcano-supremo',
    name: 'Arcano Supremo',
    description: 'Você pode lançar rituais gastando 2 PE a menos e conhece 1 ritual de 4º círculo.',
    nexRequired: 30,
    type: 'passive',
    effects: {
      ritualCostReduction: 2,
      knownRituals: 1,
      ritualCircle: 4,
    },
  },
]

/**
 * Mapa de habilidades por classe
 */
export const CLASS_ABILITIES: Record<CharacterClass, ClassAbility[]> = {
  COMBATENTE: COMBATENTE_ABILITIES,
  ESPECIALISTA: ESPECIALISTA_ABILITIES,
  OCULTISTA: OCULTISTA_ABILITIES,
}

/**
 * Obtém habilidades desbloqueáveis para uma classe e NEX
 * @param characterClass - Classe do personagem
 * @param nex - Nível de Exposição atual
 * @returns Lista de habilidades desbloqueáveis
 */
export function getUnlockedAbilities(characterClass: CharacterClass, nex: number): ClassAbility[] {
  const abilities = CLASS_ABILITIES[characterClass] || []
  return abilities.filter((ability) => ability.nexRequired <= nex)
}

/**
 * Obtém habilidades recém-desbloqueadas ao aumentar NEX
 * @param characterClass - Classe do personagem
 * @param oldNex - NEX anterior
 * @param newNex - NEX novo
 * @returns Lista de habilidades recém-desbloqueadas
 */
export function getNewlyUnlockedAbilities(
  characterClass: CharacterClass,
  oldNex: number,
  newNex: number
): ClassAbility[] {
  const abilities = CLASS_ABILITIES[characterClass] || []
  return abilities.filter(
    (ability) => ability.nexRequired > oldNex && ability.nexRequired <= newNex
  )
}

