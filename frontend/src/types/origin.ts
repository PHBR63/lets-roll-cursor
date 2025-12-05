/**
 * Tipos relacionados a Origens do sistema Ordem Paranormal (Frontend)
 */

export type Origin =
  | 'ACADEMICO'
  | 'AGENTE_DE_SAUDE'
  | 'AMNESIA'
  | 'ARTISTA'
  | 'ATLETA'
  | 'CHEF'
  | 'CRIMINOSO'
  | 'DESEMPREGADO'
  | 'DESENVOLVEDOR'
  | 'ENGENHEIRO'
  | 'EX_MILITAR'
  | 'EX_POLICIAL'
  | 'FILHO_DE_CRIADOR'
  | 'JORNALISTA'
  | 'LUTADOR'
  | 'MAGNATA'
  | 'MEDICO_LEGISTA'
  | 'MENDIGO'
  | 'MILITAR'
  | 'OPERARIO'
  | 'POLICIAL'
  | 'RELIGIOSO'
  | 'TI'
  | 'TRABALHADOR_RURAL'
  | 'UNIVERSITARIO'
  | 'VETERINARIO'

export interface OriginConfig {
  id: Origin
  name: string
  description: string
  trainedSkills: string[]
  power: {
    name: string
    description: string
    effect?: string
  }
}

