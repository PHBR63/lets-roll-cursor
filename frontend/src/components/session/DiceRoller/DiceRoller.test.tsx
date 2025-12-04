/**
 * Testes básicos para DiceRoller
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DiceRoller } from './DiceRoller'

// Mock do useAuth
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id' },
  }),
}))

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

describe('DiceRoller', () => {
  it('deve renderizar o componente', () => {
    render(<DiceRoller sessionId="test-session" campaignId="test-campaign" />)
    
    expect(screen.getByText('Rolagem de Dados')).toBeInTheDocument()
    expect(screen.getByText('Básica')).toBeInTheDocument()
  })

  it('deve mostrar tabs de rolagem', () => {
    render(<DiceRoller sessionId="test-session" campaignId="test-campaign" />)
    
    const basicTab = screen.getByText('Básica')
    expect(basicTab).toBeInTheDocument()
  })
})

