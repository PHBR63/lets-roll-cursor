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
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        order: (jest.fn() as any).mockReturnThis(),
        limit: (jest.fn() as any).mockResolvedValue({
          data: [mockMessage],
          error: null,
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const result = await chatService.getMessages('camp-123')

      expect(result).toEqual([mockMessage])
      expect(mockQuery.eq).toHaveBeenCalledWith('campaign_id', 'camp-123')
      expect(mockQuery.limit).toHaveBeenCalledWith(100)
    })

    it('deve filtrar por sessão se fornecido', async () => {
      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        order: (jest.fn() as any).mockReturnThis(),
        limit: (jest.fn() as any).mockResolvedValue({
          data: [mockMessage],
          error: null,
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      await chatService.getMessages('camp-123', 'session-123')

      expect(mockQuery.eq).toHaveBeenCalledWith('session_id', 'session-123')
    })

    it('deve usar limite customizado', async () => {
      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        order: (jest.fn() as any).mockReturnThis(),
        limit: (jest.fn() as any).mockResolvedValue({
          data: [mockMessage],
          error: null,
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      await chatService.getMessages('camp-123', undefined, 50)

      expect(mockQuery.limit).toHaveBeenCalledWith(50)
    })

    it('deve retornar array vazio se não houver mensagens', async () => {
      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        order: (jest.fn() as any).mockReturnThis(),
        limit: (jest.fn() as any).mockResolvedValue({
          data: [],
          error: null,
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const result = await chatService.getMessages('camp-123')

      expect(result).toEqual([])
    })
  })

  describe('createMessage', () => {
    it('deve criar mensagem com sucesso', async () => {
      const mockInsert = {
        insert: (jest.fn() as any).mockReturnThis(),
        select: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: mockMessage,
          error: null,
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockInsert)

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
        insert: (jest.fn() as any).mockReturnThis(),
        select: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: mockMessage,
          error: null,
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockInsert)

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
        insert: (jest.fn() as any).mockReturnThis(),
        select: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: { ...mockMessage, type: 'narration', channel: 'master' },
          error: null,
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockInsert)

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
        insert: (jest.fn() as any).mockReturnThis(),
        select: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: null,
          error: { message: 'Erro no banco' },
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockInsert)

      await expect(
        chatService.createMessage({
          campaignId: 'camp-123',
          userId: 'user-123',
          content: 'Mensagem',
        })
      ).rejects.toThrow()
    })

    it('deve criar mensagem com characterId', async () => {
      const mockInsert = {
        insert: (jest.fn() as any).mockReturnThis(),
        select: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: { ...mockMessage, character_id: 'char-123' },
          error: null,
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockInsert)

      await chatService.createMessage({
        campaignId: 'camp-123',
        userId: 'user-123',
        characterId: 'char-123',
        content: 'Mensagem',
      })

      expect(mockInsert.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          character_id: 'char-123',
        })
      )
    })

    it('deve criar mensagem OOC (out of character)', async () => {
      const mockInsert = {
        insert: (jest.fn() as any).mockReturnThis(),
        select: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: { ...mockMessage, type: 'ooc' },
          error: null,
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockInsert)

      await chatService.createMessage({
        campaignId: 'camp-123',
        userId: 'user-123',
        content: 'Mensagem OOC',
        type: 'ooc',
      })

      expect(mockInsert.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'ooc',
        })
      )
    })

    it('deve criar mensagem em canal específico', async () => {
      const mockInsert = {
        insert: (jest.fn() as any).mockReturnThis(),
        select: (jest.fn() as any).mockReturnThis(),
        single: (jest.fn() as any).mockResolvedValue({
          data: { ...mockMessage, channel: 'combat' },
          error: null,
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockInsert)

      await chatService.createMessage({
        campaignId: 'camp-123',
        userId: 'user-123',
        content: 'Mensagem',
        channel: 'combat',
      })

      expect(mockInsert.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          channel: 'combat',
        })
      )
    })

    it('deve ordenar mensagens por data crescente', async () => {
      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        order: (jest.fn() as any).mockReturnThis(),
        limit: (jest.fn() as any).mockResolvedValue({
          data: [mockMessage],
          error: null,
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      await chatService.getMessages('camp-123')

      expect(mockQuery.order).toHaveBeenCalledWith('created_at', { ascending: true })
    })

    it('deve lançar erro se busca de mensagens falhar', async () => {
      const mockQuery = {
        select: (jest.fn() as any).mockReturnThis(),
        eq: (jest.fn() as any).mockReturnThis(),
        order: (jest.fn() as any).mockReturnThis(),
        limit: (jest.fn() as any).mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        }),
      }

        ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)

      await expect(chatService.getMessages('camp-123')).rejects.toThrow('Erro ao buscar mensagens')
    })
  })
})

