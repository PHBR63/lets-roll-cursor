/**
 * Testes para campaignService
 * Cobre operações CRUD de campanhas
 */
import { campaignService } from '../campaignService'
import { supabase } from '../../config/supabase'

jest.mock('../../config/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}))

jest.mock('../cache', () => ({
  getCache: (jest.fn() as any).mockResolvedValue(null), // Sem cache para testes
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
    created_by: 'user-123',
    system_rpg: 'ORDEM_PARANORMAL',
    created_at: '2024-01-01T00:00:00Z',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getUserCampaigns', () => {
    it('deve retornar lista de campanhas do usuário via campaign_participants', async () => {
      // Estrutura real: busca campaign_participants e faz join com campaigns
      const mockParticipants = [
        {
          role: 'master',
          campaign: mockCampaign,
        },
      ]

      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockResolvedValue({ data: mockParticipants, error: null }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const result = await campaignService.getUserCampaigns('user-123')

      // Verifica que busca em campaign_participants com user_id
      expect(supabase.from).toHaveBeenCalledWith('campaign_participants')
      expect(mockQuery.eq).toHaveBeenCalledWith('user_id', 'user-123')

      // Resultado deve ter os dados da campanha + role
      expect(result).toHaveLength(1)
      expect((result[0] as any).name).toBe('Test Campaign')
      expect((result[0] as any).role).toBe('master')
    })
  })

  describe('getCampaignById', () => {
    it('deve retornar campanha por ID com participants', async () => {
      const mockParticipants = [
        { role: 'master', user: { id: 'user-123', username: 'TestUser' } },
      ]

        // Mock para duas chamadas: campaigns e campaign_participants
        ; (supabase.from as jest.Mock)
          .mockReturnValueOnce({
            select: (jest.fn() as any).mockReturnThis(),
            eq: (jest.fn() as any).mockReturnThis(),
            single: (jest.fn() as any).mockResolvedValue({ data: mockCampaign, error: null }),
          })
          .mockReturnValueOnce({
            select: (jest.fn() as any).mockReturnThis(),
            eq: (jest.fn() as any).mockResolvedValue({ data: mockParticipants, error: null }),
          })

      const result = await campaignService.getCampaignById('camp-123')

      expect(result.id).toBe('camp-123')
      expect(result.name).toBe('Test Campaign')
      expect(result.participants).toBeDefined()
      expect(Array.isArray(result.participants)).toBe(true)
    })
  })

  describe('createCampaign', () => {
    it('deve criar nova campanha', async () => {
      const newCampaign = {
        name: 'New Campaign',
        description: 'New Description',
        systemRpg: 'ORDEM_PARANORMAL',
      }

      // Mock para ensureUserExists
      const userCheckQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({ data: { id: 'user-123' }, error: null }),
      }

      // Mock para insert de campanha
      const campaignInsertQuery = {
        insert: (jest.fn() as any).mockReturnThis(),
        select: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: { id: 'camp-new', ...newCampaign, created_by: 'user-123' },
          error: null,
        }),
      }

      // Mock para insert de participante
      const participantInsertQuery = {
        insert: (jest.fn() as any).mockResolvedValue({ error: null }),
      }

        ; (supabase.from as jest.Mock)
          .mockReturnValueOnce(userCheckQuery) // ensureUserExists
          .mockReturnValueOnce(campaignInsertQuery) // insert campanha
          .mockReturnValueOnce(participantInsertQuery) // insert participante

      const result = await campaignService.createCampaign('user-123', newCampaign)

      expect(result).toBeDefined()
      expect(result.id).toBe('camp-new')
    })
  })

  describe('updateCampaign', () => {
    it('deve atualizar campanha se usuário for mestre', async () => {
      const updateData = {
        name: 'Updated Campaign',
      }

      // Mock para verificação de mestre
      const masterCheckQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({ data: { role: 'master' }, error: null }),
      }

      // Mock para update
      const updateQuery = {
        update: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        select: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: { ...mockCampaign, name: 'Updated Campaign' },
          error: null,
        }),
      }

        ; (supabase.from as jest.Mock)
          .mockReturnValueOnce(masterCheckQuery)
          .mockReturnValueOnce(updateQuery)

      const result = await campaignService.updateCampaign('camp-123', 'user-123', updateData)

      expect(result.name).toBe('Updated Campaign')
    })
  })

  describe('deleteCampaign', () => {
    it('deve deletar campanha se usuário for mestre', async () => {
      // Mock para buscar campanha
      const campaignQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: { id: 'camp-123', created_by: 'user-123' },
          error: null
        }),
      }

      // Mock para verificar mestre
      const masterCheckQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({ data: { role: 'master' }, error: null }),
      }

      // Mock para delete
      const deleteQuery = {
        delete: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockResolvedValue({ error: null }),
      }

        ; (supabase.from as jest.Mock)
          .mockReturnValueOnce(campaignQuery) // buscar campanha
          .mockReturnValueOnce(masterCheckQuery) // verificar mestre
          .mockReturnValueOnce(deleteQuery) // deletar

      await campaignService.deleteCampaign('camp-123', 'user-123')

      expect(deleteQuery.delete).toHaveBeenCalled()
    })
  })
})

