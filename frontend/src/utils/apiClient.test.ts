import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ApiClient } from './apiClient'
import { supabase } from '@/integrations/supabase/client'

// Mock do Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
  },
}))

// Mock do fetch global
global.fetch = vi.fn()

describe('ApiClient', () => {
  let apiClient: ApiClient

  beforeEach(() => {
    vi.clearAllMocks()
    apiClient = new ApiClient()
    
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: {
        session: {
          access_token: 'test-token',
          user: { id: 'user-123' },
        } as any,
      },
      error: null,
    })
  })

  describe('GET', () => {
    it('deve fazer requisição GET com autenticação', async () => {
      const mockData = { id: '1', name: 'Test' }
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      } as Response)

      const result = await apiClient.get('/test')

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      )
      expect(result).toEqual(mockData)
    })

    it('deve lançar erro quando resposta não é ok', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Not found' }),
      } as Response)

      await expect(apiClient.get('/test')).rejects.toThrow('Not found')
    })
  })

  describe('POST', () => {
    it('deve fazer requisição POST com dados JSON', async () => {
      const mockData = { id: '1', name: 'Test' }
      const postData = { name: 'New Item' }
      
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      } as Response)

      const result = await apiClient.post('/test', postData)

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-token',
          }),
          body: JSON.stringify(postData),
        })
      )
      expect(result).toEqual(mockData)
    })

    it('deve fazer requisição POST com FormData', async () => {
      const formData = new FormData()
      formData.append('file', new Blob())
      
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response)

      await apiClient.post('/upload', formData)

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/upload'),
        expect.objectContaining({
          method: 'POST',
          body: formData,
        })
      )
    })
  })

  describe('Retry Logic', () => {
    it('deve tentar novamente em caso de erro 500', async () => {
      vi.mocked(fetch)
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
        } as Response)

      const result = await apiClient.get('/test', {
        retry: { maxRetries: 3, delay: 100 },
      })

      expect(fetch).toHaveBeenCalledTimes(2)
      expect(result).toEqual({ success: true })
    })
  })
})
