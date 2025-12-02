/**
 * Tipos TypeScript para o sistema Ordem Paranormal RPG (Backend)
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
 * Bônus de treinamento por nível
 */
export const TRAINING_BONUS: Record<SkillTraining, number> = {
  UNTRAINED: 0,
  TRAINED: 5,
  COMPETENT: 10,
  EXPERT: 15,
}

