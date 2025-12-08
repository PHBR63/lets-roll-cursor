/**
 * Testes para o componente InsanityIndicator
 */
import { render, screen } from '@testing-library/react'
import { InsanityIndicator } from '../InsanityIndicator'

describe('InsanityIndicator', () => {
  it('deve renderizar estado normal quando SAN está alta', () => {
    render(<InsanityIndicator currentSAN={80} maxSAN={100} />)
    
    expect(screen.getByText(/Sanidade normal/i)).toBeInTheDocument()
  })

  it('deve renderizar estado abalado quando SAN está entre 50-75%', () => {
    render(<InsanityIndicator currentSAN={60} maxSAN={100} />)
    
    expect(screen.getByText(/Mentalmente abalado/i)).toBeInTheDocument()
  })

  it('deve renderizar estado perturbado quando SAN está entre 25-50%', () => {
    render(<InsanityIndicator currentSAN={30} maxSAN={100} />)
    
    expect(screen.getByText(/Perturbado mentalmente/i)).toBeInTheDocument()
  })

  it('deve renderizar estado enlouquecendo quando SAN está entre 0-25%', () => {
    render(<InsanityIndicator currentSAN={10} maxSAN={100} />)
    
    expect(screen.getByText(/Enlouquecendo/i)).toBeInTheDocument()
  })

  it('deve renderizar estado totalmente insano quando SAN é 0', () => {
    render(<InsanityIndicator currentSAN={0} maxSAN={100} />)
    
    expect(screen.getByText(/Totalmente Insano/i)).toBeInTheDocument()
  })

  it('deve mostrar descrição quando showDescription é true', () => {
    render(<InsanityIndicator currentSAN={30} maxSAN={100} showDescription />)
    
    expect(screen.getByText(/SAN ≤ 50%/i)).toBeInTheDocument()
  })

  it('deve aplicar tamanho correto', () => {
    const { container } = render(
      <InsanityIndicator currentSAN={50} maxSAN={100} size="lg" />
    )
    
    expect(container.firstChild).toHaveClass('text-base')
  })
})

