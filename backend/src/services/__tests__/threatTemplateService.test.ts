/**
 * Testes para threatTemplateService
 * Cobre operações de templates de ameaças
 */
import { threatTemplateService } from '../threatTemplateService'
import { supabase } from '../../config/supabase'
import * as cacheModule from '../cache'

// Mock do Supabase
jest.mock('../../config/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}))

// Mock do cache
jest.mock('../cache', () => ({
  deleteCache: jest.fn(),
  deleteCachePattern: jest.fn(),
  getThreatTemplateCacheKey: jest.fn(({ templateId }) => `threat_templates:${templateId}`),
}))

describe('threatTemplateService', () => {
  const mockTemplate = {
    id: 'template-123',
    campaign_id: 'camp-123',
    created_by: 'user-123',
    name: 'Zumbi',
    type: 'Morto-Vivo',
    base_attributes: { agi: 0, for: 2, int: -1, pre: 0, vig: 2 },
    base_stats: { pv: 10, san: 0, pe: 0, defense: 10 },
    skills: {},
    resistances: {},
    abilities: [],
    conditions: [],
    is_global: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  }

  beforeEach(() => {
    jest.clearAllMocks()
      ; (cacheModule.deleteCache as jest.Mock).mockResolvedValue(undefined)
      ; (cacheModule.deleteCachePattern as jest.Mock).mockResolvedValue(undefined)
  })

  describe('getTemplates', () => {
    it('deve retornar templates da campanha', async () => {
      // Mock que suporta query builder fluente
      const mockQueryResult = { data: [mockTemplate], error: null }
      const mockQuery = {
        select: jest.fn<any>().mockReturnThis(),
        order: jest.fn<any>().mockReturnThis(),
        eq: jest.fn<any>().mockReturnThis(),
        or: jest.fn<any>().mockResolvedValue(mockQueryResult),
      }

      // Configurar eq para retornar a promise no final da cadeia quando chamado com campaign_id
      mockQuery.eq.mockImplementation(() => mockQuery)
      mockQuery.order.mockReturnValue(mockQuery)

      // No final da cadeia, quando não houver mais métodos, resolver
      let callCount = 0
      mockQuery.eq.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          // Após eq('campaign_id'), resolve a promise
          return Promise.resolve(mockQueryResult)
        }
        return mockQuery
      })

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const result = await threatTemplateService.getTemplates({ campaignId: 'camp-123' })

      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
    })

    it('deve filtrar templates globais', async () => {
      const mockQueryResult = { data: [{ ...mockTemplate, is_global: true }], error: null }
      const mockQuery = {
        select: jest.fn<any>().mockReturnThis(),
        order: jest.fn<any>().mockReturnThis(),
        eq: jest.fn<any>().mockResolvedValue(mockQueryResult),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      await threatTemplateService.getTemplates({ isGlobal: true })

      expect(mockQuery.eq).toHaveBeenCalledWith('is_global', true)
    })
  })

  describe('getTemplateById', () => {
    it('deve retornar template por ID', async () => {
      const mockQuery = {
        select: jest.fn<any>().mockReturnThis(),
        eq: jest.fn<any>().mockReturnThis(),
        single: jest.fn<any>().mockResolvedValue({
          data: mockTemplate,
          error: null,
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const result = await threatTemplateService.getTemplateById('template-123')

      expect(result).toBeDefined()
      expect(result.id).toBe('template-123')
    })

    it('deve lançar erro se template não encontrado', async () => {
      const mockQuery = {
        select: jest.fn<any>().mockReturnThis(),
        eq: jest.fn<any>().mockReturnThis(),
        single: jest.fn<any>().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' },
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      await expect(threatTemplateService.getTemplateById('template-123')).rejects.toThrow()
    })
  })

  describe('createTemplate', () => {
    it('deve criar template com sucesso', async () => {
      const mockInsert = {
        insert: jest.fn<any>().mockReturnThis(),
        select: jest.fn<any>().mockReturnThis(),
        single: jest.fn<any>().mockResolvedValue({
          data: mockTemplate,
          error: null,
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockInsert)

      const result = await threatTemplateService.createTemplate('user-123', {
        name: 'Zumbi',
        type: 'Morto-Vivo',
        baseAttributes: { agi: 0, for: 2, int: -1, pre: 0, vig: 2 },
        baseStats: { pv: 10 },
      })

      expect(result).toBeDefined()
      expect(mockInsert.insert).toHaveBeenCalled()
    })
  })

  describe('createCreatureFromTemplate', () => {
    it('deve criar criatura a partir de template com VD', async () => {
      const mockQuery = {
        select: jest.fn<any>().mockReturnThis(),
        eq: jest.fn<any>().mockReturnThis(),
        single: jest.fn<any>().mockResolvedValue({
          data: mockTemplate,
          error: null,
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const result = await threatTemplateService.createCreatureFromTemplate('user-123', {
        templateId: 'template-123',
        vd: 5,
        name: 'Zumbi VD 5',
      })

      expect(result).toBeDefined()
      expect(result.name).toBe('Zumbi VD 5')
      expect(result.attributes).toBeDefined()
      expect(result.stats).toBeDefined()
      // PV deve ser base * VD
      expect((result.stats as any)?.vida?.max).toBe(50) // 10 * 5
    })

    it('deve limitar VD entre 1 e 20', async () => {
      const mockQuery = {
        select: jest.fn<any>().mockReturnThis(),
        eq: jest.fn<any>().mockReturnThis(),
        single: jest.fn<any>().mockResolvedValue({
          data: mockTemplate,
          error: null,
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      // VD muito alto deve ser limitado a 20
      const result1 = await threatTemplateService.createCreatureFromTemplate('user-123', {
        templateId: 'template-123',
        vd: 100,
      })

      expect((result1.stats as any)?.vida?.max).toBe(200) // 10 * 20 (limitado)

      // VD muito baixo deve ser limitado a 1
      const result2 = await threatTemplateService.createCreatureFromTemplate('user-123', {
        templateId: 'template-123',
        vd: -5,
      })

      expect((result2.stats as any)?.vida?.max).toBe(10) // 10 * 1 (limitado)
    })
  })
})

