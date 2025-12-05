import { chatService } from '../chatService'
import { supabase } from '../../config/supabase'

// Mock do Supabase
jest.mock('../../config/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}))

describe('chatService', () => {
  const mockMessage = {
    id: 'msg-123',
    campaign_id: 'camp-123',
    session_id: 'session-123',
    user_id: 'user-123',
    character_id: 'char-123',
    content: 'Mensagem de teste',
    type: 'message',
    channel: 'general',
    created_at: '2024-01-01T00:00:00Z',
    user: {
      id: 'user-123',
      username: 'TestUser',
      avatar_url: null,
    },
    character: {
      id: 'char-123',
      name: 'Test Character',
      avatar_url: null,
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getMessages', () => {
    it('deve retornar mensagens da campanha', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: [mockMessage],
          error: null,
        }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const result = await chatService.getMessages('camp-123')

      expect(result).toEqual([mockMessage])
      expect(mockQuery.eq).toHaveBeenCalledWith('campaign_id', 'camp-123')
      expect(mockQuery.limit).toHaveBeenCalledWith(100)
    })

    it('deve filtrar por sessão se fornecido', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: [mockMessage],
          error: null,
        }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      await chatService.getMessages('camp-123', 'session-123')

      expect(mockQuery.eq).toHaveBeenCalledWith('session_id', 'session-123')
    })

    it('deve usar limite customizado', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: [mockMessage],
          error: null,
        }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      await chatService.getMessages('camp-123', undefined, 50)

      expect(mockQuery.limit).toHaveBeenCalledWith(50)
    })

    it('deve retornar array vazio se não houver mensagens', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const result = await chatService.getMessages('camp-123')

      expect(result).toEqual([])
    })
  })

  describe('createMessage', () => {
    it('deve criar mensagem com sucesso', async () => {
      const mockInsert = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockMessage,
          error: null,
        }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockInsert)

      const result = await chatService.createMessage({
        campaignId: 'camp-123',
        sessionId: 'session-123',
        userId: 'user-123',
        characterId: 'char-123',
        content: 'Mensagem de teste',
      })

      expect(result).toEqual(mockMessage)
      expect(mockInsert.insert).toHaveBeenCalled()
    })

    it('deve usar valores padrão para type e channel', async () => {
      const mockInsert = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockMessage,
          error: null,
        }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockInsert)

      await chatService.createMessage({
        campaignId: 'camp-123',
        userId: 'user-123',
        content: 'Mensagem',
      })

      expect(mockInsert.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'message',
          channel: 'general',
        })
      )
    })

    it('deve permitir type e channel customizados', async () => {
      const mockInsert = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ...mockMessage, type: 'narration', channel: 'master' },
          error: null,
        }),
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockInsert)

      await chatService.createMessage({
        campaignId: 'camp-123',
        userId: 'user-123',
        content: 'Narração',
        type: 'narration',
        channel: 'master',
      })

      expect(mockInsert.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'narration',
          channel: 'master',
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

      await expect(
        chatService.createMessage({
          campaignId: 'camp-123',
          userId: 'user-123',
          content: 'Mensagem',
        })
      ).rejects.toThrow()
    })
  })
})

