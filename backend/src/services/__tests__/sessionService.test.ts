import { sessionService } from '../sessionService'
import { supabase } from '../../config/supabase'

// Mock do Supabase
jest.mock('../../config/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}))

describe('sessionService', () => {
  const mockSession = {
    id: 'session-123',
    campaign_id: 'camp-123',
    name: 'Sessão de Teste',
    started_at: '2024-01-01T00:00:00Z',
    ended_at: null,
    notes: 'Notas da sessão',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createSession', () => {
    it('deve criar sessão com sucesso', async () => {
      const mockInsert = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockSession,
          error: null,
        }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockInsert)

      const result = await sessionService.createSession('camp-123', {
        name: 'Sessão de Teste',
      })

      expect(result).toEqual(mockSession)
      expect(mockInsert.insert).toHaveBeenCalled()
    })

    it('deve usar nome padrão se não fornecido', async () => {
      const mockInsert = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ...mockSession, name: 'Sessão 01/01/2024' },
          error: null,
        }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockInsert)

      await sessionService.createSession('camp-123', {})

      expect(mockInsert.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          name: expect.stringContaining('Sessão'),
        })
      )
    })

    it('deve lançar erro se houver falha', async () => {
      const mockInsert = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Erro no banco' },
        }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockInsert)

      await expect(sessionService.createSession('camp-123', {})).rejects.toThrow()
    })
  })

  describe('getActiveSession', () => {
    it('deve retornar sessão ativa', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({
          data: mockSession,
          error: null,
        }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const result = await sessionService.getActiveSession('camp-123')

      expect(result).toEqual(mockSession)
      expect(mockQuery.eq).toHaveBeenCalledWith('campaign_id', 'camp-123')
      expect(mockQuery.is).toHaveBeenCalledWith('ended_at', null)
    })

    it('deve retornar null se não houver sessão ativa', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const result = await sessionService.getActiveSession('camp-123')

      expect(result).toBeNull()
    })
  })

  describe('getCampaignSessions', () => {
    it('deve retornar todas as sessões da campanha', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [mockSession],
          error: null,
        }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const result = await sessionService.getCampaignSessions('camp-123')

      expect(result).toEqual([mockSession])
    })

    it('deve filtrar apenas sessões ativas se solicitado', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [mockSession],
          error: null,
        }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      await sessionService.getCampaignSessions('camp-123', true)

      expect(mockQuery.is).toHaveBeenCalledWith('ended_at', null)
    })
  })

  describe('getSessionById', () => {
    it('deve retornar sessão por ID', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockSession,
          error: null,
        }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const result = await sessionService.getSessionById('session-123')

      expect(result).toEqual(mockSession)
    })
  })
})

