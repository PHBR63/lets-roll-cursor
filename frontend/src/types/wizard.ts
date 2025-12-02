/**
 * Tipos para o wizard de criação de campanha
 */

export interface Acquirable {
  id: string
  name: string
  properties: string[]
}

export interface PersonalityBar {
  title: string
  type: 'percentual' | 'numerico'
}

export interface Personality {
  id: string
  name: string
  bars: PersonalityBar[]
  properties: string[]
}

export interface WizardState {
  step: 1 | 2 | 3
  baseData: {
    image?: File
    systemRpg?: string
    title: string
    description: string
  }
  acquirables: Acquirable[]
  personalities: Personality[]
}

