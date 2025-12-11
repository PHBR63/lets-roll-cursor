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
        insert: (jest.fn() as any).mockReturnThis(),
        select: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: mockSession,
          error: null,
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockInsert)

      const result = await sessionService.createSession('camp-123', {
        name: 'Sessão de Teste',
      })

      expect(result).toEqual(mockSession)
      expect(mockInsert.insert).toHaveBeenCalled()
    })

    it('deve usar nome padrão se não fornecido', async () => {
      const mockInsert = {
        insert: (jest.fn() as any).mockReturnThis(),
        select: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: { ...mockSession, name: 'Sessão 01/01/2024' },
          error: null,
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockInsert)

      await sessionService.createSession('camp-123', {})

      expect(mockInsert.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          name: expect.stringContaining('Sessão'),
        })
      )
    })

    it('deve lançar erro se houver falha', async () => {
      const mockInsert = {
        insert: (jest.fn() as any).mockReturnThis(),
        select: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: null,
          error: { message: 'Erro no banco' },
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockInsert)

      await expect(sessionService.createSession('camp-123', {})).rejects.toThrow()
    })
  })

  describe('getActiveSession', () => {
    it('deve retornar sessão ativa', async () => {
      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        is: (jest.fn() as any).mockReturnThis(),
        order: (jest.fn() as any).mockReturnThis(),
        limit: (jest.fn() as any).mockReturnThis(),
        maybeSingle: (jest.fn() as any).mockResolvedValue({
          data: mockSession,
          error: null,
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const result = await sessionService.getActiveSession('camp-123')

      expect(result).toEqual(mockSession)
      expect(mockQuery.eq).toHaveBeenCalledWith('campaign_id', 'camp-123')
      expect(mockQuery.is).toHaveBeenCalledWith('ended_at', null)
    })

    it('deve retornar null se não houver sessão ativa', async () => {
      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        is: (jest.fn() as any).mockReturnThis(),
        order: (jest.fn() as any).mockReturnThis(),
        limit: (jest.fn() as any).mockReturnThis(),
        maybeSingle: (jest.fn() as any).mockResolvedValue({
          data: null,
          error: null,
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const result = await sessionService.getActiveSession('camp-123')

      expect(result).toBeNull()
    })
  })

  describe('getCampaignSessions', () => {
    it('deve retornar todas as sessões da campanha', async () => {
      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        is: (jest.fn() as any).mockReturnThis(),
        order: (jest.fn() as any).mockResolvedValue({
          data: [mockSession],
          error: null,
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const result = await sessionService.getCampaignSessions('camp-123')

      expect(result).toEqual([mockSession])
    })

    it('deve filtrar apenas sessões ativas se solicitado', async () => {
      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        is: (jest.fn() as any).mockReturnThis(),
        order: (jest.fn() as any).mockResolvedValue({
          data: [mockSession],
          error: null,
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      await sessionService.getCampaignSessions('camp-123', true)

      expect(mockQuery.is).toHaveBeenCalledWith('ended_at', null)
    })
  })

  describe('getSessionById', () => {
    it('deve retornar sessão por ID', async () => {
      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: mockSession,
          error: null,
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const result = await sessionService.getSessionById('session-123')

      expect(result).toEqual(mockSession)
    })

    it('deve lançar erro se sessão não encontrada', async () => {
      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: null,
          error: { message: 'Not found', code: 'PGRST116' },
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      await expect(sessionService.getSessionById('session-999')).rejects.toThrow('Erro ao buscar sessão')
    })
  })

  describe('updateSession', () => {
    it('deve atualizar sessão com sucesso', async () => {
      const updateData = {
        name: 'Sessão Atualizada',
        notes: 'Novas notas',
      }

      const mockQuery = {
        update: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        select: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: { ...mockSession, ...updateData },
          error: null,
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const result = await sessionService.updateSession('session-123', updateData)

      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'session-123')
      expect(result.name).toBe('Sessão Atualizada')
    })

    it('deve atualizar apenas campos fornecidos', async () => {
      const mockQuery = {
        update: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        select: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: mockSession,
          error: null,
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      await sessionService.updateSession('session-123', { notes: 'Novas notas' })

      expect(mockQuery.update).toHaveBeenCalledWith(
        expect.objectContaining({
          notes: 'Novas notas',
          updated_at: expect.any(String),
        })
      )
    })

    it('deve lançar erro se sessão não encontrada', async () => {
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

      await expect(sessionService.updateSession('session-999', { name: 'Novo Nome' })).rejects.toThrow(
        'Erro ao atualizar sessão'
      )
    })
  })

  describe('endSession', () => {
    it('deve encerrar sessão com sucesso', async () => {
      const mockQuery = {
        update: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        select: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: { ...mockSession, ended_at: new Date().toISOString() },
          error: null,
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const result = await sessionService.endSession('session-123')

      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'session-123')
      expect(result.ended_at).toBeDefined()
    })

    it('deve lançar erro se sessão não encontrada', async () => {
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

      await expect(sessionService.endSession('session-999')).rejects.toThrow('Erro ao finalizar sessão')
    })
  })

  describe('getCampaignSessions', () => {
    it('deve retornar array vazio se não houver sessões', async () => {
      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        order: (jest.fn() as any).mockResolvedValue({
          data: [],
          error: null,
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const result = await sessionService.getCampaignSessions('camp-123')

      expect(result).toEqual([])
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

      await expect(sessionService.getCampaignSessions('camp-123')).rejects.toThrow('Erro ao buscar sessões')
    })
  })
})

