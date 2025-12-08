/**
 * Testes para campaignService
 */
import { campaignService } from '../campaignService'
import { supabase } from '../../config/supabase'

jest.mock('../../config/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}))

jest.mock('../cache', () => ({
  getCache: jest.fn(),
  setCache: jest.fn(),
  deleteCache: jest.fn(),
  deleteCachePattern: jest.fn(),
  getCampaignCacheKey: jest.fn((filters) => `campaigns:${JSON.stringify(filters)}`),
}))

describe('campaignService', () => {
  const mockCampaign = {
    id: 'camp-123',
    name: 'Test Campaign',
    description: 'Test Description',
    master_id: 'user-123',
    system_rpg: 'ORDEM_PARANORMAL',
    created_at: '2024-01-01T00:00:00Z',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getCampaigns', () => {
    it('deve retornar lista de campanhas', async () => {
      const mockCampaigns = [mockCampaign]

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockCampaigns, error: null }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const result = await campaignService.getUserCampaigns('user-123')

      expect(result).toEqual(mockCampaigns)
    })

    it('deve filtrar por master_id', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: [mockCampaign], error: null }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      await campaignService.getUserCampaigns('user-123')

      expect(mockQuery.eq).toHaveBeenCalledWith('master_id', 'user-123')
    })
  })

  describe('getCampaignById', () => {
    it('deve retornar campanha por ID', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockCampaign, error: null }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const result = await campaignService.getCampaignById('camp-123')

      expect(result).toEqual(mockCampaign)
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'camp-123')
    })
  })

  describe('createCampaign', () => {
    it('deve criar nova campanha', async () => {
      const newCampaign = {
        name: 'New Campaign',
        description: 'New Description',
        system_rpg: 'ORDEM_PARANORMAL',
      }

      const mockQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ...mockCampaign, ...newCampaign },
          error: null,
        }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const result = await campaignService.createCampaign('user-123', newCampaign)

      expect(result).toBeDefined()
      expect(mockQuery.insert).toHaveBeenCalled()
    })
  })

  describe('updateCampaign', () => {
    it('deve atualizar campanha', async () => {
      const updateData = {
        name: 'Updated Campaign',
      }

      const mockQuery = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ...mockCampaign, ...updateData },
          error: null,
        }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const result = await campaignService.updateCampaign('camp-123', 'user-123', updateData)

      expect(result.name).toBe('Updated Campaign')
      expect(mockQuery.update).toHaveBeenCalled()
    })
  })

  describe('deleteCampaign', () => {
    it('deve deletar campanha', async () => {
      const mockQuery = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      await campaignService.deleteCampaign('camp-123', 'user-123')

      expect(mockQuery.delete).toHaveBeenCalled()
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'camp-123')
    })
  })
})

