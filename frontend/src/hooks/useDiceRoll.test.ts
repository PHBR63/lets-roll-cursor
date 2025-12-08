/**
 * Testes básicos para useDiceRoll hook
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useDiceRoll } from '@/components/session/DiceRoller/useDiceRoll'

// Mock do useToast
vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  }),
}))

// Mock do supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: {
          session: {
            access_token: 'test-token',
          },
        },
      }),
    },
  },
}))

// Mock do fetch
global.fetch = vi.fn()

describe('useDiceRoll', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve inicializar com estado correto', () => {
    const { result } = renderHook(() => useDiceRoll('session-1', 'campaign-1'))
    
    expect(result.current.rolling).toBe(false)
    expect(result.current.lastResult).toBe(null)
    expect(result.current.showAnimation).toBe(false)
  })

  it('deve ter função rollFormula', () => {
    const { result } = renderHook(() => useDiceRoll('session-1', 'campaign-1'))
    
    expect(typeof result.current.rollFormula).toBe('function')
  })
})

