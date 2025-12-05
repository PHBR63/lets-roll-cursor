/**
 * Tipos relacionados a templates de ameaças
 */

export interface ThreatTemplate {
  id: string
  name: string
  description?: string
  type?: string // Tipo de ameaça (ex: "Zumbi", "Cultista", "Criatura Paranormal")
  baseAttributes?: {
    agi: number
    for: number
    int: number
    pre: number
    vig: number
  }
  baseStats?: {
    pv?: number // PV base (será multiplicado por VD)
    san?: number
    pe?: number
    defense?: number // Defesa base
  }
  skills?: Record<string, {
    attribute: string
    training: 'UNTRAINED' | 'TRAINED' | 'COMPETENT' | 'EXPERT'
    bonus: number
  }>
  resistances?: Record<string, number> // RD por tipo de dano
  abilities?: string[] // IDs de habilidades
  conditions?: string[] // Condições iniciais
  isGlobal?: boolean
  campaignId?: string | null
  createdBy?: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateThreatTemplateData {
  name: string
  description?: string
  type?: string
  baseAttributes?: {
    agi: number
    for: number
    int: number
    pre: number
    vig: number
  }
  baseStats?: {
    pv?: number
    san?: number
    pe?: number
    defense?: number
  }
  skills?: Record<string, {
    attribute: string
    training: 'UNTRAINED' | 'TRAINED' | 'COMPETENT' | 'EXPERT'
    bonus: number
  }>
  resistances?: Record<string, number>
  abilities?: string[]
  conditions?: string[]
  isGlobal?: boolean
  campaignId?: string | null
}

export interface UpdateThreatTemplateData {
  name?: string
  description?: string
  type?: string
  baseAttributes?: {
    agi: number
    for: number
    int: number
    pre: number
    vig: number
  }
  baseStats?: {
    pv?: number
    san?: number
    pe?: number
    defense?: number
  }
  skills?: Record<string, {
    attribute: string
    training: 'UNTRAINED' | 'TRAINED' | 'COMPETENT' | 'EXPERT'
    bonus: number
  }>
  resistances?: Record<string, number>
  abilities?: string[]
  conditions?: string[]
  isGlobal?: boolean
}

/**
 * Dados para criar criatura a partir de template + VD
 */
export interface CreateCreatureFromTemplateData {
  templateId: string
  vd: number // Vida/Dificuldade (1-20, geralmente)
  name?: string // Nome customizado (opcional, usa do template se não fornecido)
  campaignId?: string
}

