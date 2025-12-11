import { momentService } from '../momentService'
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
  getCache: jest.fn(),
  setCache: jest.fn(),
  deleteCache: jest.fn(),
  deleteCachePattern: jest.fn(),
  getMomentCacheKey: jest.fn((filters: any) => {
    if (filters.momentId) return `moments:${filters.momentId}`
    if (filters.campaignId) return `moments:campaign:${filters.campaignId}`
    if (filters.sessionId) return `moments:session:${filters.sessionId}`
    return 'moments:all'
  }),
}))

describe('momentService', () => {
  const mockMoment = {
    id: 'moment-123',
    campaign_id: 'camp-123',
    session_id: 'session-123',
    created_by: 'user-123',
    title: 'Momento de Teste',
    description: 'Descrição do momento',
    image_url: 'https://example.com/image.jpg',
    dice_roll_id: 'dice-123',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  }

  beforeEach(() => {
    jest.clearAllMocks()
      ; (cacheModule.getCache as jest.Mock).mockResolvedValue(null)
      ; (cacheModule.setCache as jest.Mock).mockResolvedValue(undefined)
      ; (cacheModule.deleteCache as jest.Mock).mockResolvedValue(undefined)
      ; (cacheModule.deleteCachePattern as jest.Mock).mockResolvedValue(undefined)
  })

  describe('getCampaignMoments', () => {
    it('deve retornar momentos da campanha ordenados por data', async () => {
      const mockQuery = {
        select: jest.fn<any>().mockReturnThis(),
        eq: jest.fn<any>().mockReturnThis(),
        order: jest.fn<any>().mockResolvedValue({
          data: [mockMoment],
          error: null,
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const result = await momentService.getCampaignMoments('camp-123')

      expect(result).toEqual([mockMoment])
      expect(supabase.from).toHaveBeenCalledWith('campaign_moments')
      expect(mockQuery.eq).toHaveBeenCalledWith('campaign_id', 'camp-123')
      expect(mockQuery.order).toHaveBeenCalledWith('created_at', { ascending: false })
    })

    it('deve retornar array vazio se não houver momentos', async () => {
      const mockQuery = {
        select: jest.fn<any>().mockReturnThis(),
        eq: jest.fn<any>().mockReturnThis(),
        order: jest.fn<any>().mockResolvedValue({
          data: [],
          error: null,
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const result = await momentService.getCampaignMoments('camp-123')

      expect(result).toEqual([])
    })

    it('deve usar cache se disponível', async () => {
      ; (cacheModule.getCache as jest.Mock).mockResolvedValue([mockMoment])

      const result = await momentService.getCampaignMoments('camp-123')

      expect(result).toEqual([mockMoment])
      expect(supabase.from).not.toHaveBeenCalled()
    })

    it('deve lançar erro se houver falha na query', async () => {
      const mockQuery = {
        select: jest.fn<any>().mockReturnThis(),
        eq: jest.fn<any>().mockReturnThis(),
        order: jest.fn<any>().mockResolvedValue({
          data: null,
          error: { message: 'Erro no banco' },
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      await expect(momentService.getCampaignMoments('camp-123')).rejects.toThrow()
    })
  })

  describe('getSessionMoments', () => {
    it('deve retornar momentos da sessão', async () => {
      const mockQuery = {
        select: jest.fn<any>().mockReturnThis(),
        eq: jest.fn<any>().mockReturnThis(),
        order: jest.fn<any>().mockResolvedValue({
          data: [mockMoment],
          error: null,
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const result = await momentService.getSessionMoments('session-123')

      expect(result).toEqual([mockMoment])
      expect(mockQuery.eq).toHaveBeenCalledWith('session_id', 'session-123')
    })
  })

  describe('getMomentById', () => {
    it('deve retornar momento por ID', async () => {
      const mockQuery = {
        select: jest.fn<any>().mockReturnThis(),
        eq: jest.fn<any>().mockReturnThis(),
        single: jest.fn<any>().mockResolvedValue({
          data: mockMoment,
          error: null,
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const result = await momentService.getMomentById('moment-123')

      expect(result).toEqual(mockMoment)
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'moment-123')
    })

    it('deve lançar erro se momento não encontrado', async () => {
      const mockQuery = {
        select: jest.fn<any>().mockReturnThis(),
        eq: jest.fn<any>().mockReturnThis(),
        single: jest.fn<any>().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116', message: 'Not found' },
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      await expect(momentService.getMomentById('moment-123')).rejects.toThrow()
    })
  })

  describe('createMoment', () => {
    it('deve criar momento com sucesso', async () => {
      const mockParticipantQuery = {
        select: jest.fn<any>().mockReturnThis(),
        eq: jest.fn<any>().mockReturnThis(),
        single: jest.fn<any>().mockResolvedValue({
          data: { id: 'participant-123' },
          error: null,
        }),
      }

      const mockInsert = {
        insert: jest.fn<any>().mockReturnThis(),
        select: jest.fn<any>().mockReturnThis(),
        single: jest.fn<any>().mockResolvedValue({
          data: mockMoment,
          error: null,
        }),
      }

        ; (supabase.from as jest.Mock)
          .mockReturnValueOnce(mockParticipantQuery) // Verificação de participante
          .mockReturnValueOnce(mockInsert) // Inserção do momento

      const result = await momentService.createMoment('user-123', {
        campaignId: 'camp-123',
        title: 'Momento de Teste',
        description: 'Descrição',
      })

      expect(result).toEqual(mockMoment)
      expect(mockInsert.insert).toHaveBeenCalled()
    })

    it('deve lançar erro se título estiver vazio', async () => {
      await expect(
        momentService.createMoment('user-123', {
          campaignId: 'camp-123',
          title: '',
        })
      ).rejects.toThrow('Título do momento é obrigatório')
    })

    it('deve lançar erro se usuário não for participante', async () => {
      const mockQuery = {
        select: jest.fn<any>().mockReturnThis(),
        eq: jest.fn<any>().mockReturnThis(),
        single: jest.fn<any>().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' },
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      await expect(
        momentService.createMoment('user-123', {
          campaignId: 'camp-123',
          title: 'Título',
        })
      ).rejects.toThrow('Você não é participante desta campanha')
    })

    it('deve validar se sessão pertence à campanha', async () => {
      const mockParticipantQuery = {
        select: jest.fn<any>().mockReturnThis(),
        eq: jest.fn<any>().mockReturnThis(),
        single: jest.fn<any>().mockResolvedValue({
          data: { id: 'participant-123' },
          error: null,
        }),
      }

      const mockSessionQuery = {
        select: jest.fn<any>().mockReturnThis(),
        eq: jest.fn<any>().mockReturnThis(),
        single: jest.fn<any>().mockResolvedValue({
          data: { campaign_id: 'camp-456' }, // Campanha diferente
          error: null,
        }),
      }

        ; (supabase.from as jest.Mock)
          .mockReturnValueOnce(mockParticipantQuery)
          .mockReturnValueOnce(mockSessionQuery)

      await expect(
        momentService.createMoment('user-123', {
          campaignId: 'camp-123',
          sessionId: 'session-123',
          title: 'Título',
        })
      ).rejects.toThrow('A sessão não pertence a esta campanha')
    })
  })

  describe('updateMoment', () => {
    it('deve atualizar momento com sucesso', async () => {
      const mockFetch = {
        select: jest.fn<any>().mockReturnThis(),
        eq: jest.fn<any>().mockReturnThis(),
        single: jest.fn<any>().mockResolvedValue({
          data: { created_by: 'user-123', campaign_id: 'camp-123', session_id: null },
          error: null,
        }),
      }

      const mockUpdate = {
        update: jest.fn<any>().mockReturnThis(),
        eq: jest.fn<any>().mockReturnThis(),
        select: jest.fn<any>().mockReturnThis(),
        single: jest.fn<any>().mockResolvedValue({
          data: { ...mockMoment, title: 'Título Atualizado' },
          error: null,
        }),
      }

        ; (supabase.from as jest.Mock)
          .mockReturnValueOnce(mockFetch)
          .mockReturnValueOnce(mockUpdate)

      const result = await momentService.updateMoment('moment-123', 'user-123', {
        title: 'Título Atualizado',
      })

      expect(result.title).toBe('Título Atualizado')
    })

    it('deve lançar erro se usuário não for o criador', async () => {
      const mockQuery = {
        select: jest.fn<any>().mockReturnThis(),
        eq: jest.fn<any>().mockReturnThis(),
        single: jest.fn<any>().mockResolvedValue({
          data: { created_by: 'user-456' }, // Criador diferente
          error: null,
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      await expect(
        momentService.updateMoment('moment-123', 'user-123', {
          title: 'Título',
        })
      ).rejects.toThrow('Você não tem permissão para atualizar este momento')
    })

    it('deve validar sessão ao atualizar', async () => {
      const mockFetch = {
        select: jest.fn<any>().mockReturnThis(),
        eq: jest.fn<any>().mockReturnThis(),
        single: jest.fn<any>().mockResolvedValue({
          data: { created_by: 'user-123', campaign_id: 'camp-123', session_id: null },
          error: null,
        }),
      }

      const mockSessionQuery = {
        select: jest.fn<any>().mockReturnThis(),
        eq: jest.fn<any>().mockReturnThis(),
        single: jest.fn<any>().mockResolvedValue({
          data: { campaign_id: 'camp-456' },
          error: null,
        }),
      }

        ; (supabase.from as jest.Mock)
          .mockReturnValueOnce(mockFetch)
          .mockReturnValueOnce(mockSessionQuery)

      await expect(
        momentService.updateMoment('moment-123', 'user-123', {
          sessionId: 'session-123',
        })
      ).rejects.toThrow('A sessão não pertence à campanha deste momento')
    })
  })

  describe('deleteMoment', () => {
    it('deve deletar momento com sucesso', async () => {
      const mockFetch = {
        select: jest.fn<any>().mockReturnThis(),
        eq: jest.fn<any>().mockReturnThis(),
        single: jest.fn()
          .mockResolvedValueOnce({
            data: { created_by: 'user-123' },
            error: null,
          })
          .mockResolvedValueOnce({
            data: { campaign_id: 'camp-123', session_id: null },
            error: null,
          }),
      }

      const mockDelete = {
        delete: jest.fn<any>().mockReturnThis(),
        eq: jest.fn<any>().mockResolvedValue({
          error: null,
        }),
      }

        ; (supabase.from as jest.Mock)
          .mockReturnValueOnce(mockFetch)
          .mockReturnValueOnce(mockFetch)
          .mockReturnValueOnce(mockDelete)

      const result = await momentService.deleteMoment('moment-123', 'user-123')

      expect(result.message).toBe('Momento deletado com sucesso')
    })

    it('deve lançar erro se usuário não for o criador', async () => {
      const mockQuery = {
        select: jest.fn<any>().mockReturnThis(),
        eq: jest.fn<any>().mockReturnThis(),
        single: jest.fn<any>().mockResolvedValue({
          data: { created_by: 'user-456' },
          error: null,
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      await expect(momentService.deleteMoment('moment-123', 'user-123')).rejects.toThrow(
        'Você não tem permissão para deletar este momento'
      )
    })

    it('deve invalidar cache ao deletar', async () => {
      const mockFetch = {
        select: jest.fn<any>().mockReturnThis(),
        eq: jest.fn<any>().mockReturnThis(),
        single: jest.fn()
          .mockResolvedValueOnce({
            data: { created_by: 'user-123' },
            error: null,
          })
          .mockResolvedValueOnce({
            data: { campaign_id: 'camp-123', session_id: 'session-123' },
            error: null,
          }),
      }

      const mockDelete = {
        delete: jest.fn<any>().mockReturnThis(),
        eq: jest.fn<any>().mockResolvedValue({
          error: null,
        }),
      }

        ; (supabase.from as jest.Mock)
          .mockReturnValueOnce(mockFetch)
          .mockReturnValueOnce(mockFetch)
          .mockReturnValueOnce(mockDelete)

      await momentService.deleteMoment('moment-123', 'user-123')

      expect(cacheModule.deleteCache).toHaveBeenCalled()
      expect(cacheModule.deleteCachePattern).toHaveBeenCalled()
    })
  })

  describe('getSessionMoments', () => {
    it('deve usar cache se disponível', async () => {
      ; (cacheModule.getCache as jest.Mock).mockResolvedValue([mockMoment])

      const result = await momentService.getSessionMoments('session-123')

      expect(result).toEqual([mockMoment])
      expect(supabase.from).not.toHaveBeenCalled()
    })

    it('deve lançar erro se busca falhar', async () => {
      const mockQuery = {
        select: jest.fn<any>().mockReturnThis(),
        eq: jest.fn<any>().mockReturnThis(),
        order: jest.fn<any>().mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      await expect(momentService.getSessionMoments('session-123')).rejects.toThrow()
    })
  })

  describe('updateMoment', () => {
    it('deve invalidar cache ao atualizar', async () => {
      const mockFetch = {
        select: jest.fn<any>().mockReturnThis(),
        eq: jest.fn<any>().mockReturnThis(),
        single: jest.fn<any>().mockResolvedValue({
          data: { created_by: 'user-123', campaign_id: 'camp-123', session_id: null },
          error: null,
        }),
      }

      const mockUpdate = {
        update: jest.fn<any>().mockReturnThis(),
        eq: jest.fn<any>().mockReturnThis(),
        select: jest.fn<any>().mockReturnThis(),
        single: jest.fn<any>().mockResolvedValue({
          data: mockMoment,
          error: null,
        }),
      }

        ; (supabase.from as jest.Mock)
          .mockReturnValueOnce(mockFetch)
          .mockReturnValueOnce(mockUpdate)

      await momentService.updateMoment('moment-123', 'user-123', { title: 'Novo Título' })

      expect(cacheModule.deleteCache).toHaveBeenCalled()
      expect(cacheModule.deleteCachePattern).toHaveBeenCalled()
    })
  })
})

