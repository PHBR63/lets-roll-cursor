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
  isHomebrew?: boolean // Indica se a origem é homebrew (não oficial)
}

/**
 * Dados completos de todas as origens
 */
export const ORIGINS: Record<Origin, OriginConfig> = {
  ACADEMICO: {
    id: 'ACADEMICO',
    name: 'Acadêmico',
    description: 'Você passou anos estudando e pesquisando.',
    trainedSkills: ['Ciências', 'Investigação'],
    power: {
      name: 'Saber em Detalhes',
      description: 'Você pode gastar 2 PE para rolar novamente um teste de perícia baseada em INT.',
    },
  },
  AGENTE_DE_SAUDE: {
    id: 'AGENTE_DE_SAUDE',
    name: 'Agente de Saúde',
    description: 'Você trabalha na área da saúde pública.',
    trainedSkills: ['Intuição', 'Medicina'],
    power: {
      name: 'Primeiros Socorros',
      description: 'Sempre que cura alguém, soma INT nos PV curados (cura mais eficiente).',
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
    trainedSkills: ['Fortitude', 'Profissão'],
    power: {
      name: 'Refeição Reforçada',
      description: 'Comida especial fornece pequenos bônus/recuperações ao grupo (buff de refeição).',
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
    isHomebrew: true,
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
    isHomebrew: true,
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
    isHomebrew: true,
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
    isHomebrew: true,
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
    isHomebrew: true,
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
    isHomebrew: true,
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
    isHomebrew: true,
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
    isHomebrew: true,
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
    isHomebrew: true,
  },
  CULTISTA_ARREPENDIDO: {
    id: 'CULTISTA_ARREPENDIDO',
    name: 'Cultista Arrependido',
    description: 'Você já foi parte de um culto, mas se arrependeu.',
    trainedSkills: ['Ocultismo', 'Religião'],
    power: {
      name: 'Marcas do Outro Lado',
      description: 'Ganha mais PE e/ou efeitos ligados a ritual e resistência paranormal, ao custo de impacto na SAN.',
    },
  },
  DESGARRADO: {
    id: 'DESGARRADO',
    name: 'Desgarrado',
    description: 'Você viveu à margem da sociedade.',
    trainedSkills: ['Fortitude', 'Sobrevivência'],
    power: {
      name: 'Resiliência',
      description: 'Mais resistente a condições físicas e ambientes hostis; reduz penalidades de terreno e efeitos de clima/fome.',
    },
  },
  EXECUTIVO: {
    id: 'EXECUTIVO',
    name: 'Executivo',
    description: 'Você trabalha em cargos executivos ou de gestão.',
    trainedSkills: ['Diplomacia', 'Profissão'],
    power: {
      name: 'Otimização',
      description: 'Ganha bônus em testes de planejamento, logística e pode reduzir tempo/custo de certas ações da equipe.',
    },
  },
  INVESTIGADOR: {
    id: 'INVESTIGADOR',
    name: 'Investigador',
    description: 'Você trabalha como investigador particular ou policial.',
    trainedSkills: ['Investigação', 'Percepção'],
    power: {
      name: 'Faro para Pistas',
      description: 'Ganha bônus e re-rolagens ao buscar pistas e pode encontrar mais informações que outros agentes.',
    },
  },
  MERCENARIO: {
    id: 'MERCENARIO',
    name: 'Mercenário',
    description: 'Você trabalha como mercenário ou soldado de aluguel.',
    trainedSkills: ['Iniciativa', 'Intimidação'],
    power: {
      name: 'Posição de Combate',
      description: 'Ganha bônus em iniciativa e em situações em que é pago/contratado, além de algumas vantagens táticas.',
    },
  },
  SERVIDOR_PUBLICO: {
    id: 'SERVIDOR_PUBLICO',
    name: 'Servidor Público',
    description: 'Você trabalha no serviço público.',
    trainedSkills: ['Intuição', 'Vontade'],
    power: {
      name: 'Espírito Cívico',
      description: 'Bônus em interações com órgãos oficiais, processos burocráticos e resistência em situações de pressão institucional.',
    },
  },
  TEORICO_DA_CONSPIRACAO: {
    id: 'TEORICO_DA_CONSPIRACAO',
    name: 'Teórico da Conspiração',
    description: 'Você acredita em teorias da conspiração e está sempre investigando.',
    trainedSkills: ['Investigação', 'Ocultismo'],
    power: {
      name: 'Eu Já Sabia',
      description: 'Pode gastar PE para "puxar da cartola" informação prévia sobre algo, recebendo pistas extras ou bônus situacionais.',
    },
  },
  TRAMBIQUEIRO: {
    id: 'TRAMBIQUEIRO',
    name: 'Trambiqueiro',
    description: 'Você é um golpista ou estelionatário.',
    trainedSkills: ['Crime', 'Enganação'],
    power: {
      name: 'Impostor',
      description: 'Extremamente bom em golpes e identidades falsas, com bônus fortes para enganar e cometer delitos sem ser pego.',
    },
  },
  VITIMA: {
    id: 'VITIMA',
    name: 'Vítima',
    description: 'Você foi vítima de um evento paranormal traumático.',
    trainedSkills: ['Reflexos', 'Vontade'],
    power: {
      name: 'Cicatrizes Psicológicas',
      description: 'Transforma trauma em dureza: ganha resistências ou bônus contra efeitos de medo, choque e manipulação mental.',
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

