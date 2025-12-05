/**
 * Tipos relacionados a Origens do sistema Ordem Paranormal
 */

/**
 * Origens disponíveis no sistema
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

/**
 * Configuração de uma origem
 */
export interface OriginConfig {
  id: Origin
  name: string
  description: string
  trainedSkills: string[] // Nomes das perícias que ficam treinadas
  power: {
    name: string
    description: string
    effect?: string // Efeito mecânico do poder (opcional)
  }
}

/**
 * Dados completos de todas as origens
 */
export const ORIGINS: Record<Origin, OriginConfig> = {
  ACADEMICO: {
    id: 'ACADEMICO',
    name: 'Acadêmico',
    description: 'Você passou anos estudando e pesquisando.',
    trainedSkills: ['Investigação', 'Ocultismo'],
    power: {
      name: 'Saber em Detalhes',
      description: 'Você pode gastar 2 PE para rolar novamente um teste de perícia baseada em INT.',
    },
  },
  AGENTE_DE_SAUDE: {
    id: 'AGENTE_DE_SAUDE',
    name: 'Agente de Saúde',
    description: 'Você trabalha na área da saúde pública.',
    trainedSkills: ['Medicina', 'Profissão'],
    power: {
      name: 'Primeiros Socorros',
      description: 'Você pode gastar 1 PE para curar 1d8 de PV de um aliado adjacente.',
    },
  },
  AMNESIA: {
    id: 'AMNESIA',
    name: 'Amnésia',
    description: 'Você não se lembra de seu passado antes de entrar na Ordem.',
    trainedSkills: ['Investigação', 'Vontade'],
    power: {
      name: 'Memórias Fragmentadas',
      description: 'Uma vez por sessão, você pode rolar novamente um teste de perícia.',
    },
  },
  ARTISTA: {
    id: 'ARTISTA',
    name: 'Artista',
    description: 'Você é um artista profissional.',
    trainedSkills: ['Artes', 'Enganação'],
    power: {
      name: 'Inspiração',
      description: 'Você pode gastar 2 PE para dar +2 em um teste de perícia de um aliado.',
    },
  },
  ATLETA: {
    id: 'ATLETA',
    name: 'Atleta',
    description: 'Você é um atleta profissional ou amador.',
    trainedSkills: ['Atletismo', 'Acrobacia'],
    power: {
      name: 'Segundo Fôlego',
      description: 'Uma vez por cena, você pode recuperar 1d6 de PE.',
    },
  },
  CHEF: {
    id: 'CHEF',
    name: 'Chef',
    description: 'Você é um cozinheiro profissional.',
    trainedSkills: ['Profissão', 'Vontade'],
    power: {
      name: 'Refeição Reforçada',
      description: 'Você pode preparar refeições que curam 1d4 de PV e 1d4 de SAN.',
    },
  },
  CRIMINOSO: {
    id: 'CRIMINOSO',
    name: 'Criminoso',
    description: 'Você tem um passado criminoso.',
    trainedSkills: ['Crime', 'Furtividade'],
    power: {
      name: 'Contatos',
      description: 'Você pode gastar 2 PE para obter informações ou itens ilegais.',
    },
  },
  DESEMPREGADO: {
    id: 'DESEMPREGADO',
    name: 'Desempregado',
    description: 'Você está sem emprego fixo.',
    trainedSkills: ['Atualidades', 'Sobrevivência'],
    power: {
      name: 'Sobrevivência Urbana',
      description: 'Você recebe +2 em testes de Percepção para encontrar recursos.',
    },
  },
  DESENVOLVEDOR: {
    id: 'DESENVOLVEDOR',
    name: 'Desenvolvedor',
    description: 'Você trabalha com desenvolvimento de software.',
    trainedSkills: ['Tecnologia', 'Investigação'],
    power: {
      name: 'Hackear',
      description: 'Você pode gastar 1 PE para hackear sistemas eletrônicos.',
    },
  },
  ENGENHEIRO: {
    id: 'ENGENHEIRO',
    name: 'Engenheiro',
    description: 'Você é um engenheiro profissional.',
    trainedSkills: ['Tecnologia', 'Profissão'],
    power: {
      name: 'Improvisar',
      description: 'Você pode criar itens temporários com materiais disponíveis.',
    },
  },
  EX_MILITAR: {
    id: 'EX_MILITAR',
    name: 'Ex-Militar',
    description: 'Você serviu nas forças armadas.',
    trainedSkills: ['Tática', 'Pontaria'],
    power: {
      name: 'Treinamento Militar',
      description: 'Você recebe +2 em testes de Iniciativa e pode usar armas de fogo sem treinamento.',
    },
  },
  EX_POLICIAL: {
    id: 'EX_POLICIAL',
    name: 'Ex-Policial',
    description: 'Você foi policial.',
    trainedSkills: ['Investigação', 'Intimidação'],
    power: {
      name: 'Instinto Policial',
      description: 'Você recebe +2 em testes de Percepção para detectar mentiras.',
    },
  },
  FILHO_DE_CRIADOR: {
    id: 'FILHO_DE_CRIADOR',
    name: 'Filho de Criador',
    description: 'Você cresceu em uma fazenda ou criação de animais.',
    trainedSkills: ['Adestramento', 'Sobrevivência'],
    power: {
      name: 'Lidar com Animais',
      description: 'Você recebe +2 em testes de Adestramento e pode se comunicar melhor com animais.',
    },
  },
  JORNALISTA: {
    id: 'JORNALISTA',
    name: 'Jornalista',
    description: 'Você trabalha com jornalismo.',
    trainedSkills: ['Investigação', 'Diplomacia'],
    power: {
      name: 'Fonte Confiável',
      description: 'Você pode gastar 2 PE para obter informações de fontes confiáveis.',
    },
  },
  LUTADOR: {
    id: 'LUTADOR',
    name: 'Lutador',
    description: 'Você pratica artes marciais ou luta.',
    trainedSkills: ['Luta', 'Fortitude'],
    power: {
      name: 'Golpe Pesado',
      description: 'Quando você acerta um ataque corpo-a-corpo, pode gastar 1 PE para causar +1d6 de dano.',
    },
  },
  MAGNATA: {
    id: 'MAGNATA',
    name: 'Magnata',
    description: 'Você é muito rico.',
    trainedSkills: ['Diplomacia', 'Atualidades'],
    power: {
      name: 'Recursos Ilimitados',
      description: 'Você pode gastar 2 PE para obter itens ou serviços caros temporariamente.',
    },
  },
  MEDICO_LEGISTA: {
    id: 'MEDICO_LEGISTA',
    name: 'Médico Legista',
    description: 'Você trabalha com medicina legal.',
    trainedSkills: ['Medicina', 'Investigação'],
    power: {
      name: 'Análise Forense',
      description: 'Você recebe +2 em testes de Investigação para analisar corpos ou cenas de crime.',
    },
  },
  MENDIGO: {
    id: 'MENDIGO',
    name: 'Mendigo',
    description: 'Você vive nas ruas.',
    trainedSkills: ['Sobrevivência', 'Percepção'],
    power: {
      name: 'Conhecer as Ruas',
      description: 'Você recebe +2 em testes de Percepção e pode encontrar atalhos e esconderijos.',
    },
  },
  MILITAR: {
    id: 'MILITAR',
    name: 'Militar',
    description: 'Você serve nas forças armadas.',
    trainedSkills: ['Tática', 'Pontaria'],
    power: {
      name: 'Disciplina Militar',
      description: 'Você recebe +2 em testes de Vontade e pode ignorar efeitos de medo uma vez por cena.',
    },
  },
  OPERARIO: {
    id: 'OPERARIO',
    name: 'Operário',
    description: 'Você trabalha em fábricas ou construção.',
    trainedSkills: ['Profissão', 'Fortitude'],
    power: {
      name: 'Resistência Física',
      description: 'Você recebe +2 em testes de Fortitude e pode carregar mais peso.',
    },
  },
  POLICIAL: {
    id: 'POLICIAL',
    name: 'Policial',
    description: 'Você é policial.',
    trainedSkills: ['Investigação', 'Intimidação'],
    power: {
      name: 'Autoridade',
      description: 'Você pode gastar 1 PE para intimidar ou convencer pessoas comuns.',
    },
  },
  RELIGIOSO: {
    id: 'RELIGIOSO',
    name: 'Religioso',
    description: 'Você é um líder religioso.',
    trainedSkills: ['Religião', 'Diplomacia'],
    power: {
      name: 'Fé',
      description: 'Você pode gastar 2 PE para rolar novamente um teste de Vontade ou resistir a efeitos mentais.',
    },
  },
  TI: {
    id: 'TI',
    name: 'TI',
    description: 'Você trabalha com tecnologia da informação.',
    trainedSkills: ['Tecnologia', 'Investigação'],
    power: {
      name: 'Hackear',
      description: 'Você pode gastar 1 PE para hackear sistemas eletrônicos ou obter informações digitais.',
    },
  },
  TRABALHADOR_RURAL: {
    id: 'TRABALHADOR_RURAL',
    name: 'Trabalhador Rural',
    description: 'Você trabalha no campo.',
    trainedSkills: ['Sobrevivência', 'Adestramento'],
    power: {
      name: 'Conhecimento do Campo',
      description: 'Você recebe +2 em testes de Sobrevivência e pode encontrar recursos naturais.',
    },
  },
  UNIVERSITARIO: {
    id: 'UNIVERSITARIO',
    name: 'Universitário',
    description: 'Você está na universidade.',
    trainedSkills: ['Atualidades', 'Investigação'],
    power: {
      name: 'Estudar',
      description: 'Você pode gastar 1 PE para rolar novamente um teste de perícia baseada em INT.',
    },
  },
  VETERINARIO: {
    id: 'VETERINARIO',
    name: 'Veterinário',
    description: 'Você é veterinário.',
    trainedSkills: ['Medicina', 'Adestramento'],
    power: {
      name: 'Cuidar de Animais',
      description: 'Você pode curar animais e recebe +2 em testes de Adestramento.',
    },
  },
}

/**
 * Lista todas as origens disponíveis
 */
export function getAllOrigins(): OriginConfig[] {
  return Object.values(ORIGINS)
}

/**
 * Obtém configuração de uma origem específica
 */
export function getOriginConfig(origin: Origin): OriginConfig {
  return ORIGINS[origin]
}

