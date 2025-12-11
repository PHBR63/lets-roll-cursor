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
  | 'SOBRECARREGADO'

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
export const ALL_SKILLS: Record<string, { attribute: SkillAttribute; requiresTraining: boolean; hasCargoPenalty: boolean; requiresKit: boolean }> = {
  // Agilidade
  Atletismo: { attribute: 'FOR', requiresTraining: false, hasCargoPenalty: true, requiresKit: false },
  Acrobacia: { attribute: 'AGI', requiresTraining: false, hasCargoPenalty: true, requiresKit: false },
  Furtividade: { attribute: 'AGI', requiresTraining: false, hasCargoPenalty: true, requiresKit: false },
  Reflexos: { attribute: 'AGI', requiresTraining: false, hasCargoPenalty: false, requiresKit: false },
  Pilotagem: { attribute: 'AGI', requiresTraining: true, hasCargoPenalty: false, requiresKit: false },
  Iniciativa: { attribute: 'AGI', requiresTraining: false, hasCargoPenalty: false, requiresKit: false },
  Crime: { attribute: 'AGI', requiresTraining: true, hasCargoPenalty: true, requiresKit: true },
  Pontaria: { attribute: 'AGI', requiresTraining: false, hasCargoPenalty: false, requiresKit: false },
  Prestidigitação: { attribute: 'AGI', requiresTraining: true, hasCargoPenalty: false, requiresKit: false },

  // Força
  Luta: { attribute: 'FOR', requiresTraining: false, hasCargoPenalty: false, requiresKit: false },

  // Vigor
  Fortitude: { attribute: 'VIG', requiresTraining: false, hasCargoPenalty: false, requiresKit: false },

  // Presença
  Intuição: { attribute: 'PRE', requiresTraining: false, hasCargoPenalty: false, requiresKit: false },
  Percepção: { attribute: 'PRE', requiresTraining: false, hasCargoPenalty: false, requiresKit: false },
  Diplomacia: { attribute: 'PRE', requiresTraining: false, hasCargoPenalty: false, requiresKit: false },
  Intimidação: { attribute: 'PRE', requiresTraining: false, hasCargoPenalty: false, requiresKit: false },
  Enganação: { attribute: 'PRE', requiresTraining: false, hasCargoPenalty: false, requiresKit: true },
  Vontade: { attribute: 'PRE', requiresTraining: false, hasCargoPenalty: false, requiresKit: false },
  Religião: { attribute: 'PRE', requiresTraining: true, hasCargoPenalty: false, requiresKit: false },
  Artes: { attribute: 'PRE', requiresTraining: true, hasCargoPenalty: false, requiresKit: false },
  Adestramento: { attribute: 'PRE', requiresTraining: true, hasCargoPenalty: false, requiresKit: false },

  // Intelecto
  Ocultismo: { attribute: 'INT', requiresTraining: true, hasCargoPenalty: false, requiresKit: false },
  Ciências: { attribute: 'INT', requiresTraining: true, hasCargoPenalty: false, requiresKit: false },
  Tecnologia: { attribute: 'INT', requiresTraining: true, hasCargoPenalty: false, requiresKit: true },
  Medicina: { attribute: 'INT', requiresTraining: true, hasCargoPenalty: false, requiresKit: true },
  Investigação: { attribute: 'INT', requiresTraining: false, hasCargoPenalty: false, requiresKit: false },
  Atualidades: { attribute: 'INT', requiresTraining: false, hasCargoPenalty: false, requiresKit: false },
  Tática: { attribute: 'INT', requiresTraining: true, hasCargoPenalty: false, requiresKit: false },
  Sobrevivência: { attribute: 'INT', requiresTraining: false, hasCargoPenalty: false, requiresKit: false },
  Profissão: { attribute: 'INT', requiresTraining: true, hasCargoPenalty: false, requiresKit: false },
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

/**
 * Patentes da Ordem
 */
export type Rank = 'RECRUTA' | 'OPERADOR' | 'AGENTE_ESPECIAL' | 'OFICIAL_OPERACOES' | 'ELITE'

/**
 * Categorias de itens (0 a IV)
 */
export type ItemCategory = 0 | 1 | 2 | 3 | 4

/**
 * Tabela de permissão de categoria por patente
 * [Patente][Categoria] = Quantidade máxima permitida
 */
export const RANK_CATEGORY_PERMISSIONS: Record<Rank, Record<ItemCategory, number>> = {
  RECRUTA: {
    0: 3, // Categoria I
    1: 2, // Categoria II
    2: 0, // Categoria III
    3: 0, // Categoria IV
    4: 0, // Categoria V (se existir)
  },
  OPERADOR: {
    0: 3, // Categoria I
    1: 3, // Categoria II
    2: 1, // Categoria III
    3: 0, // Categoria IV
    4: 0, // Categoria V
  },
  AGENTE_ESPECIAL: {
    0: 3, // Categoria I
    1: 3, // Categoria II
    2: 2, // Categoria III
    3: 1, // Categoria IV
    4: 0, // Categoria V
  },
  OFICIAL_OPERACOES: {
    0: 3, // Categoria I
    1: 3, // Categoria II
    2: 3, // Categoria III
    3: 2, // Categoria IV
    4: 1, // Categoria V
  },
  ELITE: {
    0: 3, // Categoria I
    1: 3, // Categoria II
    2: 3, // Categoria III
    3: 3, // Categoria IV
    4: 2, // Categoria V
  },
}

/**
 * Lista completa de condições disponíveis
 */
export const ALL_CONDITIONS: Condition[] = [
  'CAIDO',
  'DESPREVENIDO',
  'ATORDADO',
  'INCONSCIENTE',
  'MORRENDO',
  'ABALADO',
  'APAVORADO',
  'PERTURBADO',
  'ENLOUQUECENDO',
  'LENTO',
  'IMOVEL',
  'PARALISADO',
  'AGARRADO',
  'ENREDADO',
  'CEGO',
  'SURDO',
  'ENJOADO',
  'NAUSEA',
  'DOENTE',
  'ENVENENADO',
  'FRACO',
  'DEBILITADO',
  'ESMORECIDO',
  'FRUSTRADO',
  'EXAUSTO',
  'FADIGADO',
  'SANGRANDO',
  'EM_CHAMAS',
  'FASCINADO',
  'INDEFESO',
]

/**
 * Tipos para Sistema de Rituais (Grimório)
 */

export type RitualElement = ParanormalElement
export type RitualCircle = 1 | 2 | 3 | 4
export type RitualExecution = 'PADRAO' | 'COMPLETA' | 'MOVIMENTO' | 'LIVRE' | 'REACAO'
export type RitualRange = 'PESSOAL' | 'TOQUE' | 'CURTO' | 'MEDIO' | 'LONGO' | 'ILIMITADO'

export interface RitualCostConfig {
  basePe: number
  discipleExtraPe?: number // Custo extra para Discente (total = base + extra)
  trueExtraPe?: number // Custo extra para Verdadeiro (total = base + extra)
}

export interface Ritual {
  id: string
  name: string
  element: RitualElement
  circle: RitualCircle
  execution: RitualExecution
  range: RitualRange
  target: string
  duration: string
  description: string
  cost: RitualCostConfig
  resistance?: 'FORTITUDE' | 'REFLEXOS' | 'VONTADE' | 'NINGUEM'
  requiredAffinityForTrue?: RitualElement | RitualElement[]
}

/**
 * Rituais aprendidos pelo personagem
 */
export interface CharacterRitual {
  character_id: string
  ritual_id: string
  mode_unlocked: 'NORMAL' | 'DISCIPLE' | 'TRUE'
  created_at?: string
  ritual?: Ritual // Join opcional
}

