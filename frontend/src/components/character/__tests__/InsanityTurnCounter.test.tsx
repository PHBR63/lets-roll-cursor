/**
 * Testes para o componente InsanityTurnCounter
 */
import { render, screen } from '@testing-library/react'
import { InsanityTurnCounter } from '../InsanityTurnCounter'
import { Character } from '@/types/character'

const mockCharacter: Character = {
  id: 'char-1',
  name: 'Test Character',
  campaign_id: 'camp-1',
  user_id: 'user-1',
  stats: {
    san: { current: 10, max: 100 },
  },
  conditionTimers: [],
}

describe('InsanityTurnCounter', () => {
  it('não deve renderizar quando SAN está normal', () => {
    const normalCharacter: Character = {
      ...mockCharacter,
      stats: {
        san: { current: 80, max: 100 },
      },
    }
    
    const { container } = render(
      <InsanityTurnCounter character={normalCharacter} />
    )
    
    expect(container.firstChild).toBeNull()
  })

  it('deve renderizar quando personagem está perturbado', () => {
    const insaneCharacter: Character = {
      ...mockCharacter,
      stats: {
        san: { current: 30, max: 100 },
      },
      conditionTimers: [
        { condition: 'INSANIDADE', duration: 5 },
      ],
    }
    
    render(<InsanityTurnCounter character={insaneCharacter} />)
    
    expect(screen.getByText(/Turnos em Insanidade: 5/i)).toBeInTheDocument()
  })

  it('deve mostrar aviso quando turnos >= 5', () => {
    const insaneCharacter: Character = {
      ...mockCharacter,
      stats: {
        san: { current: 10, max: 100 },
      },
      conditionTimers: [
        { condition: 'INSANIDADE', duration: 5 },
      ],
    }
    
    render(<InsanityTurnCounter character={insaneCharacter} />)
    
    expect(screen.getByText(/atenção/i)).toBeInTheDocument()
  })

  it('deve mostrar aviso crítico quando turnos >= 10', () => {
    const insaneCharacter: Character = {
      ...mockCharacter,
      stats: {
        san: { current: 0, max: 100 },
      },
      conditionTimers: [
        { condition: 'INSANIDADE', duration: 10 },
      ],
    }
    
    render(<InsanityTurnCounter character={insaneCharacter} />)
    
    expect(screen.getByText(/Estado crítico/i)).toBeInTheDocument()
  })
})

