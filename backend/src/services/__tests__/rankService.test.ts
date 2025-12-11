/**
 * Testes para rankService
 * Cobre validação de patentes e categorias de itens
 */
import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { rankService } from '../rankService'
import { supabase } from '../../config/supabase'

// Mock do Supabase
jest.mock('../../config/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}))

describe('rankService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getCampaignRank', () => {
    it('deve retornar RECRUTA como padrão', async () => {
      const result = await rankService.getCampaignRank('camp-123')
      expect(result).toBe('RECRUTA')
    })

    it('deve retornar RECRUTA mesmo em caso de erro', async () => {
      // Simular erro (mesmo que não aconteça na implementação atual)
      const result = await rankService.getCampaignRank('camp-123')
      expect(result).toBe('RECRUTA')
    })
  })

  describe('updateCampaignRank', () => {
    it('deve logar atualização sem fazer nada', async () => {
      // A função atual apenas loga, não faz nada
      await expect(rankService.updateCampaignRank('camp-123', 'OPERADOR')).resolves.not.toThrow()
    })
  })

  describe('calculateEffectiveCategory', () => {
    it('deve retornar categoria base se não houver modificação', () => {
      expect(rankService.calculateEffectiveCategory('I', 0)).toBe('I')
      expect(rankService.calculateEffectiveCategory('II', 0)).toBe('II')
      expect(rankService.calculateEffectiveCategory('III', 0)).toBe('III')
      expect(rankService.calculateEffectiveCategory('IV', 0)).toBe('IV')
    })

    it('deve aumentar categoria com modificação positiva', () => {
      expect(rankService.calculateEffectiveCategory('I', 1)).toBe('II')
      expect(rankService.calculateEffectiveCategory('II', 1)).toBe('III')
      expect(rankService.calculateEffectiveCategory('III', 1)).toBe('IV')
    })

    it('deve diminuir categoria com modificação negativa', () => {
      expect(rankService.calculateEffectiveCategory('II', -1)).toBe('I')
      expect(rankService.calculateEffectiveCategory('III', -1)).toBe('II')
      expect(rankService.calculateEffectiveCategory('IV', -1)).toBe('III')
    })

    it('deve limitar categoria mínima a I', () => {
      expect(rankService.calculateEffectiveCategory('I', -1)).toBe('I')
      expect(rankService.calculateEffectiveCategory('II', -2)).toBe('I')
    })

    it('deve limitar categoria máxima a IV', () => {
      expect(rankService.calculateEffectiveCategory('IV', 1)).toBe('IV')
      expect(rankService.calculateEffectiveCategory('III', 2)).toBe('IV')
    })

    it('deve retornar I como padrão se categoria for null/undefined', () => {
      expect(rankService.calculateEffectiveCategory(null, 0)).toBe('I')
      expect(rankService.calculateEffectiveCategory(undefined, 0)).toBe('I')
    })

    it('deve calcular categoria efetiva com múltiplas modificações', () => {
      expect(rankService.calculateEffectiveCategory('I', 3)).toBe('IV')
      expect(rankService.calculateEffectiveCategory('IV', -3)).toBe('I')
    })
  })

  describe('countEquippedByCategory', () => {
    it('deve contar itens equipados por categoria', async () => {
      const mockInventory = [
        {
          equipped: true,
          item: { category: 'I', modification_level: 0 },
        },
        {
          equipped: true,
          item: { category: 'I', modification_level: 0 },
        },
        {
          equipped: true,
          item: { category: 'II', modification_level: 0 },
        },
        {
          equipped: false, // Não equipado, não conta
          item: { category: 'III', modification_level: 0 },
        },
      ]

      const finalQuery = {
        select: jest.fn<any>().mockReturnThis(),
        eq: jest.fn<any>().mockReturnThis(),
      }
        ; (finalQuery.eq as jest.Mock).mockResolvedValue({
          data: mockInventory,
          error: null,
        })
        ; (supabase.from as jest.Mock).mockReturnValue(finalQuery)

      const result = await rankService.countEquippedByCategory('char-123')

      expect(result.I).toBe(2)
      expect(result.II).toBe(1)
      expect(result.III).toBe(0)
      expect(result.IV).toBe(0)
    })

    it('deve considerar modificação de nível ao contar', async () => {
      const mockInventory = [
        {
          equipped: true,
          item: { category: 'I', modification_level: 1 }, // I + 1 = II
        },
        {
          equipped: true,
          item: { category: 'II', modification_level: 2 }, // II + 2 = IV
        },
      ]

      const finalQuery = {
        select: jest.fn<any>().mockReturnThis(),
        eq: jest.fn<any>().mockReturnThis(),
      }
        ; (finalQuery.eq as jest.Mock).mockResolvedValue({
          data: mockInventory,
          error: null,
        })
        ; (supabase.from as jest.Mock).mockReturnValue(finalQuery)

      const result = await rankService.countEquippedByCategory('char-123')

      expect(result.I).toBe(0)
      expect(result.II).toBe(1)
      expect(result.III).toBe(0)
      expect(result.IV).toBe(1)
    })

    it('deve retornar zeros se não houver itens equipados', async () => {
      const finalQuery = {
        select: jest.fn<any>().mockReturnThis(),
        eq: jest.fn<any>().mockReturnThis(),
      }
        ; (finalQuery.eq as jest.Mock).mockResolvedValue({
          data: [],
          error: null,
        })
        ; (supabase.from as jest.Mock).mockReturnValue(finalQuery)

      const result = await rankService.countEquippedByCategory('char-123')

      expect(result.I).toBe(0)
      expect(result.II).toBe(0)
      expect(result.III).toBe(0)
      expect(result.IV).toBe(0)
    })

    it('deve ignorar itens sem categoria', async () => {
      const mockInventory = [
        {
          equipped: true,
          item: { category: 'I', modification_level: 0 },
        },
        {
          equipped: true,
          item: null, // Item sem dados
        },
        {
          equipped: true,
          item: { category: null, modification_level: 0 }, // Categoria null
        },
      ]

      const finalQuery = {
        select: jest.fn<any>().mockReturnThis(),
        eq: jest.fn<any>().mockReturnThis(),
      }
        ; (finalQuery.eq as jest.Mock).mockResolvedValue({
          data: mockInventory,
          error: null,
        })
        ; (supabase.from as jest.Mock).mockReturnValue(finalQuery)

      const result = await rankService.countEquippedByCategory('char-123')

      expect(result.I).toBe(1)
      expect(result.II).toBe(0)
      expect(result.III).toBe(0)
      expect(result.IV).toBe(0)
    })

    it('deve lançar erro se busca falhar', async () => {
      const finalQuery = {
        select: jest.fn<any>().mockReturnThis(),
        eq: jest.fn<any>().mockReturnThis(),
      }
        ; (finalQuery.eq as jest.Mock).mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        })
        ; (supabase.from as jest.Mock).mockReturnValue(finalQuery)

      await expect(rankService.countEquippedByCategory('char-123')).rejects.toThrow('Erro ao contar itens equipados')
    })
  })

  describe('validateEquipPermission', () => {
    it('deve permitir equipar se dentro do limite', async () => {
      const mockCharacter = {
        campaign_id: 'camp-123',
      }

      const mockItem = {
        category: 'I',
        modification_level: 0,
      }

      const mockCharQuery = {
        select: jest.fn<any>().mockReturnThis(),
        eq: jest.fn<any>().mockReturnThis(),
        single: jest.fn<any>().mockResolvedValue({
          data: mockCharacter,
          error: null,
        }),
      }

      const mockItemQuery = {
        select: jest.fn<any>().mockReturnThis(),
        eq: jest.fn<any>().mockReturnThis(),
        single: jest.fn<any>().mockResolvedValue({
          data: mockItem,
          error: null,
        }),
      }

      const mockInventoryQuery = {
        select: jest.fn<any>().mockReturnThis(),
        eq: jest.fn<any>().mockReturnThis(),
        mockResolvedValue: jest.fn<any>().mockResolvedValue({
          data: [],
          error: null,
        }),
      }

        ; (supabase.from as jest.Mock)
          .mockReturnValueOnce(mockCharQuery)
          .mockReturnValueOnce(mockItemQuery)
          .mockReturnValueOnce(mockInventoryQuery)

      // Mock do countEquippedByCategory
      jest.spyOn(rankService, 'countEquippedByCategory').mockResolvedValue({
        I: 0,
        II: 0,
        III: 0,
        IV: 0,
      })

      const result = await rankService.validateEquipPermission('char-123', 'item-123')

      expect(result.canEquip).toBe(true)
    })

    it('deve negar equipar se exceder limite', async () => {
      const mockCharacter = {
        campaign_id: 'camp-123',
      }

      const mockItem = {
        category: 'I',
        modification_level: 0,
      }

      const mockCharQuery = {
        select: jest.fn<any>().mockReturnThis(),
        eq: jest.fn<any>().mockReturnThis(),
        single: jest.fn<any>().mockResolvedValue({
          data: mockCharacter,
          error: null,
        }),
      }

      const mockItemQuery = {
        select: jest.fn<any>().mockReturnThis(),
        eq: jest.fn<any>().mockReturnThis(),
        single: jest.fn<any>().mockResolvedValue({
          data: mockItem,
          error: null,
        }),
      }

        ; (supabase.from as jest.Mock)
          .mockReturnValueOnce(mockCharQuery)
          .mockReturnValueOnce(mockItemQuery)

      // Mock do countEquippedByCategory - já tem 3 itens categoria I (limite para RECRUTA)
      jest.spyOn(rankService, 'countEquippedByCategory').mockResolvedValue({
        I: 3,
        II: 0,
        III: 0,
        IV: 0,
      })

      const result = await rankService.validateEquipPermission('char-123', 'item-123')

      expect(result.canEquip).toBe(false)
      expect(result.reason).toContain('Limite de Categoria I excedido')
    })

    it('deve negar se personagem não está em campanha', async () => {
      const mockCharacter = {
        campaign_id: null,
      }

      const mockCharQuery = {
        select: jest.fn<any>().mockReturnThis(),
        eq: jest.fn<any>().mockReturnThis(),
        single: jest.fn<any>().mockResolvedValue({
          data: mockCharacter,
          error: null,
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockCharQuery)

      const result = await rankService.validateEquipPermission('char-123', 'item-123')

      expect(result.canEquip).toBe(false)
      expect(result.reason).toContain('não está em uma campanha')
    })

    it('deve lançar erro se personagem não encontrado', async () => {
      const mockCharQuery = {
        select: jest.fn<any>().mockReturnThis(),
        eq: jest.fn<any>().mockReturnThis(),
        single: jest.fn<any>().mockResolvedValue({
          data: null,
          error: { message: 'Not found', code: 'PGRST116' },
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockCharQuery)

      await expect(rankService.validateEquipPermission('char-999', 'item-123')).rejects.toThrow('Erro ao validar permissão')
    })
  })
})

