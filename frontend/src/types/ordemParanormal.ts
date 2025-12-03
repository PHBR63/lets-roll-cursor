/**
 * Tipos TypeScript para o sistema Ordem Paranormal RPG
 */

/**
 * Atributos básicos do personagem
 */
export interface Attributes {
  agi: number // Agilidade
  for: number // Força
  int: number // Intelecto
  pre: number // Presença
  vig: number // Vigor
}

/**
 * Níveis de treinamento em perícias
 */
export type SkillTraining = 'UNTRAINED' | 'TRAINED' | 'COMPETENT' | 'EXPERT'

/**
 * Atributo base de uma perícia
 */
export type SkillAttribute = 'AGI' | 'FOR' | 'INT' | 'PRE' | 'VIG'

/**
 * Perícia do personagem
 */
export interface Skill {
  attribute: SkillAttribute
  training: SkillTraining
  bonus: number // Calculado: training level * 5
}

/**
 * Mapa de todas as perícias do personagem
 */
export interface Skills {
  [skillName: string]: Skill
}

/**
 * Recursos do personagem (PV, SAN, PE, NEX)
 */
export interface CharacterStats {
  pv: {
    current: number
    max: number
  }
  san: {
    current: number
    max: number
  }
  pe: {
    current: number
    max: number
  }
  nex: number // Nível de Exposição (0-99)
}

/**
 * Classes do sistema
 */
export type CharacterClass = 'COMBATENTE' | 'ESPECIALISTA' | 'OCULTISTA'

/**
 * Elementos paranormais para afinidade
 */
export type ParanormalElement = 'SANGUE' | 'MORTE' | 'ENERGIA' | 'CONHECIMENTO' | 'MEDO'

/**
 * Condições que podem afetar o personagem
 */
export type Condition =
  | 'CAIDO'
  | 'DESPREVENIDO'
  | 'ATORDADO'
  | 'INCONSCIENTE'
  | 'MORRENDO'
  | 'ABALADO'
  | 'APAVORADO'
  | 'PERTURBADO'
  | 'ENLOUQUECENDO'
  | 'LENTO'
  | 'IMOVEL'
  | 'PARALISADO'
  | 'AGARRADO'
  | 'ENREDADO'
  | 'CEGO'
  | 'SURDO'
  | 'ENJOADO'
  | 'NAUSEA'
  | 'DOENTE'
  | 'ENVENENADO'
  | 'FRACO'
  | 'DEBILITADO'
  | 'ESMORECIDO'
  | 'FRUSTRADO'
  | 'EXAUSTO'
  | 'FADIGADO'
  | 'SANGRANDO'
  | 'EM_CHAMAS'
  | 'FASCINADO'
  | 'INDEFESO'

/**
 * Dados completos do personagem no sistema Ordem Paranormal
 */
export interface OrdemParanormalCharacter {
  id: string
  name: string
  class: CharacterClass
  path?: string // Trilha do personagem
  attributes: Attributes
  skills: Skills
  stats: CharacterStats
  conditions: Condition[]
  affinity?: ParanormalElement | null // Afinidade paranormal (50% NEX)
  defense: number // Calculado: 10 + AGI + bônus
}

/**
 * Resultado de uma rolagem de atributo
 */
export interface AttributeRollResult {
  dice: number[] // Valores rolados
  result: number // Resultado final (maior/menor)
  bonus: number // Bônus de perícia
  total: number // Total para comparação com DT
  advantage: boolean // Se rolou com vantagem
  disadvantage: boolean // Se rolou com desvantagem
}

/**
 * Resultado de uma rolagem de ataque
 */
export interface AttackRollResult {
  dice: number[]
  result: number
  bonus: number
  total: number
  hit: boolean
  critical: boolean
  targetDefense: number
}

/**
 * Resultado de cálculo de dano
 */
export interface DamageResult {
  dice: number[]
  attributeBonus: number
  total: number
  isCritical: boolean
  multiplier: number
}

/**
 * Configuração de classe para cálculos
 */
export interface ClassConfig {
  pvInitial: number
  pvPerNex: number
  sanInitial: number
  sanPerNex: number
  peInitial: number
  pePerNex: number
}

/**
 * Configurações por classe
 */
export const CLASS_CONFIGS: Record<CharacterClass, ClassConfig> = {
  COMBATENTE: {
    pvInitial: 20,
    pvPerNex: 4,
    sanInitial: 12,
    sanPerNex: 3,
    peInitial: 2,
    pePerNex: 2,
  },
  ESPECIALISTA: {
    pvInitial: 16,
    pvPerNex: 3,
    sanInitial: 16,
    sanPerNex: 4,
    peInitial: 3,
    pePerNex: 3,
  },
  OCULTISTA: {
    pvInitial: 12,
    pvPerNex: 2,
    sanInitial: 20,
    sanPerNex: 5,
    peInitial: 4,
    pePerNex: 4,
  },
}

/**
 * Lista completa de perícias do sistema
 */
export const ALL_SKILLS: Record<string, { attribute: SkillAttribute; requiresTraining: boolean; hasCargoPenalty: boolean }> = {
  // Agilidade
  Atletismo: { attribute: 'FOR', requiresTraining: false, hasCargoPenalty: true },
  Acrobacia: { attribute: 'AGI', requiresTraining: false, hasCargoPenalty: true },
  Furtividade: { attribute: 'AGI', requiresTraining: false, hasCargoPenalty: true },
  Reflexos: { attribute: 'AGI', requiresTraining: false, hasCargoPenalty: true },
  Pilotagem: { attribute: 'AGI', requiresTraining: true, hasCargoPenalty: false },
  Iniciativa: { attribute: 'AGI', requiresTraining: false, hasCargoPenalty: false },
  Crime: { attribute: 'AGI', requiresTraining: true, hasCargoPenalty: true },
  Prestidigitação: { attribute: 'AGI', requiresTraining: true, hasCargoPenalty: false },
  
  // Força
  Luta: { attribute: 'FOR', requiresTraining: false, hasCargoPenalty: false },
  
  // Vigor
  Fortitude: { attribute: 'VIG', requiresTraining: false, hasCargoPenalty: false },
  
  // Presença
  Intuição: { attribute: 'PRE', requiresTraining: false, hasCargoPenalty: false },
  Percepção: { attribute: 'PRE', requiresTraining: false, hasCargoPenalty: false },
  Diplomacia: { attribute: 'PRE', requiresTraining: false, hasCargoPenalty: false },
  Intimidação: { attribute: 'PRE', requiresTraining: false, hasCargoPenalty: false },
  Enganação: { attribute: 'PRE', requiresTraining: false, hasCargoPenalty: false },
  Vontade: { attribute: 'PRE', requiresTraining: false, hasCargoPenalty: false },
  Religião: { attribute: 'PRE', requiresTraining: true, hasCargoPenalty: false },
  Artes: { attribute: 'PRE', requiresTraining: true, hasCargoPenalty: false },
  Adestramento: { attribute: 'PRE', requiresTraining: true, hasCargoPenalty: false },
  
  // Intelecto
  Ocultismo: { attribute: 'INT', requiresTraining: true, hasCargoPenalty: false },
  Ciências: { attribute: 'INT', requiresTraining: true, hasCargoPenalty: false },
  Tecnologia: { attribute: 'INT', requiresTraining: true, hasCargoPenalty: false },
  Medicina: { attribute: 'INT', requiresTraining: true, hasCargoPenalty: false },
  Investigação: { attribute: 'INT', requiresTraining: false, hasCargoPenalty: false },
  Atualidades: { attribute: 'INT', requiresTraining: false, hasCargoPenalty: false },
  Tática: { attribute: 'INT', requiresTraining: true, hasCargoPenalty: false },
  Sobrevivência: { attribute: 'INT', requiresTraining: false, hasCargoPenalty: false },
  Profissão: { attribute: 'INT', requiresTraining: true, hasCargoPenalty: false },
}

/**
 * Bônus de treinamento por nível
 */
export const TRAINING_BONUS: Record<SkillTraining, number> = {
  UNTRAINED: 0,
  TRAINED: 5,
  COMPETENT: 10,
  EXPERT: 15,
}

