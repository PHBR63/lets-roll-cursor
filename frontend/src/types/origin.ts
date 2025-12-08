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
  | 'CULTISTA_ARREPENDIDO'
  | 'DESEMPREGADO'
  | 'DESENVOLVEDOR'
  | 'DESGARRADO'
  | 'ENGENHEIRO'
  | 'EXECUTIVO'
  | 'EX_MILITAR'
  | 'EX_POLICIAL'
  | 'FILHO_DE_CRIADOR'
  | 'INVESTIGADOR'
  | 'JORNALISTA'
  | 'LUTADOR'
  | 'MAGNATA'
  | 'MEDICO_LEGISTA'
  | 'MENDIGO'
  | 'MERCENARIO'
  | 'MILITAR'
  | 'OPERARIO'
  | 'POLICIAL'
  | 'RELIGIOSO'
  | 'SERVIDOR_PUBLICO'
  | 'TEORICO_DA_CONSPIRACAO'
  | 'TI'
  | 'TRABALHADOR_RURAL'
  | 'TRAMBIQUEIRO'
  | 'UNIVERSITARIO'
  | 'VETERINARIO'
  | 'VITIMA'

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
  isHomebrew?: boolean // Indica se a origem é homebrew (não oficial)
}

