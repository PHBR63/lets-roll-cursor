import { characterService } from '../characterService'
import { supabase } from '../../config/supabase'
import { ordemParanormalService } from '../ordemParanormalService'
import * as cacheModule from '../cache'
import { characterAttributesService } from '../character/characterAttributesService'
import { characterClassAbilitiesService } from '../character/characterClassAbilitiesService'

// Mock do Supabase
jest.mock('../../config/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}))

// Mock do ordemParanormalService
jest.mock('../ordemParanormalService', () => ({
  ordemParanormalService: {
    calculateMaxPV: jest.fn(),
    calculateMaxSAN: jest.fn(),
    calculateMaxPE: jest.fn(),
    calculateDefense: jest.fn(),
    calculateSkillBonus: jest.fn(),
    applyCondition: jest.fn(),
    calculateConditionPenalties: jest.fn(),
    calculatePERecovery: jest.fn(),
    rollAttributeTest: jest.fn(),
    rollAttack: jest.fn(),
    isDying: jest.fn(),
    isInjured: jest.fn(),
    isInsane: jest.fn(),
    validateCreationAttributes: jest.fn(),
    canUseSkillTraining: jest.fn(),
  },
}))

// Mock do cache
jest.mock('../cache', () => ({
  getCache: jest.fn(),
  setCache: jest.fn(),
  deleteCache: jest.fn(),
  deleteCachePattern: jest.fn(),
  getCharacterCacheKey: jest.fn((filters: any) => {
    if (filters.characterId) return `characters:${filters.characterId}`
    if (filters.campaignId) return `characters:campaign:${filters.campaignId}`
    if (filters.userId) return `characters:user:${filters.userId}`
    return 'characters:all'
  }),
}))

// Mock dos serviços especializados
jest.mock('../character/characterInventoryService', () => ({
  characterInventoryService: {
    getCharacterInventory: (jest.fn() as any).mockResolvedValue([]),
    addItemToCharacter: jest.fn(),
    removeItemFromCharacter: jest.fn(),
    equipItem: jest.fn(),
  },
}))

jest.mock('../character/characterAbilitiesService', () => ({
  characterAbilitiesService: {
    getCharacterAbilities: (jest.fn() as any).mockResolvedValue([]),
    addAbilityToCharacter: jest.fn(),
    removeAbilityFromCharacter: jest.fn(),
  },
}))

jest.mock('../character/characterClassAbilitiesService', () => ({
  characterClassAbilitiesService: {
    grantClassAbilities: (jest.fn() as any).mockResolvedValue(undefined),
    getUnlockedClassAbilities: jest.fn(),
    getNewlyUnlockedClassAbilities: jest.fn(),
  },
}))

jest.mock('../character/characterAttributesService', () => ({
  characterAttributesService: {
    updateAttributes: jest.fn(),
    updateSkills: jest.fn(),
    rollSkillTest: jest.fn(),
    rollAttack: jest.fn(),
    rollResistance: jest.fn(),
  },
}))

describe('characterService - Sistema Ordem Paranormal', () => {
  const mockCharacter = {
    id: 'char-123',
    campaign_id: 'camp-123',
    user_id: 'user-123',
    name: 'Test Character',
    class: 'COMBATENTE',
    attributes: { agi: 2, for: 1, int: 0, pre: 1, vig: 2 },
    stats: {
      pv: { current: 20, max: 20 },
      san: { current: 12, max: 12 },
      pe: { current: 2, max: 2 },
      nex: 5,
    },
    skills: {
      Luta: { attribute: 'FOR', training: 'TRAINED', bonus: 5 },
    },
    conditions: [],
    defense: 12,
  }

  beforeEach(() => {
    jest.clearAllMocks()
      ; (cacheModule.getCache as jest.Mock).mockResolvedValue(null)
      ; (cacheModule.setCache as jest.Mock).mockResolvedValue(undefined)
      ; (cacheModule.deleteCache as jest.Mock).mockResolvedValue(undefined)
      ; (cacheModule.deleteCachePattern as jest.Mock).mockResolvedValue(undefined)
      ; (ordemParanormalService.validateCreationAttributes as jest.Mock).mockReturnValue(undefined)
      ; (ordemParanormalService.canUseSkillTraining as jest.Mock).mockReturnValue(undefined)
  })

  describe('getCharacters', () => {
    it('deve buscar personagens com filtro por campaignId', async () => {
      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        order: (jest.fn() as any).mockResolvedValue({
          data: [mockCharacter],
          error: null,
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const result = await characterService.getCharacters({ campaignId: 'camp-123' })

      expect(mockQuery.eq).toHaveBeenCalledWith('campaign_id', 'camp-123')
      expect(result).toEqual([mockCharacter])
      expect(cacheModule.setCache).toHaveBeenCalled()
    })

    it('deve buscar personagens com filtro por userId', async () => {
      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        order: (jest.fn() as any).mockResolvedValue({
          data: [mockCharacter],
          error: null,
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const result = await characterService.getCharacters({ userId: 'user-123' })

      expect(mockQuery.eq).toHaveBeenCalledWith('user_id', 'user-123')
      expect(result).toEqual([mockCharacter])
    })

    it('deve buscar personagens com filtro de campanha e usuário combinados', async () => {
      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        order: (jest.fn() as any).mockResolvedValue({
          data: [mockCharacter],
          error: null,
        }),
      }
        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      await characterService.getCharacters({ campaignId: 'camp-123', userId: 'user-123' })

      // Deve chamar .eq duas vezes
      expect(mockQuery.eq).toHaveBeenCalledWith('campaign_id', 'camp-123')
      expect(mockQuery.eq).toHaveBeenCalledWith('user_id', 'user-123')
    })

    it('deve buscar todos os personagens se sem filtros', async () => {
      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        order: (jest.fn() as any).mockResolvedValue({
          data: [mockCharacter],
          error: null,
        }),
      }
        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      await characterService.getCharacters({})

      expect(mockQuery.eq).not.toHaveBeenCalled()
    })

    it('deve retornar do cache se disponível', async () => {
      const cachedData = [mockCharacter]
        ; (cacheModule.getCache as jest.Mock).mockResolvedValue(cachedData)

      const result = await characterService.getCharacters({ campaignId: 'camp-123' })

      expect(result).toEqual(cachedData)
      expect(supabase.from).not.toHaveBeenCalled()
    })

    it('deve lançar erro se busca falhar', async () => {
      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        order: (jest.fn() as any).mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      await expect(
        characterService.getCharacters({ campaignId: 'camp-123' })
      ).rejects.toThrow('Erro ao buscar personagens')
    })
  })

  describe('createCharacter', () => {
    it('deve criar personagem com valores padrão', async () => {
      const mockQuery = {
        insert: (jest.fn() as any).mockReturnThis(),
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: mockCharacter,
          error: null,
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)
        ; (ordemParanormalService.calculateMaxPV as jest.Mock).mockReturnValue(20)
        ; (ordemParanormalService.calculateMaxSAN as jest.Mock).mockReturnValue(12)
        ; (ordemParanormalService.calculateMaxPE as jest.Mock).mockReturnValue(2)
        ; (ordemParanormalService.calculateDefense as jest.Mock).mockReturnValue(12)

      const result = await characterService.createCharacter('user-123', {
        name: 'New Character',
        campaignId: 'camp-123',
        class: 'COMBATENTE',
      })

      expect(result).toEqual(mockCharacter)
      expect(ordemParanormalService.calculateMaxPV).toHaveBeenCalled()
      expect(cacheModule.deleteCachePattern).toHaveBeenCalled()
    })

    it('deve validar soma de atributos na criação', async () => {
      (ordemParanormalService.validateCreationAttributes as jest.Mock).mockImplementation(() => {
        throw new Error('Soma de atributos inválida')
      })

      await expect(
        characterService.createCharacter('user-123', {
          name: 'New Character',
          campaignId: 'camp-123',
          class: 'COMBATENTE',
          attributes: { agi: 3, for: 3, int: 3, pre: 3, vig: 3 }, // Soma = 15, deveria ser 9
        })
      ).rejects.toThrow('Soma de atributos inválida')
    })

    it('deve validar máximo de atributo na criação', async () => {
      (ordemParanormalService.validateCreationAttributes as jest.Mock).mockImplementation(() => {
        throw new Error('Nenhum atributo pode exceder 3')
      })

      await expect(
        characterService.createCharacter('user-123', {
          name: 'New Character',
          campaignId: 'camp-123',
          class: 'COMBATENTE',
          attributes: { agi: 4, for: 1, int: 1, pre: 1, vig: 1 }, // AGI > 3
        })
      ).rejects.toThrow('Nenhum atributo pode exceder 3')
    })

    it('deve validar apenas um atributo pode ser 0', async () => {
      (ordemParanormalService.validateCreationAttributes as jest.Mock).mockImplementation(() => {
        throw new Error('Apenas um atributo pode ser reduzido para 0')
      })

      await expect(
        characterService.createCharacter('user-123', {
          name: 'New Character',
          campaignId: 'camp-123',
          class: 'COMBATENTE',
          attributes: { agi: 0, for: 0, int: 3, pre: 3, vig: 3 }, // Dois atributos em 0
        })
      ).rejects.toThrow('Apenas um atributo pode ser reduzido para 0')
    })

    it('deve aceitar atributos válidos com um zero', async () => {
      const mockQuery = {
        insert: (jest.fn() as any).mockReturnThis(),
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: mockCharacter,
          error: null,
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)
        ; (ordemParanormalService.calculateMaxPV as jest.Mock).mockReturnValue(20)
        ; (ordemParanormalService.calculateMaxSAN as jest.Mock).mockReturnValue(12)
        ; (ordemParanormalService.calculateMaxPE as jest.Mock).mockReturnValue(2)
        ; (ordemParanormalService.calculateDefense as jest.Mock).mockReturnValue(12)

      const result = await characterService.createCharacter('user-123', {
        name: 'New Character',
        campaignId: 'camp-123',
        class: 'COMBATENTE',
        attributes: { agi: 0, for: 2, int: 2, pre: 2, vig: 3 }, // Soma = 9, um zero
      })

      expect(result).toBeDefined()
    })

    it('deve criar personagem com atributos customizados', async () => {
      const mockQuery = {
        insert: (jest.fn() as any).mockReturnThis(),
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: mockCharacter,
          error: null,
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)
        ; (ordemParanormalService.calculateMaxPV as jest.Mock).mockReturnValue(25)
        ; (ordemParanormalService.calculateMaxSAN as jest.Mock).mockReturnValue(15)
        ; (ordemParanormalService.calculateMaxPE as jest.Mock).mockReturnValue(5)
        ; (ordemParanormalService.calculateDefense as jest.Mock).mockReturnValue(13)

      await characterService.createCharacter('user-123', {
        name: 'New Character',
        campaignId: 'camp-123',
        class: 'ESPECIALISTA',
        attributes: { agi: 3, for: 2, int: 1, pre: 2, vig: 3 },
        nex: 10,
      })

      expect(ordemParanormalService.calculateMaxPV).toHaveBeenCalledWith('ESPECIALISTA', 3, 10)
    })

    it('deve rejeitar perícia COMPETENT com NEX < 35', async () => {
      // Mock para retornar false (indicar invalido)
      ; (ordemParanormalService.canUseSkillTraining as jest.Mock).mockReturnValue(false)

      await expect(
        characterService.createCharacter('user-123', {
          name: 'New Character',
          campaignId: 'camp-123',
          class: 'COMBATENTE',
          attributes: { agi: 2, for: 2, int: 2, pre: 2, vig: 1 },
          skills: {
            Luta: { attribute: 'FOR', training: 'COMPETENT', bonus: 10 },
          } as any,
          nex: 30, // NEX < 35
        })
      ).rejects.toThrow(/Nível de treinamento COMPETENT não é permitido/)
    })

    it('deve lançar erro se criação falhar', async () => {
      const mockQuery = {
        insert: (jest.fn() as any).mockReturnThis(),
        select: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)
        ; (ordemParanormalService.calculateMaxPV as jest.Mock).mockReturnValue(20)
        ; (ordemParanormalService.calculateMaxSAN as jest.Mock).mockReturnValue(12)
        ; (ordemParanormalService.calculateMaxPE as jest.Mock).mockReturnValue(2)
        ; (ordemParanormalService.calculateDefense as jest.Mock).mockReturnValue(12)

      await expect(
        characterService.createCharacter('user-123', {
          name: 'New Character',
          campaignId: 'camp-123',
        })
      ).rejects.toThrow('Erro ao criar personagem')
    })

    it('deve rejeitar perícia EXPERT com NEX < 70', async () => {
      // Usar spyOn para garantir que o mock seja aplicado corretamente
      const spy = jest.spyOn(ordemParanormalService, 'canUseSkillTraining').mockReturnValue(false)

      await expect(
        characterService.createCharacter('user-123', {
          name: 'New Character',
          campaignId: 'camp-123',
          class: 'COMBATENTE',
          attributes: { agi: 2, for: 2, int: 2, pre: 2, vig: 1 },
          skills: {
            Luta: { attribute: 'FOR', training: 'EXPERT', bonus: 15 },
          } as any,
          nex: 50, // NEX < 70
        })
      ).rejects.toThrow(/Nível de treinamento EXPERT não é permitido/)

      expect(spy).toHaveBeenCalledWith('EXPERT', 50)
    })

    it('deve aceitar perícia COMPETENT com NEX >= 35', async () => {
      const mockQuery = {
        insert: (jest.fn() as any).mockReturnThis(),
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: mockCharacter,
          error: null,
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)
        ; (ordemParanormalService.calculateMaxPV as jest.Mock).mockReturnValue(20)
        ; (ordemParanormalService.calculateMaxSAN as jest.Mock).mockReturnValue(12)
        ; (ordemParanormalService.calculateMaxPE as jest.Mock).mockReturnValue(2)
        ; (ordemParanormalService.canUseSkillTraining as jest.Mock).mockReturnValue(true)
        ; (ordemParanormalService.calculateDefense as jest.Mock).mockReturnValue(12)

      const result = await characterService.createCharacter('user-123', {
        name: 'New Character',
        campaignId: 'camp-123',
        class: 'COMBATENTE',
        attributes: { agi: 2, for: 2, int: 2, pre: 2, vig: 1 },
        skills: {
          Luta: { attribute: 'FOR', training: 'COMPETENT', bonus: 10 },
        } as any,
        nex: 35, // NEX >= 35
      })

      expect(result).toBeDefined()
    })

    it('deve rejeitar perícia EXPERT com NEX < 70', async () => {
      (ordemParanormalService.canUseSkillTraining as jest.Mock).mockReturnValue(undefined)

      await expect(
        characterService.createCharacter('user-123', {
          name: 'New Character',
          campaignId: 'camp-123',
          class: 'COMBATENTE',
          attributes: { agi: 2, for: 2, int: 2, pre: 2, vig: 1 },
          skills: {
            Luta: { attribute: 'FOR', training: 'EXPERT', bonus: 15 },
          } as any,
          nex: 50, // NEX < 70
        })
      ).rejects.toThrow('Nível de treinamento EXPERT não é permitido para NEX 50%')
    })

    it('deve aceitar perícia EXPERT com NEX >= 70', async () => {
      const mockQuery = {
        insert: (jest.fn() as any).mockReturnThis(),
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: mockCharacter,
          error: null,
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)
        ; (ordemParanormalService.calculateMaxPV as jest.Mock).mockReturnValue(20)
        ; (ordemParanormalService.calculateMaxSAN as jest.Mock).mockReturnValue(12)
        ; (ordemParanormalService.calculateMaxPE as jest.Mock).mockReturnValue(2)
        ; (ordemParanormalService.calculateDefense as jest.Mock).mockReturnValue(12)
        ; (ordemParanormalService.canUseSkillTraining as jest.Mock).mockReturnValue(true)

      const result = await characterService.createCharacter('user-123', {
        name: 'New Character',
        campaignId: 'camp-123',
        class: 'COMBATENTE',
        attributes: { agi: 2, for: 2, int: 2, pre: 2, vig: 1 },
        skills: {
          Luta: { attribute: 'FOR', training: 'EXPERT', bonus: 15 },
        } as any,
        nex: 70, // NEX >= 70
      })

      expect(result).toBeDefined()
    })

    it('não deve permitir que o mestre da campanha crie personagem', async () => {
      const mockQuery = {
        insert: (jest.fn() as any).mockReturnThis(),
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any)
          .mockResolvedValueOnce({ data: { id: 'camp-123' }, error: null }) // Campanha existe
          .mockResolvedValueOnce({ data: { role: 'master' }, error: null }), // Usuário é mestre
      }
        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      await expect(
        characterService.createCharacter('user-123', {
          name: 'Master Char',
          campaignId: 'camp-123',
          class: 'COMBATENTE',
        })
      ).rejects.toThrow('Mestres não podem criar personagens')
    })

    it('deve criar personagem sem campanha (standalone)', async () => {
      const mockQuery = {
        insert: (jest.fn() as any).mockReturnThis(),
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(), // Não deve ser chamado para validação de campanha
        single: (jest.fn() as any).mockResolvedValue({ data: mockCharacter, error: null }),
      }
        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      await characterService.createCharacter('user-123', {
        name: 'Standalone Char',
        class: 'OCULTISTA',
      })

      // Verifica que inseriu com campaign_id null (ou undefined no objeto enviado)
      expect(mockQuery.insert).toHaveBeenCalledWith(expect.objectContaining({
        campaign_id: null,
      }))
    })

    it('deve usar NEX padrão (5) se não informado', async () => {
      const mockQuery = {
        insert: (jest.fn() as any).mockReturnThis(),
        select: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({ data: mockCharacter, error: null }),
      }
        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      await characterService.createCharacter('user-123', {
        name: 'Default NEX Char',
        class: 'COMBATENTE',
      })

      // Verifica cálculo de recursos usando NEX 5
      expect(ordemParanormalService.calculateMaxPV).toHaveBeenCalledWith('COMBATENTE', expect.any(Number), 5)
    })

    it('deve continuar criação mesmo se falhar ao conceder habilidades', async () => {
      const mockQuery = {
        insert: (jest.fn() as any).mockReturnThis(),
        select: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({ data: mockCharacter, error: null }),
      }
        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      // Mock das habilidades falhando
      const grantSpy = jest.spyOn(characterClassAbilitiesService, 'grantClassAbilities')
        .mockRejectedValue(new Error('Erro ao conceder habilidades'))

      const result = await characterService.createCharacter('user-123', {
        name: 'Faulty Abilities Char',
        class: 'COMBATENTE',
      })

      expect(result).toBeDefined()
      expect(grantSpy).toHaveBeenCalled()
      // O erro deve ser logado, mas não relançado
    })
  })

  describe('getCharacterById', () => {
    it('deve buscar personagem por ID', async () => {
      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: mockCharacter,
          error: null,
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const result = await characterService.getCharacterById('char-123')

      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'char-123')
      expect(result).toHaveProperty('inventory')
      expect(result).toHaveProperty('abilities')
      expect(cacheModule.setCache).toHaveBeenCalled()
    })

    it('deve retornar do cache se disponível', async () => {
      const cachedData = { ...mockCharacter, inventory: [], abilities: [] }
        ; (cacheModule.getCache as jest.Mock).mockResolvedValue(cachedData)

      const result = await characterService.getCharacterById('char-123')

      expect(result).toEqual(cachedData)
      expect(supabase.from).not.toHaveBeenCalled()
    })

    it('deve lançar erro se personagem não encontrado', async () => {
      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: null,
          error: { message: 'Not found', code: 'PGRST116' },
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      await expect(characterService.getCharacterById('char-999')).rejects.toThrow(
        'Erro ao buscar personagem'
      )
    })
  })

  describe('updateCharacter', () => {
    it('deve atualizar campos básicos do personagem', async () => {
      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: mockCharacter,
          error: null,
        }),
        update: (jest.fn() as any).mockReturnThis(),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const result = await characterService.updateCharacter('char-123', {
        name: 'Updated Name',
        path: 'New Path',
      })

      expect(mockQuery.update).toHaveBeenCalled()
      expect(cacheModule.deleteCache).toHaveBeenCalled()
    })

    it('deve usar serviço especializado para atualizar atributos', async () => {
      const updateAttributesSpy = jest
        .spyOn(characterService, 'updateAttributes' as any)
        .mockResolvedValue(mockCharacter)

      await characterService.updateCharacter('char-123', {
        attributes: { agi: 3, for: 2, int: 1, pre: 2, vig: 3 },
      })

      expect(updateAttributesSpy).toHaveBeenCalledWith('char-123', {
        agi: 3,
        for: 2,
        int: 1,
        pre: 2,
        vig: 3,
      })

      updateAttributesSpy.mockRestore()
    })

    it('deve usar serviço especializado para atualizar skills', async () => {
      const updateSkillsSpy = jest
        .spyOn(characterService, 'updateSkills' as any)
        .mockResolvedValue(mockCharacter)

      await characterService.updateCharacter('char-123', {
        skills: { Luta: { attribute: 'FOR', training: 'COMPETENT' } } as any,
      })

      expect(updateSkillsSpy).toHaveBeenCalled()
      updateSkillsSpy.mockRestore()
    })

    it('deve lançar erro se personagem não encontrado', async () => {
      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: null,
          error: { message: 'Not found' },
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      await expect(
        characterService.updateCharacter('char-999', { name: 'New Name' })
      ).rejects.toThrow('Erro ao atualizar personagem')
    })
  })

  describe('deleteCharacter', () => {
    it('deve deletar personagem e invalidar cache', async () => {
      const mockSelectQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: { campaign_id: 'camp-123', user_id: 'user-123' },
          error: null,
        }),
      }

      const mockDeleteQuery = {
        delete: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockResolvedValue({ error: null }),
      }

        ; (supabase.from as jest.Mock)
          .mockReturnValueOnce(mockSelectQuery)
          .mockReturnValueOnce(mockDeleteQuery)

      await characterService.deleteCharacter('char-123')

      expect(mockDeleteQuery.eq).toHaveBeenCalledWith('id', 'char-123')
      expect(cacheModule.deleteCache).toHaveBeenCalled()
      expect(cacheModule.deleteCachePattern).toHaveBeenCalled()
    })

    it('deve lançar erro se deleção falhar', async () => {
      const mockSelectQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: { campaign_id: 'camp-123', user_id: 'user-123' },
          error: null,
        }),
      }

      const mockDeleteQuery = {
        delete: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockResolvedValue({ error: { message: 'Delete failed' } }),
      }

        ; (supabase.from as jest.Mock)
          .mockReturnValueOnce(mockSelectQuery)
          .mockReturnValueOnce(mockDeleteQuery)

      await expect(characterService.deleteCharacter('char-123')).rejects.toThrow(
        'Erro ao deletar personagem'
      )
    })
  })

  describe('updateAttributes', () => {
    it('deve atualizar atributos e recalcular recursos', async () => {
      const newAttributes = { agi: 3, for: 2, int: 1, pre: 2, vig: 3 }
      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({ data: mockCharacter, error: null }),
        update: (jest.fn() as any).mockReturnThis(),
      }
        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      await characterService.updateAttributes('char-123', newAttributes)

      expect(characterAttributesService.updateAttributes).toHaveBeenCalledWith('char-123', newAttributes)
    })

    it('deve lidar com troca de origem (remover/adicionar perícias)', async () => {
      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: { ...mockCharacter, origin: 'Artist' },
          error: null
        }),
        update: (jest.fn() as any).mockReturnThis(),
      }
        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      // Mocks do originService
      const removeSpy = jest.spyOn(require('../originService').originService, 'removeOriginSkills')
        .mockReturnValue({})
      const applySpy = jest.spyOn(require('../originService').originService, 'applyOriginSkills')
        .mockReturnValue({ 'NewSkill': { training: 'TRAINED' } })

      await characterService.updateCharacter('char-123', {
        origin: 'Athlete',
      })

      expect(removeSpy).toHaveBeenCalledWith('Artist', expect.anything())
      expect(applySpy).toHaveBeenCalledWith('Athlete', expect.anything())
      expect(mockQuery.update).toHaveBeenCalledWith(expect.objectContaining({
        origin: 'Athlete',
        skills: { 'NewSkill': { training: 'TRAINED' } }
      }))
    })

    it('deve falhar se erro ao buscar personagem para atualização', async () => {
      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: null,
          error: { message: 'DB Error fetching' }
        }),
      }
        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      await expect(
        characterService.updateCharacter('char-123', { name: 'Fail' })
      ).rejects.toThrow('Erro ao atualizar personagem')
    })

    it('deve atualizar stats e xp diretamente', async () => {
      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({ data: mockCharacter, error: null }),
        update: (jest.fn() as any).mockReturnThis(),
      }
        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      await characterService.updateCharacter('char-123', {
        stats: { someStat: 10 } as any,
        level: 2,
        xp: 100
      })

      expect(mockQuery.update).toHaveBeenCalledWith(expect.objectContaining({
        stats: { someStat: 10 },
        level: 2,
        xp: 100
      }))
    })
  })


  describe('updateSkills', () => {
    it('deve atualizar perícias e recalcular bônus', async () => {
      const newSkills = {
        Luta: { attribute: 'FOR', training: 'COMPETENT' },
        Pontaria: { attribute: 'AGI', training: 'TRAINED' },
      }

      const mockQuery = {
        update: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        select: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: { ...mockCharacter, skills: newSkills },
          error: null,
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)
        ; (ordemParanormalService.calculateSkillBonus as jest.Mock)
          .mockReturnValueOnce(10) // COMPETENT
          .mockReturnValueOnce(5) // TRAINED

      await characterService.updateSkills('char-123', newSkills)

      expect(characterAttributesService.updateSkills).toHaveBeenCalledWith('char-123', newSkills)
    })
  })

  describe('applyCondition', () => {
    it('deve aplicar condição usando ordemParanormalService', async () => {
      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({ data: mockCharacter, error: null }),
        update: (jest.fn() as any).mockReturnThis(),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const mockApplyResult = {
        newConditions: ['ABALADO'],
        effects: {
          message: 'Condição aplicada',
          autoConditions: [],
          removeConditions: [],
        },
      }

        ; (ordemParanormalService.applyCondition as jest.Mock).mockReturnValue(mockApplyResult)

      const result = await characterService.applyCondition('char-123', 'ABALADO')

      expect(ordemParanormalService.applyCondition).toHaveBeenCalledWith('ABALADO', [])
      expect(result.effects).toBeDefined()
    })

    it('deve aplicar condição com condições derivadas', async () => {
      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        single: jest.fn()
          .mockResolvedValueOnce({ data: mockCharacter, error: null })
          .mockResolvedValueOnce({
            data: { ...mockCharacter, conditions: ['MORRENDO', 'INCONSCIENTE'] },
            error: null,
          }),
        update: (jest.fn() as any).mockReturnThis(),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const mockApplyResult = {
        newConditions: ['MORRENDO', 'INCONSCIENTE'],
        effects: {
          message: 'Personagem está morrendo!',
          autoConditions: ['INCONSCIENTE'],
          removeConditions: [],
        },
      }

        ; (ordemParanormalService.applyCondition as jest.Mock).mockReturnValue(mockApplyResult)

      const result = await characterService.applyCondition('char-123', 'MORRENDO')

      expect(result.character.conditions).toContain('MORRENDO')
      expect(result.character.conditions).toContain('INCONSCIENTE')
    })
  })

  describe('removeCondition', () => {
    it('deve remover condição do personagem', async () => {
      const characterWithCondition = {
        ...mockCharacter,
        conditions: ['ABALADO', 'CEGO'],
      }

      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({ data: characterWithCondition, error: null }),
        update: (jest.fn() as any).mockReturnThis(),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const result = await characterService.removeCondition('char-123', 'ABALADO')

      expect(mockQuery.update).toHaveBeenCalledWith(
        expect.objectContaining({
          conditions: ['CEGO'],
        })
      )
    })
  })

  describe('updateNEX', () => {
    it('deve atualizar NEX e recalcular recursos', async () => {
      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({ data: mockCharacter, error: null }),
        update: (jest.fn() as any).mockReturnThis(),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

        ; (ordemParanormalService.calculateMaxPV as jest.Mock).mockReturnValue(35)
        ; (ordemParanormalService.calculateMaxSAN as jest.Mock).mockReturnValue(18)
        ; (ordemParanormalService.calculateMaxPE as jest.Mock).mockReturnValue(8)

      await characterService.updateNEX('char-123', 10)

      expect(ordemParanormalService.calculateMaxPV).toHaveBeenCalledWith('COMBATENTE', 2, 10)
      expect(ordemParanormalService.calculateMaxSAN).toHaveBeenCalledWith('COMBATENTE', 10)
      expect(ordemParanormalService.calculateMaxPE).toHaveBeenCalledWith('COMBATENTE', 1, 10)
    })

    it('deve lançar erro se NEX fora do range', async () => {
      await expect(characterService.updateNEX('char-123', 100)).rejects.toThrow(
        'NEX deve estar entre 0 e 99'
      )

      await expect(characterService.updateNEX('char-123', -1)).rejects.toThrow(
        'NEX deve estar entre 0 e 99'
      )
    })
  })

  describe('updatePV', () => {
    it('deve atualizar PV como valor absoluto', async () => {
      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({ data: mockCharacter, error: null }),
        update: (jest.fn() as any).mockReturnThis(),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)
        ; (ordemParanormalService.isDying as jest.Mock).mockReturnValue(false)
        ; (ordemParanormalService.isInjured as jest.Mock).mockReturnValue(false)

      const result = await characterService.updatePV('char-123', 15, false)

      expect(result.isDying).toBe(false)
      expect(result.isInjured).toBe(false)
    })

    it('deve atualizar PV como delta', async () => {
      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({ data: mockCharacter, error: null }),
        update: (jest.fn() as any).mockReturnThis(),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)
        ; (ordemParanormalService.isDying as jest.Mock).mockReturnValue(false)
        ; (ordemParanormalService.isInjured as jest.Mock).mockReturnValue(false)

      await characterService.updatePV('char-123', -5, true)

      // PV atual (20) - 5 = 15
      expect(mockQuery.update).toHaveBeenCalled()
    })

    it('deve aplicar condição Morrendo se PV <= 0', async () => {
      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({ data: mockCharacter, error: null }),
        update: (jest.fn() as any).mockReturnThis(),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)
        ; (ordemParanormalService.isDying as jest.Mock).mockReturnValue(true)
        ; (ordemParanormalService.isInjured as jest.Mock).mockReturnValue(true)
        ; (ordemParanormalService.applyCondition as jest.Mock).mockReturnValue({
          newConditions: ['MORRENDO', 'INCONSCIENTE'],
          effects: { message: 'Morrendo', autoConditions: ['INCONSCIENTE'], removeConditions: [] },
        })

      const result = await characterService.updatePV('char-123', 0, false)

      expect(result.isDying).toBe(true)
      expect(ordemParanormalService.applyCondition).toHaveBeenCalledWith('MORRENDO', [])
    })

    it('deve remover Morrendo se PV > 0', async () => {
      const characterDying = {
        ...mockCharacter,
        conditions: ['MORRENDO', 'INCONSCIENTE'],
      }

      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({ data: characterDying, error: null }),
        update: (jest.fn() as any).mockReturnThis(),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)
        ; (ordemParanormalService.isDying as jest.Mock).mockReturnValue(false)
        ; (ordemParanormalService.isInjured as jest.Mock).mockReturnValue(false)

      await characterService.updatePV('char-123', 10, false)

      // Deve remover MORRENDO e INCONSCIENTE
      expect(mockQuery.update).toHaveBeenCalledWith(
        expect.objectContaining({
          conditions: [],
        })
      )
    })
  })

  describe('updateSAN', () => {
    it('deve atualizar SAN e aplicar condições se necessário', async () => {
      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({ data: mockCharacter, error: null }),
        update: (jest.fn() as any).mockReturnThis(),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)
        ; (ordemParanormalService.isInsane as jest.Mock).mockReturnValue(false)

      const result = await characterService.updateSAN('char-123', 10, false)

      expect(result.isInsane).toBe(false)
    })

    it('deve aplicar Enlouquecendo se SAN = 0', async () => {
      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({ data: mockCharacter, error: null }),
        update: (jest.fn() as any).mockReturnThis(),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)
        ; (ordemParanormalService.isInsane as jest.Mock).mockReturnValue(true)

      await characterService.updateSAN('char-123', 0, false)

      expect(mockQuery.update).toHaveBeenCalledWith(
        expect.objectContaining({
          conditions: expect.arrayContaining(['ENLOUQUECENDO']),
        })
      )
    })

    it('deve aplicar Perturbado se SAN <= 25%', async () => {
      const characterLowSAN = {
        ...mockCharacter,
        stats: {
          ...mockCharacter.stats,
          san: { current: 2, max: 12 },
        },
      }

      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({ data: characterLowSAN, error: null }),
        update: (jest.fn() as any).mockReturnThis(),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)
        ; (ordemParanormalService.isInsane as jest.Mock).mockReturnValue(false)

      await characterService.updateSAN('char-123', 3, false)

      // 3 <= 25% de 12 (3), deve aplicar Perturbado
      expect(mockQuery.update).toHaveBeenCalledWith(
        expect.objectContaining({
          conditions: expect.arrayContaining(['PERTURBADO']),
        })
      )
    })
  })

  describe('updatePE', () => {
    it('deve atualizar PE como valor absoluto', async () => {
      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({ data: mockCharacter, error: null }),
        update: (jest.fn() as any).mockReturnThis(),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      await characterService.updatePE('char-123', 5, false)

      expect(mockQuery.update).toHaveBeenCalled()
    })

    it('deve atualizar PE como delta', async () => {
      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({ data: mockCharacter, error: null }),
        update: (jest.fn() as any).mockReturnThis(),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      await characterService.updatePE('char-123', 2, true)

      // PE atual (2) + 2 = 4
      expect(mockQuery.update).toHaveBeenCalled()
    })
  })

  describe('rollSkillTest', () => {
    it('deve rolar teste de perícia com penalidades', async () => {
      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({ data: mockCharacter, error: null }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)
        ; (ordemParanormalService.calculateConditionPenalties as jest.Mock).mockReturnValue({
          defense: 0,
          defenseBase: false,
          dicePenalty: 0,
          cannotAct: false,
          cannotReact: false,
          cannotMove: false,
          speedReduction: 1,
          attributePenalties: { agi: 0, for: 0, int: 0, pre: 0, vig: 0 },
          skillPenalties: {},
        })
        ; (ordemParanormalService.rollAttributeTest as jest.Mock).mockReturnValue({
          dice: [15],
          result: 15,
          bonus: 5,
          total: 20,
          advantage: true,
          disadvantage: false,
        })

        ; (characterAttributesService.rollSkillTest as jest.Mock).mockResolvedValue({
          skillName: 'Luta',
          success: true,
          skillBonus: 5,
          total: 20,
          dice: [15],
        })

      const result = await characterService.rollSkillTest('char-123', 'Luta', 15)

      expect(result.skillName).toBe('Luta')
      expect(result.success).toBe(true)
      expect(result.skillBonus).toBe(5)
    })

    it('deve lançar erro se perícia não encontrada', async () => {
      const characterWithoutSkill = {
        ...mockCharacter,
        skills: {},
      }

      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({ data: characterWithoutSkill, error: null }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)
        ; (characterAttributesService.rollSkillTest as jest.Mock).mockRejectedValue(new Error('Perícia Luta não encontrada'))

      await expect(
        characterService.rollSkillTest('char-123', 'Luta', 15)
      ).rejects.toThrow('Perícia Luta não encontrada')
    })
  })

  describe('rollAttack', () => {
    it('deve rolar ataque com penalidades', async () => {
      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({ data: mockCharacter, error: null }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)
        ; (characterAttributesService.rollAttack as jest.Mock).mockResolvedValue({
          attackName: 'Soco',
          success: true,
          damage: 5,
          attackBonus: 10,
          total: 20,
          dice: [20],
        })
        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)
        ; (ordemParanormalService.calculateConditionPenalties as jest.Mock).mockReturnValue({
          defense: 0,
          defenseBase: false,
          dicePenalty: 0,
          cannotAct: false,
          cannotReact: false,
          cannotMove: false,
          speedReduction: 1,
          attributePenalties: { agi: 0, for: 0, int: 0, pre: 0, vig: 0 },
          skillPenalties: {},
        })
        ; (characterAttributesService.rollAttack as jest.Mock).mockResolvedValue({
          attackName: 'Soco',
          skillName: 'Luta',
          success: true,
          damage: 5,
          attackBonus: 10,
          total: 20,
          dice: [20],
          hit: true,
          critical: false,
        })

      const result = await characterService.rollAttack('char-123', 'Luta', 15)

      expect(result.skillName).toBe('Luta')
      expect(result.hit).toBe(true)
      expect(result.critical).toBe(false)
    })
  })

  describe('applyDamage', () => {
    it('deve aplicar dano físico reduzindo PV', async () => {
      const updatePVSpy = jest.spyOn(characterService, 'updatePV').mockResolvedValue({
        character: mockCharacter,
        isDying: false,
        isInjured: false,
      } as any)

      await characterService.applyDamage('char-123', 5, 'physical')

      expect(updatePVSpy).toHaveBeenCalledWith('char-123', -5, true)

      updatePVSpy.mockRestore()
    })

    it('deve aplicar dano mental reduzindo SAN', async () => {
      const updateSANSpy = jest.spyOn(characterService, 'updateSAN').mockResolvedValue({
        character: mockCharacter,
        isInsane: false,
        isLowSAN: false,
      } as any)

      await characterService.applyDamage('char-123', 3, 'mental')

      expect(updateSANSpy).toHaveBeenCalledWith('char-123', -3, true)

      updateSANSpy.mockRestore()
    })
  })


  describe('recoverPE', () => {
    it('deve recuperar PE baseado no NEX', async () => {
      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({ data: mockCharacter, error: null }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)
        ; (ordemParanormalService.calculatePERecovery as jest.Mock).mockReturnValue(2)

      const updatePESpy = jest.spyOn(characterService, 'updatePE').mockResolvedValue({ character: mockCharacter } as any)

      await characterService.recoverPE('char-123')

      expect(ordemParanormalService.calculatePERecovery).toHaveBeenCalledWith(5)
      expect(updatePESpy).toHaveBeenCalledWith('char-123', 2, true)

      updatePESpy.mockRestore()
    })
  })
})

