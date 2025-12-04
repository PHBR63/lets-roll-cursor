/**
 * Fixtures para dados de teste
 */

/**
 * Dados de usuário para testes
 */
export const testUsers = {
  master: {
    username: 'testmaster',
    email: 'master@test.com',
    password: 'test123456',
    confirmPassword: 'test123456',
  },
  player: {
    username: 'testplayer',
    email: 'player@test.com',
    password: 'test123456',
    confirmPassword: 'test123456',
  },
  admin: {
    username: 'testadmin',
    email: 'admin@test.com',
    password: 'test123456',
    confirmPassword: 'test123456',
  },
}

/**
 * Dados de campanha para testes
 */
export const testCampaigns = {
  ordemParanormal: {
    name: 'Campanha de Teste - Ordem Paranormal',
    description: 'Uma campanha de teste para o sistema Ordem Paranormal',
    system_rpg: 'ORDEM_PARANORMAL',
  },
  dnd: {
    name: 'Campanha de Teste - D&D',
    description: 'Uma campanha de teste para D&D',
    system_rpg: 'DND',
  },
}

/**
 * Dados de personagem para testes
 */
export const testCharacters = {
  combatente: {
    name: 'Personagem Combatente',
    class: 'COMBATENTE',
    attributes: {
      agi: 2,
      for: 3,
      int: 1,
      pre: 2,
      vig: 3,
    },
  },
  especialista: {
    name: 'Personagem Especialista',
    class: 'ESPECIALISTA',
    attributes: {
      agi: 2,
      for: 1,
      int: 3,
      pre: 2,
      vig: 2,
    },
  },
  ocultista: {
    name: 'Personagem Ocultista',
    class: 'OCULTISTA',
    attributes: {
      agi: 1,
      for: 1,
      int: 3,
      pre: 3,
      vig: 2,
    },
  },
}

/**
 * Dados de item para testes
 */
export const testItems = {
  weapon: {
    name: 'Espada Longa',
    type: 'WEAPON',
    description: 'Uma espada longa comum',
    rarity: 'COMMON',
  },
  armor: {
    name: 'Armadura de Couro',
    type: 'ARMOR',
    description: 'Armadura de couro básica',
    rarity: 'COMMON',
  },
  consumable: {
    name: 'Poção de Cura',
    type: 'CONSUMABLE',
    description: 'Restaura 2d4+2 PV',
    rarity: 'COMMON',
  },
}

/**
 * Dados de habilidade para testes
 */
export const testAbilities = {
  combat: {
    name: 'Ataque Poderoso',
    description: 'Aumenta o dano do próximo ataque',
    type: 'COMBAT',
    cost: 2,
  },
  utility: {
    name: 'Investigação Rápida',
    description: 'Ganha vantagem em testes de investigação',
    type: 'UTILITY',
    cost: 1,
  },
}

/**
 * Dados de sessão para testes
 */
export const testSessions = {
  active: {
    name: 'Sessão Ativa de Teste',
    description: 'Uma sessão de jogo ativa para testes',
  },
  planned: {
    name: 'Sessão Planejada',
    description: 'Uma sessão planejada para o futuro',
    scheduled_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
}

/**
 * Dados de rolagem de dados para testes
 */
export const testDiceRolls = {
  basic: {
    quantity: 2,
    faces: 20,
  },
  skillTest: {
    skillName: 'Luta',
    difficulty: 15,
  },
  attack: {
    skillName: 'Luta',
    targetDefense: 12,
  },
}

/**
 * Gera dados aleatórios para testes
 */
export const generateTestData = {
  /**
   * Gera email único para testes
   */
  uniqueEmail: (prefix = 'test') => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(7)}@test.com`
  },

  /**
   * Gera username único para testes
   */
  uniqueUsername: (prefix = 'testuser') => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(7)}`
  },

  /**
   * Gera nome de campanha único
   */
  uniqueCampaignName: (prefix = 'Campanha') => {
    return `${prefix} ${Date.now()}`
  },

  /**
   * Gera nome de personagem único
   */
  uniqueCharacterName: (prefix = 'Personagem') => {
    return `${prefix} ${Date.now()}`
  },
}

