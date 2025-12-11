/**
 * Testes para abilityService
 * Cobre CRUD de habilidades e atribuição a personagens
 */
import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { abilityService } from '../abilityService'
import { supabase } from '../../config/supabase'
import { characterService } from '../characterService'

// Mock do Supabase
jest.mock('../../config/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}))

// Mock do characterService
jest.mock('../characterService', () => ({
  characterService: {
    addAbilityToCharacter: jest.fn(),
  },
}))

describe('abilityService', () => {
  const mockAbility = {
    id: 'ability-123',
    name: 'Ataque Furtivo',
    description: 'Ataque com bônus de dano',
    type: 'COMBAT',
    cost: { pe: 2 },
    attributes: { agi: 2 },
    campaign_id: 'camp-123',
    is_global: false,
    created_by: 'user-123',
    created_at: '2024-01-01T00:00:00Z',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getAbilities', () => {
    it('deve buscar habilidades sem filtros', async () => {
      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        or: (jest.fn() as any).mockReturnThis(),
        range: (jest.fn() as any).mockReturnThis(),
        order: (jest.fn() as any).mockResolvedValue({
          data: [mockAbility],
          error: null,
          count: 1,
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const result = await abilityService.getAbilities({})

      expect(result.data).toEqual([mockAbility])
      expect(result.total).toBe(1)
      expect(mockQuery.or).toHaveBeenCalledWith('is_global.eq.true,campaign_id.is.null')
    })

    it('deve buscar habilidades por campaignId', async () => {
      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        range: (jest.fn() as any).mockReturnThis(),
        order: (jest.fn() as any).mockResolvedValue({
          data: [mockAbility],
          error: null,
          count: 1,
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const result = await abilityService.getAbilities({ campaignId: 'camp-123' })

      expect(mockQuery.eq).toHaveBeenCalledWith('campaign_id', 'camp-123')
      expect(result.data).toEqual([mockAbility])
    })

    it('deve buscar habilidades globais', async () => {
      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        range: (jest.fn() as any).mockReturnThis(),
        order: (jest.fn() as any).mockResolvedValue({
          data: [mockAbility],
          error: null,
          count: 1,
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      await abilityService.getAbilities({ isGlobal: true })

      expect(mockQuery.eq).toHaveBeenCalledWith('is_global', true)
    })

    it('deve aplicar paginação', async () => {
      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        or: (jest.fn() as any).mockReturnThis(),
        range: (jest.fn() as any).mockReturnThis(),
        order: (jest.fn() as any).mockResolvedValue({
          data: [mockAbility],
          error: null,
          count: 10,
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const result = await abilityService.getAbilities({ limit: 10, offset: 20 })

      expect(mockQuery.range).toHaveBeenCalledWith(20, 29)
      expect(result.hasMore).toBe(false) // 10 <= 20 + 10
    })

    it('deve lançar erro se busca falhar', async () => {
      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        or: (jest.fn() as any).mockReturnThis(),
        range: (jest.fn() as any).mockReturnThis(),
        order: (jest.fn() as any).mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      await expect(abilityService.getAbilities({})).rejects.toThrow('Erro ao buscar habilidades')
    })
  })

  describe('getAbilityById', () => {
    it('deve buscar habilidade por ID', async () => {
      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: mockAbility,
          error: null,
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const result = await abilityService.getAbilityById('ability-123')

      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'ability-123')
      expect(result).toEqual(mockAbility)
    })

    it('deve lançar erro se habilidade não encontrada', async () => {
      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: null,
          error: { message: 'Not found', code: 'PGRST116' },
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      await expect(abilityService.getAbilityById('ability-999')).rejects.toThrow('Erro ao buscar habilidade')
    })
  })

  describe('createAbility', () => {
    it('deve criar habilidade com dados válidos', async () => {
      const newAbility = {
        name: 'Nova Habilidade',
        description: 'Descrição',
        type: 'UTILITY',
        cost: { pe: 1 },
        campaignId: 'camp-123',
        isGlobal: false,
      }

      const mockQuery = {
        insert: (jest.fn() as any).mockReturnThis(),
        select: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: { ...mockAbility, ...newAbility },
          error: null,
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const result = await abilityService.createAbility('user-123', newAbility)

      expect(mockQuery.insert).toHaveBeenCalled()
      expect(result).toBeDefined()
    })

    it('deve usar valores padrão para campos opcionais', async () => {
      const newAbility = {
        name: 'Nova Habilidade',
        campaignId: 'camp-123',
      }

      const mockQuery = {
        insert: (jest.fn() as any).mockReturnThis(),
        select: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: mockAbility,
          error: null,
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      await abilityService.createAbility('user-123', newAbility)

      expect(mockQuery.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          description: null,
          type: null,
          cost: {},
          is_global: false,
        })
      )
    })

    it('deve lançar erro se criação falhar', async () => {
      const newAbility = {
        name: 'Nova Habilidade',
        campaignId: 'camp-123',
      }

      const mockQuery = {
        insert: (jest.fn() as any).mockReturnThis(),
        select: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      await expect(abilityService.createAbility('user-123', newAbility)).rejects.toThrow('Erro ao criar habilidade')
    })
  })

  describe('updateAbility', () => {
    it('deve atualizar habilidade existente', async () => {
      const updateData = {
        name: 'Habilidade Atualizada',
        cost: { pe: 3 },
      }

      const mockQuery = {
        update: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        select: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: { ...mockAbility, ...updateData },
          error: null,
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const result = await abilityService.updateAbility('ability-123', updateData)

      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'ability-123')
      expect(result.name).toBe('Habilidade Atualizada')
    })

    it('deve atualizar apenas campos fornecidos', async () => {
      const mockQuery = {
        update: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        select: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: mockAbility,
          error: null,
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      await abilityService.updateAbility('ability-123', { name: 'Novo Nome' })

      expect(mockQuery.update).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Novo Nome',
          updated_at: expect.any(String),
        })
      )
    })

    it('deve lançar erro se habilidade não encontrada', async () => {
      const mockQuery = {
        update: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        select: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: null,
          error: { message: 'Not found' },
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      await expect(abilityService.updateAbility('ability-999', { name: 'Novo Nome' })).rejects.toThrow(
        'Erro ao atualizar habilidade'
      )
    })
  })

  describe('deleteAbility', () => {
    it('deve deletar habilidade existente', async () => {
      const mockQuery = {
        delete: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockResolvedValue({
          error: null,
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      await abilityService.deleteAbility('ability-123')

      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'ability-123')
    })

    it('deve lançar erro se deleção falhar', async () => {
      const mockQuery = {
        delete: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockResolvedValue({
          error: { message: 'Delete failed' },
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      await expect(abilityService.deleteAbility('ability-123')).rejects.toThrow('Erro ao deletar habilidade')
    })
  })

  describe('getCampaignAbilities', () => {
    it('deve retornar habilidades da campanha', async () => {
      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        order: (jest.fn() as any).mockResolvedValue({
          data: [mockAbility],
          error: null,
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const result = await abilityService.getCampaignAbilities('camp-123')

      expect(mockQuery.eq).toHaveBeenCalledWith('campaign_id', 'camp-123')
      expect(result).toEqual([mockAbility])
    })

    it('deve retornar array vazio se não houver habilidades', async () => {
      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        order: (jest.fn() as any).mockResolvedValue({
          data: [],
          error: null,
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const result = await abilityService.getCampaignAbilities('camp-123')

      expect(result).toEqual([])
    })
  })

  describe('assignAbilityToCharacter', () => {
    it('deve atribuir habilidade a personagem', async () => {
      const mockAbilityQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: mockAbility,
          error: null,
        }),
      }

        ; (characterService.addAbilityToCharacter as any).mockResolvedValue({
          character: { id: 'char-123' },
          ability: mockAbility,
        })

        ; (supabase.from as jest.Mock).mockReturnValue(mockAbilityQuery)

      const result = await abilityService.assignAbilityToCharacter('char-123', 'ability-123')

      expect(characterService.addAbilityToCharacter).toHaveBeenCalledWith('char-123', 'ability-123')
      expect(result).toBeDefined()
    })

    it('deve lançar erro se habilidade não encontrada', async () => {
      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: null,
          error: { message: 'Not found', code: 'PGRST116' },
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      await expect(abilityService.assignAbilityToCharacter('char-123', 'ability-999')).rejects.toThrow(
        'Erro ao atribuir habilidade'
      )
    })
  })
})

